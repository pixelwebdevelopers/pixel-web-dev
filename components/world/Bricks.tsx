'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRICK_STATES, BRICK_W, BRICK_H, BRICK_D } from '@/utils/knockables';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

const BRICK_COLORS = ['#f5f1ea', '#ece4d4', '#f0e8d8'];

function Brick({ idx }: { idx: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const state = BRICK_STATES[idx];
  const color = BRICK_COLORS[idx % BRICK_COLORS.length];

  useFrame(() => {
    if (!root.current) return;
    const dropY = dropStartedAt
      ? dropOffsetY((performance.now() - dropStartedAt) / 1000, dropDelay(idx + 1300, 0.7, 0.4), 50, 1.0)
      : 0;
    root.current.position.x = state.baseX + state.offX;
    root.current.position.z = state.baseZ + state.offZ;
    root.current.rotation.y = state.rotY;
    const t = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, state.tilt));
    root.current.rotation.z = -state.tiltAxisX * t;
    root.current.rotation.x = state.tiltAxisZ * t;
    // Floor-clip compensation: rotating a cuboid around its center sends a
    // bottom corner below baseY. Lift the brick by the rotation-induced
    // vertical extent so the lowest corner stays on the floor.
    const sinT = Math.abs(Math.sin(t));
    const cosT = Math.abs(Math.cos(t));
    const horizontalHalf =
      Math.abs(state.tiltAxisX) * (BRICK_W / 2) +
      Math.abs(state.tiltAxisZ) * (BRICK_D / 2);
    const lift = horizontalHalf * sinT + (BRICK_H / 2) * cosT - BRICK_H / 2;
    root.current.position.y =
      state.baseY + state.offY + dropY + Math.max(0, lift);
  });

  return (
    <group ref={root}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BRICK_W, BRICK_H, BRICK_D]} />
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

export function Bricks() {
  return (
    <group>
      {BRICK_STATES.map((_, i) => (
        <Brick key={i} idx={i} />
      ))}
    </group>
  );
}
