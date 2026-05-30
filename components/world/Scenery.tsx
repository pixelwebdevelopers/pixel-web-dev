'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREES, ROCK_STATES, type SceneItem, type Knockable } from '@/utils/obstacles';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

function Tree({ item, dropIdx }: { item: SceneItem; dropIdx: number }) {
  const group = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const delay = dropDelay(dropIdx, 0.1, 1.1);

  useFrame(() => {
    if (!group.current || !dropStartedAt) return;
    const elapsed = (performance.now() - dropStartedAt) / 1000;
    group.current.position.y = dropOffsetY(elapsed, delay, 50, 1.0);
  });

  const trunkH = 1.4 * item.s;
  const folH = (4 + item.s * 3) * 1;
  return (
    <group ref={group} position={[item.x, 50, item.z]}>
      <group rotation={[0, item.r, 0]} scale={item.s}>
        <mesh position={[0, trunkH / 2, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.26, trunkH, 6]} />
          <meshStandardMaterial color="#9aa0a8" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, trunkH + folH / 2, 0]} castShadow>
          <cylinderGeometry args={[1.5, 1.9, folH, 6]} />
          <meshStandardMaterial color={item.c} roughness={1} flatShading />
        </mesh>
      </group>
    </group>
  );
}

function Rock({ state, dropIdx }: { state: Knockable; dropIdx: number }) {
  const group = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const delay = dropDelay(dropIdx + 200, 0.1, 1.2);

  useFrame(() => {
    if (!group.current) return;
    const dropY = dropStartedAt
      ? dropOffsetY((performance.now() - dropStartedAt) / 1000, delay, 50, 1.0)
      : 0;
    group.current.position.x = state.baseX + state.offX;
    group.current.position.z = state.baseZ + state.offZ;
    group.current.position.y = dropY;
    group.current.rotation.y = state.baseRot + state.rotY;
  });

  return (
    <group ref={group}>
      <mesh
        position={[0, state.s * 0.4, 0]}
        rotation={[state.baseRot * 0.3, 0, state.baseRot * 0.2]}
        scale={[state.s * 1.4, state.s, state.s * 1.3]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={state.c} roughness={1} flatShading />
      </mesh>
    </group>
  );
}

export function Scenery() {
  return (
    <group>
      {TREES.map((t, i) => (
        <Tree key={`t${i}`} item={t} dropIdx={i} />
      ))}
      {ROCK_STATES.map((r, i) => (
        <Rock key={`r${i}`} state={r} dropIdx={i} />
      ))}
    </group>
  );
}
