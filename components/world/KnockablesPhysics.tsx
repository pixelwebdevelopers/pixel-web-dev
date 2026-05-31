'use client';

import { useFrame } from '@react-three/fiber';
import {
  PIN_STATES,
  LETTER_STATES,
  BALL_STATES,
  BRICK_STATES,
  BRICK_SUPPORTS,
  BRICK_H,
  BRICK_W,
  BRICK_D,
  BOX_STATES,
  BOX_SUPPORTS,
  BOX_SIZE,
  type Knockable,
} from '@/utils/knockables';
import { playSound } from '@/utils/sounds';

const GRAVITY = 32;
/** Displacement at which a stackable is considered "knocked". */
const STACK_KNOCK_RADIUS = 0.4;
/** Seconds a stackable must lie still before it auto-recovers. */
const STACK_RECOVERY_DELAY = 3.0;
/** Velocity below which a stackable is considered "resting". */
const STACK_REST_VEL = 0.4;

function integrate(
  props: Knockable[],
  opts: {
    tiltSpring: number;
    posSpring: number;
    rotSpring?: number;
    linDamp?: number;
    rotDamp?: number;
    tiltDamp?: number;
  },
  dt: number
) {
  const linDamp = Math.exp(-(opts.linDamp ?? 2.2) * dt);
  const rotDamp = Math.exp(-(opts.rotDamp ?? 3.0) * dt);
  const tiltDamp = Math.exp(-(opts.tiltDamp ?? 2.6) * dt);
  const rotSpring = opts.rotSpring ?? 0;
  for (const p of props) {
    if (opts.posSpring > 0) {
      p.velX += -p.offX * opts.posSpring * dt;
      p.velZ += -p.offZ * opts.posSpring * dt;
    }
    p.offX += p.velX * dt;
    p.offZ += p.velZ * dt;
    p.velX *= linDamp;
    p.velZ *= linDamp;

    if (rotSpring > 0) p.vrot += -p.rotY * rotSpring * dt;
    p.rotY += p.vrot * dt;
    p.vrot *= rotDamp;

    if (opts.tiltSpring > 0) p.vtilt += -p.tilt * opts.tiltSpring * dt;
    p.tilt += p.vtilt * dt;
    p.vtilt *= tiltDamp;
  }
}

/**
 * Stackable-prop physics (bricks, boxes, any future stacked tower):
 *
 *   1. **Cascade detection** — if a piece (or its supporting piece below) has
 *      been displaced past STACK_KNOCK_RADIUS, the piece flips to unstable
 *      and the springs that hold it in the stack disengage.
 *   2. **Stable pieces** use 3D springs (X, Y, Z) so a fallen piece that
 *      transitions back to stable smoothly lifts up to its slot.
 *   3. **Unstable pieces** get gravity on velY and free-fall to the floor.
 *      After lying still for STACK_RECOVERY_DELAY seconds, the piece flips
 *      back to stable and springs into place.
 *   4. **Piece-vs-piece collision** (sphere approximation) prevents
 *      interpenetration.
 */
