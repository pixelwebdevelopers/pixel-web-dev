'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CarModel } from './CarModel';
import { carState, resetCar } from '@/store/carState';
import { controls, useKeyboardControls } from '@/hooks/useControls';
import { useGameStore } from '@/store/useGameStore';
import { CAR_CONFIG, WORLD, STATIONS } from '@/utils/config';
import { STATIC_OBSTACLES, ROCK_STATES } from '@/utils/obstacles';
import {
  PIN_STATES,
  LETTER_STATES,
  BALL_STATES,
  BRICK_STATES,
  BOX_STATES,
  RESET_ZONES,
  resetKnockable,
  type Knockable,
} from '@/utils/knockables';
import { sampleHeightForCar, sampleSlope } from '@/utils/terrain';
import { clamp, damp } from '@/utils/math';
import { playSound, updateEngine, setMuted } from '@/utils/sounds';

/** Approx half-width of the car body for the collision circle. */
const CAR_RADIUS = 1.1;
/** Downward acceleration (units/sec²) applied while the car is airborne. */
const GRAVITY = 32;
/** Within this slack the car is considered "grounded" on the surface below. */
const GROUND_EPSILON = 0.05;

const _forward = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _flat = new THREE.Vector3();

export function CarController() {
  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);

  const phase = useGameStore((s) => s.phase);
  const activeStation = useGameStore((s) => s.activeStation);
  const setNearbyStation = useGameStore((s) => s.setNearbyStation);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const muted = useGameStore((s) => s.muted);

  useKeyboardControls();

  useEffect(() => {
    resetCar();
  }, []);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  const speedTimer = useRef(0);
  const lastNearby = useRef<string | null>(null);
  const lastEntered = useRef<string | null>(null);
  const wasDrifting = useRef(false);
  /** Previous frame's speed — for computing instantaneous acceleration. */
  const prevSpeed = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30); // clamp huge frames (tab switches)
    const cfg = CAR_CONFIG;

    // Freeze car physics while not driving or while reading a station panel.
    const locked = phase !== 'driving' || activeStation !== null;
    const c = locked
      ? { forward: 0, backward: 0, left: 0, right: 0, brake: true }
      : controls;

    // --- steering ---------------------------------------------------------
    const steerInput = c.right - c.left;
    carState.steer = damp(carState.steer, steerInput, 8, dt);
    const speedFactor = clamp(Math.abs(carState.speed) / 6, 0, 1);
    const dir = carState.speed >= 0 ? 1 : -1;
    carState.heading -= carState.steer * cfg.turnSpeed * speedFactor * dir * dt;

    // --- longitudinal -----------------------------------------------------
    const throttle = c.forward - c.backward;
    carState.speed += throttle * cfg.accel * dt;
    carState.speed -= carState.speed * cfg.drag * dt; // passive drag
    // Engine braking: with no throttle and no brake, slow more aggressively
    // so the car comes to rest within ~1.5s instead of coasting for 7+.
    if (throttle === 0 && !c.brake) {
      carState.speed -= carState.speed * 1.8 * dt;
    }
    if (c.brake) carState.speed -= carState.speed * 2.6 * dt; // handbrake slows
    carState.speed = clamp(carState.speed, -cfg.maxReverseSpeed, cfg.maxSpeed);
    // Higher snap threshold so residual creep can't keep the car drifting.
    if (Math.abs(carState.speed) < 0.15) {
      carState.speed = 0;
      // Once at rest, kill the residual velocity vector too so we don't
      // skate sideways from the last grip lerp.
      if (throttle === 0) {
        carState.velocity.x *= Math.exp(-6 * dt);
        carState.velocity.z *= Math.exp(-6 * dt);
      }
    }

    // --- velocity with grip / drift --------------------------------------
    _forward.set(Math.sin(carState.heading), 0, Math.cos(carState.heading));
    _desired.copy(_forward).multiplyScalar(carState.speed);
    const grip = c.brake ? cfg.handbrakeGrip : 1;
    // Lerp only the horizontal components — Y is handled by the gravity /
    // terrain code below, otherwise it'd be dragged back toward 0 every frame
    // and we'd never become airborne.
    const lerpAmt = 1 - Math.exp(-cfg.gripRecovery * grip * dt);
    carState.velocity.x += (_desired.x - carState.velocity.x) * lerpAmt;
    carState.velocity.z += (_desired.z - carState.velocity.z) * lerpAmt;
    carState.drifting = c.brake && Math.abs(carState.speed) > 8;
    if (carState.drifting && !wasDrifting.current) {
      playSound('screech', 300);
    }
    wasDrifting.current = carState.drifting;

    // --- integrate position with step-blocking ----------------------------
    // Snapshot pre-move position. If this frame's horizontal motion would
    // cause the ground level to jump up more than MAX_STEP_UP, the car is
    // about to drive into the side/back wall of a ramp — reject the move
    // and bleed velocity. Driving up the slope itself produces only a small
    // per-frame height change (≈ slope·speed·dt) so it passes the test.
    const MAX_STEP_UP = 0.5;
    const prevX = carState.position.x;
    const prevZ = carState.position.z;
    const prevGroundH = sampleHeightForCar(prevX, prevZ, carState.position.y);
    carState.position.x += carState.velocity.x * dt;
    carState.position.z += carState.velocity.z * dt;
    const tentativeH = sampleHeightForCar(
      carState.position.x,
      carState.position.z,
      carState.position.y
    );
    if (tentativeH - prevGroundH > MAX_STEP_UP) {
      carState.position.x = prevX;
      carState.position.z = prevZ;
      carState.velocity.x = 0;
      carState.velocity.z = 0;
      carState.speed *= 0.2;
      playSound('carHit', 200, 0.4);
    }

    // --- gravity + ramp / bridge height sampling -------------------------
    // Cliff-aware slope sample — see sampleSlope's docstring.
    const slope = sampleSlope(carState.position.x, carState.position.z, carState.position.y);
    const groundH = WORLD.groundY + slope.h;
    if (carState.position.y <= groundH + GROUND_EPSILON) {
      carState.position.y = groundH;
      carState.velocity.y =
        carState.velocity.x * slope.dhx + carState.velocity.z * slope.dhz;
    } else {
      // Airborne: free fall, with a re-check in case we landed this frame.
      carState.velocity.y -= GRAVITY * dt;
      carState.position.y += carState.velocity.y * dt;
      const reGround =
        WORLD.groundY +
        sampleHeightForCar(carState.position.x, carState.position.z, carState.position.y);
      if (carState.position.y < reGround) {
        carState.position.y = reGround;
        if (carState.velocity.y < 0) carState.velocity.y = 0;
      }
    }

    // --- collision against rooted props (trees, station poles) ----------
    for (const obs of STATIC_OBSTACLES) {
      const dx = carState.position.x - obs.x;
      const dz = carState.position.z - obs.z;
      const minD = CAR_RADIUS + obs.r;
      const d2 = dx * dx + dz * dz;
      if (d2 >= minD * minD || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const nz = dz / d;
      carState.position.x += nx * (minD - d);
      carState.position.z += nz * (minD - d);
      const vn = carState.velocity.x * nx + carState.velocity.z * nz;
      if (vn < 0) {
        carState.velocity.x -= vn * nx;
        carState.velocity.z -= vn * nz;
        const force = Math.min(1, Math.abs(vn) / 8);
        playSound('wood', 100, force);
        playSound('carHit', 100, force);
      }
      carState.speed *= 0.4;
    }

    // --- collision against knockable rocks ------------------------------
    for (const rock of ROCK_STATES) {
      const rx = rock.baseX + rock.offX;
      const rz = rock.baseZ + rock.offZ;
      const dx = carState.position.x - rx;
      const dz = carState.position.z - rz;
      const minD = CAR_RADIUS + rock.r;
      const d2 = dx * dx + dz * dz;
      if (d2 >= minD * minD || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const nz = dz / d;
      // launch the rock in the car's direction of travel — heavier rocks
      // (bigger scale) take a smaller share of the impulse
      const relVx = carState.velocity.x - rock.velX;
      const relVz = carState.velocity.z - rock.velZ;
      const closing = relVx * -nx + relVz * -nz; // how fast we're driving into it
      if (closing > 0) {
        const mass = rock.s; // 0.7..1.6
        const share = clamp(1.4 / (mass + 0.4), 0.4, 1.6);
        rock.velX += -nx * closing * share;
        rock.velZ += -nz * closing * share;
        rock.vrot += (Math.random() - 0.5) * closing * 0.8;
        const force = Math.min(1, closing / 10);
        playSound('brick', 80, force);
        playSound('carHit', 100, force * 0.7);
      }
      // resolve overlap by splitting based on mass: lighter rock moves more
      const carShare = rock.s / (rock.s + 1.0);
      const rockShare = 1 - carShare;
      const overlap = minD - d;
      carState.position.x += nx * overlap * carShare;
      carState.position.z += nz * overlap * carShare;
      rock.offX -= nx * overlap * rockShare;
      rock.offZ -= nz * overlap * rockShare;
      // car loses some speed but not as much as hitting a tree
      carState.speed *= 0.75;
    }

    // --- collision against pins + letter blocks (knockable + tippable) ---
    const knockGroups: Array<{
      list: Knockable[];
      tiltGain: number;
      speedKeep: number;
      materialSound: string;
      /** whether to layer a car-body thud on top */
      layerCarHit: boolean;
      throttleMs: number;
    }> = [
      {
        list: PIN_STATES,
        tiltGain: 2.4,
        speedKeep: 0.9,
        materialSound: 'pin',
        layerCarHit: false,
        throttleMs: 40,
      },
      {
        list: LETTER_STATES,
        tiltGain: 0.6,
        speedKeep: 0.6,
        materialSound: 'brick',
        layerCarHit: true,
        throttleMs: 80,
      },
      {
        list: BALL_STATES,
        tiltGain: 0,
        speedKeep: 0.7,
        materialSound: 'wood',
        layerCarHit: true,
        throttleMs: 80,
      },
      {
        list: BRICK_STATES,
        tiltGain: 3.0,
        speedKeep: 0.85,
        materialSound: 'brick',
        layerCarHit: false,
        throttleMs: 30,
      },
      {
        list: BOX_STATES,
        tiltGain: 1.6,
        speedKeep: 0.78,
        materialSound: 'wood',
        layerCarHit: false,
        throttleMs: 30,
      },
    ];
    for (const grp of knockGroups) {
      for (const p of grp.list) {
        const px = p.baseX + p.offX;
        const pz = p.baseZ + p.offZ;
        const dx = carState.position.x - px;
        const dz = carState.position.z - pz;
        const minD = CAR_RADIUS + p.r;
        const d2 = dx * dx + dz * dz;
        if (d2 >= minD * minD || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const nx = dx / d;
        const nz = dz / d;
        const relVx = carState.velocity.x - p.velX;
        const relVz = carState.velocity.z - p.velZ;
        const closing = relVx * -nx + relVz * -nz;
        if (closing > 0) {
          const share = clamp(1.4 / (p.mass + 0.4), 0.3, 2.2);
          p.velX += -nx * closing * share;
          p.velZ += -nz * closing * share;
          p.vrot += (Math.random() - 0.5) * closing * 0.6;
          // tip the prop away from the car
          p.tiltAxisX = nx;
          p.tiltAxisZ = nz;
          p.vtilt += (closing * grp.tiltGain) / Math.max(0.4, p.mass);
          const force = Math.min(1, closing / 8);
          playSound(grp.materialSound, grp.throttleMs, force);
          if (grp.layerCarHit) playSound('carHit', 100, force * 0.8);
        }
        const carShare = p.mass / (p.mass + 1.0);
        const propShare = 1 - carShare;
        const overlap = minD - d;
        carState.position.x += nx * overlap * carShare;
        carState.position.z += nz * overlap * carShare;
        p.offX -= nx * overlap * propShare;
        p.offZ -= nz * overlap * propShare;
        carState.speed *= grp.speedKeep;
      }
    }

    // --- reset zones (drive into a pad to respawn a group) ---------------
    for (const zone of RESET_ZONES) {
      const inside =
        Math.abs(carState.position.x - zone.x) < zone.size &&
        Math.abs(carState.position.z - zone.z) < zone.size;
      if (!inside) continue;
      playSound('reset', 600);
      for (const tag of zone.resets) {
        if (tag === 'pins') PIN_STATES.forEach(resetKnockable);
        else if (tag === 'letters') LETTER_STATES.forEach(resetKnockable);
        else if (tag === 'bricks') BRICK_STATES.forEach(resetKnockable);
        else if (tag === 'ball') BALL_STATES.forEach(resetKnockable);
        else if (tag === 'boxes') BOX_STATES.forEach(resetKnockable);
        else if (tag === 'rocks')
          ROCK_STATES.forEach((r) => {
            r.offX = 0;
            r.offZ = 0;
            r.velX = 0;
            r.velZ = 0;
            r.rotY = 0;
            r.vrot = 0;
          });
      }
    }

    // --- soft circular boundary ------------------------------------------
    _flat.set(carState.position.x, 0, carState.position.z);
    const dist = _flat.length();
    if (dist > WORLD.boundary) {
      const inward = _flat.clone().multiplyScalar(-1 / dist);
      carState.position.x = inward.x * -WORLD.boundary;
      carState.position.z = inward.z * -WORLD.boundary;
      carState.velocity.multiplyScalar(0.4);
      carState.speed *= 0.5;
    }

    // --- apply to scene graph --------------------------------------------
    if (group.current) {
      group.current.position.copy(carState.position);
      group.current.rotation.y = carState.heading;
    }
    if (tilt.current) {
      // body roll on turns + squat under accel for arcade juice
      const roll = -carState.steer * speedFactor * 0.12;
      const throttlePitch = clamp(-throttle * 0.04, -0.05, 0.05);
      // Slope-aware pitch: project the cliff-aware gradient onto the car's
      // heading vector so the body leans back going uphill and forward going
      // down. Reuses the same slope sample as the gravity branch.
      const sh = Math.sin(carState.heading);
      const ch = Math.cos(carState.heading);
      const slopeAlongHeading = slope.dhx * sh + slope.dhz * ch;
      const slopePitch = clamp(-Math.atan(slopeAlongHeading), -0.5, 0.5);
      const pitch = clamp(throttlePitch + slopePitch, -0.6, 0.6);
      tilt.current.rotation.z = damp(tilt.current.rotation.z, roll, 6, dt);
      tilt.current.rotation.x = damp(tilt.current.rotation.x, pitch, 6, dt);
    }

    // --- HUD speed (throttled) -------------------------------------------
    speedTimer.current += dt;
    if (speedTimer.current > 0.08) {
      speedTimer.current = 0;
      setSpeed(Math.abs(carState.speed));
    }

    // --- station proximity -----------------------------------------------
    // Hero is just the spawn point — never a trigger, or it would lock controls.
    let nearest: string | null = null;
    let nearestD = Infinity;
    for (const st of STATIONS) {
      if (st.id === 'hero') continue;
      const dx = carState.position.x - st.position[0];
      const dz = carState.position.z - st.position[2];
      const d = Math.hypot(dx, dz);
      if (d < st.radius && d < nearestD) {
        nearestD = d;
        nearest = st.id;
      }
    }
    if (nearest !== lastNearby.current) {
      lastNearby.current = nearest;
      setNearbyStation(nearest as never);
    }
    // auto-enter a station once mostly stopped inside it
    if (
      nearest &&
      nearest !== lastEntered.current &&
      Math.abs(carState.speed) < 4 &&
      !activeStation
    ) {
      lastEntered.current = nearest;
      playSound('area', 300);
      useGameStore.getState().enterStation(nearest as never);
    }
    if (!nearest) lastEntered.current = null;

    // --- engine loop ------------------------------------------------------
    // The engine dynamics layer takes raw normalized speed + positive
    // acceleration. Acceleration is critical: pressing the gas spikes accel
    // *before* speed has time to grow, so the engine revs immediately
    // instead of just smoothly tracking velocity. That's what stops the
    // loop from sounding like a repeating track.
    const driving = phase === 'driving' && !activeStation;
    const speedN = clamp(Math.abs(carState.speed) / cfg.maxSpeed, 0, 1);
    const dSpeed = carState.speed - prevSpeed.current;
    // Normalize acceleration against the max possible change in one frame.
    const accelN = clamp(dSpeed / (cfg.accel * Math.max(dt, 1e-3)), -1, 1);
    prevSpeed.current = carState.speed;
    if (driving) {
      updateEngine(speedN, accelN);
    } else {
      updateEngine(0, 0); // idle when in a station panel
    }
  });

  return (
    <group ref={group}>
      <group ref={tilt}>
        <CarModel />
      </group>
    </group>
  );
}
