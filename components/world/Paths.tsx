'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

/**
 * Light tile paths leading from spawn out to each destination. Each path is
 * a row of small flat tiles laid at regular intervals — purely cosmetic,
 * the car physics doesn't read them.
 */

type PathSpec = {
  from: [number, number];
  to: [number, number];
  /** How many tiles between (exclusive). */
  count: number;
  /** Tile size. */
  size?: number;
  /** Optional gap range expressed as [start, end] along the path's 0..1
   * parameter; tiles whose t falls inside the gap are skipped (for example,
   * to leave a clear slot where the bridge sits). */
  gap?: [number, number];
};

const PATHS: PathSpec[] = [
  // Spawn → Playground (skip tiles inside the bridge footprint)
  { from: [0, -3], to: [0, -65], count: 18, size: 1.6, gap: [0.55, 0.95] },
  // Spawn → Services
  { from: [0, -3], to: [40, -28], count: 12, size: 1.5 },
  // Spawn → Portfolio
  { from: [0, -3], to: [-44, -38], count: 14, size: 1.5 },
  // Spawn → Contact
  { from: [0, 3], to: [8, 60], count: 16, size: 1.5 },
];

function Path({ spec, dropOffset }: { spec: PathSpec; dropOffset: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);

  const tiles = useMemo(() => {
    const arr: { x: number; z: number }[] = [];
    for (let i = 0; i < spec.count; i++) {
      const t = (i + 1) / (spec.count + 1);
      if (spec.gap && t > spec.gap[0] && t < spec.gap[1]) continue;
      const x = spec.from[0] + (spec.to[0] - spec.from[0]) * t;
      const z = spec.from[1] + (spec.to[1] - spec.from[1]) * t;
      arr.push({ x, z });
    }
    return arr;
  }, [spec]);

  useFrame(() => {
    if (!root.current) return;
    const elapsed = dropStartedAt
      ? (performance.now() - dropStartedAt) / 1000
      : 0;
    root.current.position.y = dropOffsetY(elapsed, dropDelay(dropOffset, 0.3, 0.4), 30, 0.9);
  });

  const size = spec.size ?? 1.5;

  return (
    <group ref={root}>
      {tiles.map((tile, i) => (
        <mesh
          key={i}
          position={[tile.x, 0.05, tile.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#f0e6d6" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

export function Paths() {
  return (
    <group>
      {PATHS.map((spec, i) => (
        <Path key={i} spec={spec} dropOffset={i * 5 + 600} />
      ))}
    </group>
  );
}
