'use client';

import { useMemo } from 'react';
import { STATIONS } from '@/utils/config';

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TREE_COLORS = ['#a7d24a', '#c6e85a', '#86b733', '#bcdd4e'];
const ROCK_COLORS = ['#e3ddd6', '#d4ccc4', '#cfc7bd'];

type Item = { x: number; z: number; s: number; r: number; c: string };

function scatter(
  seed: number,
  count: number,
  colors: string[],
  minR: number,
  maxR: number
): Item[] {
  const rng = mulberry32(seed);
  const items: Item[] = [];
  let guard = 0;
  while (items.length < count && guard < count * 12) {
    guard++;
    const ang = rng() * Math.PI * 2;
    const rad = minR + rng() * (maxR - minR);
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;
    // keep clear of the spawn and every station footprint
    if (Math.hypot(x, z) < 16) continue;
    if (
      STATIONS.some(
        (st) => Math.hypot(x - st.position[0], z - st.position[2]) < st.radius + 6
      )
    )
      continue;
    items.push({
      x,
      z,
      s: 0.7 + rng() * 0.9,
      r: rng() * Math.PI * 2,
      c: colors[(rng() * colors.length) | 0],
    });
  }
  return items;
}

function Tree({ item }: { item: Item }) {
  const trunkH = 1.4 * item.s;
  const folH = (4 + item.s * 3) * 1;
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.r, 0]} scale={item.s}>
      <mesh position={[0, trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, trunkH, 6]} />
        <meshStandardMaterial color="#9aa0a8" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, trunkH + folH / 2, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.9, folH, 6]} />
        <meshStandardMaterial color={item.c} roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function Rock({ item }: { item: Item }) {
  return (
    <mesh
      position={[item.x, item.s * 0.4, item.z]}
      rotation={[item.r * 0.3, item.r, item.r * 0.2]}
      scale={[item.s * 1.4, item.s, item.s * 1.3]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={item.c} roughness={1} flatShading />
    </mesh>
  );
}

export function Scenery() {
  const trees = useMemo(() => scatter(11, 46, TREE_COLORS, 22, 230), []);
  const rocks = useMemo(() => scatter(77, 60, ROCK_COLORS, 20, 240), []);

  return (
    <group>
      {trees.map((t, i) => (
        <Tree key={`t${i}`} item={t} />
      ))}
      {rocks.map((r, i) => (
        <Rock key={`r${i}`} item={r} />
      ))}
    </group>
  );
}
