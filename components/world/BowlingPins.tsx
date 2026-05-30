'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PIN_STATES } from '@/utils/knockables';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

const PIN_HEIGHT = 1.6;
const PIN_TOP_RADIUS = 0.32;
const PIN_BOTTOM_RADIUS = 0.42;

function Pin({ idx }: { idx: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const delay = dropDelay(idx + 1000, 0.4, 0.5);
  const state = PIN_STATES[idx];

  useFrame(() => {
    if (!root.current) return;
    const dropY = dropStartedAt
      ? dropOffsetY((performance.now() - dropStartedAt) / 1000, delay, 45, 0.9)
      : 0;
    root.current.position.x = state.baseX + state.offX;
    root.current.position.z = state.baseZ + state.offZ;
    root.current.position.y = dropY;
    root.current.rotation.y = state.rotY;
    // tilt the pin around the impact axis: clamp so it doesn't spin past 90°
    const t = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.tilt));
    root.current.rotation.z = -state.tiltAxisX * t;
    root.current.rotation.x = state.tiltAxisZ * t;
  });

  return (
    <group ref={root}>
      <mesh position={[0, PIN_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry
          args={[PIN_TOP_RADIUS, PIN_BOTTOM_RADIUS, PIN_HEIGHT, 12]}
        />
        <meshStandardMaterial color="#f5f1ea" roughness={0.6} flatShading />
      </mesh>
      {/* red stripe near the neck */}
      <mesh position={[0, PIN_HEIGHT * 0.78, 0]}>
        <cylinderGeometry args={[PIN_TOP_RADIUS + 0.01, PIN_TOP_RADIUS + 0.01, 0.18, 12]} />
        <meshStandardMaterial color="#e8472b" roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

export function BowlingPins() {
  return (
    <group>
      {PIN_STATES.map((_, i) => (
        <Pin key={i} idx={i} />
      ))}
    </group>
  );
}
