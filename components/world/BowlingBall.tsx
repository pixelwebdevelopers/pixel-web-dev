'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BALL_STATES, BALL_RADIUS } from '@/utils/knockables';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

/**
 * Heavy purple bowling ball. Renders from a Knockable state with rolling
 * rotation derived from the horizontal velocity, so when it's pushed across
 * the ground it visibly tumbles.
 */
function Ball({ idx }: { idx: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const state = BALL_STATES[idx];

  useFrame((_, rawDt) => {
    if (!root.current) return;
    const dt = Math.min(rawDt, 1 / 30);
    const dropY = dropStartedAt
      ? dropOffsetY((performance.now() - dropStartedAt) / 1000, dropDelay(idx + 920, 0.55, 0.4), 45, 1.0)
      : 0;
    root.current.position.x = state.baseX + state.offX;
    root.current.position.z = state.baseZ + state.offZ;
    // Ball sits on the ground; its center is BALL_RADIUS above.
    root.current.position.y = BALL_RADIUS + dropY;

    // Roll: rotate around the axis perpendicular to motion in the horizontal
    // plane. The angular speed is linear speed / radius.
    const sp = Math.hypot(state.velX, state.velZ);
    if (sp > 0.05) {
      const ang = (sp / BALL_RADIUS) * dt;
      const axX = -state.velZ / sp;
      const axZ = state.velX / sp;
      const q = new THREE.Quaternion();
      q.setFromAxisAngle(new THREE.Vector3(axX, 0, axZ), ang);
      root.current.quaternion.premultiply(q);
    }
  });

  return (
    <group ref={root}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#a36cd9" roughness={0.45} metalness={0.05} />
      </mesh>
      {/* three finger holes for the bowling look */}
      {[
        [0, 0.55, 0.7],
        [-0.25, 0.55, 0.55],
        [0.25, 0.55, 0.55],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#2a1f33" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function BowlingBall() {
  return (
    <group>
      {BALL_STATES.map((_, i) => (
        <Ball key={i} idx={i} />
      ))}
    </group>
  );
}
