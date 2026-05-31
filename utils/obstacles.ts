import { STATIONS } from './config';

export type SceneItem = { x: number; z: number; s: number; r: number; c: string };

/** Live, mutable state for a knockable prop (rocks). */
export type Knockable = {
  baseX: number;
  baseZ: number;
  offX: number;
  offZ: number;
  velX: number;
  velZ: number;
  rotY: number;
  vrot: number;
  s: number;
  /** collision radius */
  r: number;
  /** base rotation from scatter (visual only) */
  baseRot: number;
  c: string;
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scatter(
  seed: number,
  count: number,
  colors: string[],
  minR: number,
  maxR: number
): SceneItem[] {
  const rng = mulberry32(seed);
  const items: SceneItem[] = [];
  let guard = 0;
  while (items.length < count && guard < count * 12) {
    guard++;
    const ang = rng() * Math.PI * 2;
    const rad = minR + rng() * (maxR - minR);
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;
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

export const TREE_COLORS = ['#a7d24a', '#c6e85a', '#86b733', '#bcdd4e'];
export const ROCK_COLORS = ['#e3ddd6', '#d4ccc4', '#cfc7bd'];

export const TREES: SceneItem[] = scatter(11, 18, TREE_COLORS, 22, 140);
const ROCK_ITEMS: SceneItem[] = scatter(77, 22, ROCK_COLORS, 20, 145);

/**
 * Live state for every rock. Position is `base + off`; offset and velocity
 * are integrated each frame in <RocksPhysics />. Rendered by Scenery.
 */
export const ROCK_STATES: Knockable[] = ROCK_ITEMS.map((r) => ({
  baseX: r.x,
  baseZ: r.z,
  offX: 0,
  offZ: 0,
  velX: 0,
  velZ: 0,
  rotY: 0,
  vrot: 0,
  s: r.s,
  // Collision radius now matches the visual horizontal extent so the car can't
  // push into the rock visually before being stopped.
  r: 1.45 * r.s,
  baseRot: r.r,
  c: r.c,
}));

export type StaticObstacle = {
  kind: 'tree' | 'pole';
  x: number;
  z: number;
  r: number;
};

/** Rooted props the car bounces off (rocks are handled separately). */
export const STATIC_OBSTACLES: StaticObstacle[] = [
  ...TREES.map<StaticObstacle>((t) => ({
    kind: 'tree',
    x: t.x,
    z: t.z,
    r: 0.6 * t.s,
  })),
];

// STATIONS is imported but no longer used here — keep the reference to
// preserve the existing API surface if other code relies on it.
void STATIONS;