function integrateStackables(
  items: Knockable[],
  supports: number[],
  size: number,
  dt: number
) {
  const floorY = size * 0.5;
  const collisionR = size * 0.5;
  // First pass: cascade unstable state up the stack.
  for (let i = 0; i < items.length; i++) {
    const b = items[i];
    if (!b.isStable) continue;
    if (Math.hypot(b.offX, b.offZ) > STACK_KNOCK_RADIUS) {
      b.isStable = false;
      b.restTime = 0;
      continue;
    }
    const supIdx = supports[i];
    if (supIdx >= 0 && !items[supIdx].isStable) {
      b.isStable = false;
      b.restTime = 0;
    }
  }

  const linDampStable = Math.exp(-4.0 * dt);
  const linDampFalling = Math.exp(-1.4 * dt);
  const rotDamp = Math.exp(-3.0 * dt);
  const tiltDamp = Math.exp(-2.6 * dt);

  // Second pass: integrate.
  for (const b of items) {
    if (b.isStable) {
      b.velX += -b.offX * 5.0 * dt;
      b.velY += -b.offY * 8.0 * dt;
      b.velZ += -b.offZ * 5.0 * dt;
      b.offX += b.velX * dt;
      b.offY += b.velY * dt;
      b.offZ += b.velZ * dt;
      b.velX *= linDampStable;
      b.velY *= linDampStable;
      b.velZ *= linDampStable;

      b.vrot += -b.rotY * 5.0 * dt;
      b.rotY += b.vrot * dt;
      b.vrot *= rotDamp;

      b.vtilt += -b.tilt * 6.0 * dt;
      b.tilt += b.vtilt * dt;
      b.vtilt *= tiltDamp;
    } else {
      b.velY -= GRAVITY * dt;
      b.offY += b.velY * dt;
      b.offX += b.velX * dt;
      b.offZ += b.velZ * dt;
      b.velX *= linDampFalling;
      b.velZ *= linDampFalling;

      b.rotY += b.vrot * dt;
      b.vrot *= rotDamp;
      b.tilt += b.vtilt * dt;
      b.vtilt *= tiltDamp;

      const worldY = b.baseY + b.offY;
      if (worldY < floorY) {
        b.offY = floorY - b.baseY;
        b.velY = -b.velY * 0.25;
        if (Math.abs(b.velY) < 0.6) b.velY = 0;
        b.velX *= 0.7;
        b.velZ *= 0.7;
      }

      const speed = Math.hypot(b.velX, b.velY, b.velZ);
      const onFloor = b.baseY + b.offY <= floorY + 0.05;
      if (speed < STACK_REST_VEL && onFloor) {
        b.restTime += dt;
        if (b.restTime > STACK_RECOVERY_DELAY) {
          b.isStable = true;
          b.restTime = 0;
          b.velX *= 0.3;
          b.velY *= 0.3;
          b.velZ *= 0.3;
        }
      } else {
        b.restTime = 0;
      }
    }
  }

  // Third pass: piece-vs-piece sphere collisions.
  const minD = collisionR * 2;
  const minD2 = minD * minD;
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j];
      if (a.isStable && b.isStable) continue;
      const dx = a.baseX + a.offX - (b.baseX + b.offX);
      const dy = a.baseY + a.offY - (b.baseY + b.offY);
      const dz = a.baseZ + a.offZ - (b.baseZ + b.offZ);
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= minD2 || d2 < 1e-6) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      const nz = dz / d;
      const overlap = minD - d;
      const aShare = a.isStable ? 0.05 : 0.5;
      const bShare = b.isStable ? 0.05 : 0.5;
      const totalShare = aShare + bShare || 1;
      a.offX += (nx * overlap * aShare) / totalShare;
      a.offY += (ny * overlap * aShare) / totalShare;
      a.offZ += (nz * overlap * aShare) / totalShare;
      b.offX -= (nx * overlap * bShare) / totalShare;
      b.offY -= (ny * overlap * bShare) / totalShare;
      b.offZ -= (nz * overlap * bShare) / totalShare;
      const rvx = a.velX - b.velX;
      const rvy = a.velY - b.velY;
      const rvz = a.velZ - b.velZ;
      const vn = rvx * nx + rvy * ny + rvz * nz;
      if (vn < 0) {
        const jImp = -vn * 0.5;
        a.velX += nx * jImp;
        a.velY += ny * jImp;
        a.velZ += nz * jImp;
        b.velX -= nx * jImp;
        b.velY -= ny * jImp;
        b.velZ -= nz * jImp;
      }
    }
  }
}

// Use BRICK_W/D for spacing checks but pass BRICK_H as the effective size to
// the generic integrator. The brick collision radius derives from the larger
// of W/D so the layered wall doesn't self-collide while standing.
const BRICK_SIZE_FOR_COLLISION = Math.max(BRICK_W, BRICK_D, BRICK_H);

function ballHitsPins(_dt: number) {
  for (const ball of BALL_STATES) {
    if (Math.hypot(ball.velX, ball.velZ) < 0.4) continue;
    const bx = ball.baseX + ball.offX;
    const bz = ball.baseZ + ball.offZ;
    for (const pin of PIN_STATES) {
      const px = pin.baseX + pin.offX;
      const pz = pin.baseZ + pin.offZ;
      const dx = px - bx;
      const dz = pz - bz;
      const minD = ball.r + pin.r;
      const d2 = dx * dx + dz * dz;
      if (d2 >= minD * minD || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const nz = dz / d;
      const rvx = pin.velX - ball.velX;
      const rvz = pin.velZ - ball.velZ;
      const closing = rvx * -nx + rvz * -nz;
      if (closing < 0) {
        const j = -closing * 1.6;
        pin.velX += nx * j * 1.4;
        pin.velZ += nz * j * 1.4;
        pin.vtilt += closing * 1.8;
        pin.tiltAxisX = -nx;
        pin.tiltAxisZ = -nz;
        ball.velX -= nx * j * 0.15;
        ball.velZ -= nz * j * 0.15;
        playSound('pin', 30, Math.min(1, Math.abs(closing) / 6));
      }
      const overlap = minD - d;
      pin.offX += nx * overlap * 0.6;
      pin.offZ += nz * overlap * 0.6;
      ball.offX -= nx * overlap * 0.4;
      ball.offZ -= nz * overlap * 0.4;
    }
  }
}

export function KnockablesPhysics() {
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    integrate(PIN_STATES, { tiltSpring: 0, posSpring: 0 }, dt);
    integrate(
      LETTER_STATES,
      { tiltSpring: 6.0, posSpring: 3.5, rotSpring: 5.0, linDamp: 3.0 },
      dt
    );
    integrate(
      BALL_STATES,
      { tiltSpring: 0, posSpring: 0, linDamp: 0.6, rotDamp: 1.5, tiltDamp: 1 },
      dt
    );
    // Stackable towers: bricks + cardboard boxes share the same physics.
    integrateStackables(BRICK_STATES, BRICK_SUPPORTS, BRICK_SIZE_FOR_COLLISION, dt);
    integrateStackables(BOX_STATES, BOX_SUPPORTS, BOX_SIZE, dt);
    ballHitsPins(dt);
  });
  return null;
}
