'use client';

import { useFrame } from '@react-three/fiber';
import { PIN_STATES, LETTER_STATES, type Knockable } from '@/utils/knockables';

function integrate(props: Knockable[], opts: { tiltSpring: number }, dt: number) {
  const linDamp = Math.exp(-1.6 * dt);
  const rotDamp = Math.exp(-2.5 * dt);
  const tiltDamp = Math.exp(-1.8 * dt);
  for (const p of props) {
    p.offX += p.velX * dt;
    p.offZ += p.velZ * dt;
    p.velX *= linDamp;
    p.velZ *= linDamp;

    p.rotY += p.vrot * dt;
    p.vrot *= rotDamp;

    // tilt has its own velocity; optional weak spring pulls it back upright
    if (opts.tiltSpring > 0) {
      p.vtilt += -p.tilt * opts.tiltSpring * dt;
    }
    p.tilt += p.vtilt * dt;
    p.vtilt *= tiltDamp;
  }
}

export function KnockablesPhysics() {
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    // pins flop and stay down — no tilt recovery
    integrate(PIN_STATES, { tiltSpring: 0 }, dt);
    // letters are heavy: they tip but slowly stand back up
    integrate(LETTER_STATES, { tiltSpring: 1.2 }, dt);
  });
  return null;
}
