'use client';

import { useFrame } from '@react-three/fiber';
import { ROCK_STATES } from '@/utils/obstacles';

/**
 * Integrates the live state of every knockable rock each frame.
 * - Linear damping so launched rocks coast to a stop.
 * - Angular damping for spin.
 * - Soft "spring home" pull so a kicked rock drifts back to its base spot.
 */
export function RocksPhysics() {
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const linearDamp = Math.exp(-2.4 * dt); // bigger = faster stop
    const angularDamp = Math.exp(-3.0 * dt);
    const springK = 0.6; // pull back to base spot

    for (const r of ROCK_STATES) {
      // light spring toward base so things eventually settle near where they came from
      r.velX += -r.offX * springK * dt;
      r.velZ += -r.offZ * springK * dt;

      r.offX += r.velX * dt;
      r.offZ += r.velZ * dt;
      r.velX *= linearDamp;
      r.velZ *= linearDamp;

      r.rotY += r.vrot * dt;
      r.vrot *= angularDamp;
    }
  });
  return null;
}
