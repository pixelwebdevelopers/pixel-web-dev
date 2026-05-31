'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BOX_STATES, BOX_SIZE } from '@/utils/knockables';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

const BOX_COLORS = ['#c9986a', '#b88858', '#d3a575'];

function Box({ idx }: { idx: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const state = BOX_STATES[idx];
  const color = BOX_COLORS[idx % BOX_COLORS.length];

  useFrame(() => {
    if (!root.current) return;
    const dropY = dropStartedAt
      ? dropOffsetY((performance.now() - dropStartedAt) / 1000, dropDelay(idx + 1650, 0.6, 0.4), 50, 1.0)
      : 0;
    root.current.position.x = state.baseX + state.offX;
    root.current.position.z = state.baseZ + state.offZ;
    root.current.rotation.y = state.rotY;
    const t = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, state.tilt));
    root.current.rotation.z = -state.tiltAxisX * t;
    root.current.rotation.x = state.tiltAxisZ * t;
    // Floor-clip compensation. For a cube rotated by t, the bottom corner
    // dips (s/2)(|sin t| + |cos t| - 1) below the center, so add that lift.
    const sinT = Math.abs(Math.sin(t));
    const cosT = Math.abs(Math.cos(t));
    const lift = (BOX_SIZE / 2) * (sinT + cosT) - BOX_SIZE / 2;
    root.current.position.y =
      state.baseY + state.offY + dropY + Math.max(0, lift);
  });

  return (
    <group ref={root}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
      {/* dark tape stripe across the top */}
      <mesh position={[0, BOX_SIZE / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BOX_SIZE * 0.2, BOX_SIZE]} />
        <meshStandardMaterial color="#7d5a36" roughness={0.95} />
      </mesh>
    </group>
  );
}

export function CardboardBoxes() {
  return (
    <group>
      {BOX_STATES.map((_, i) => (
        <Box key={i} idx={i} />
      ))}
    </group>
  );
}
