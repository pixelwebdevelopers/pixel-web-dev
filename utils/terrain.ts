/**
 * Static "terrain" pieces — ramps and raised platforms that the car can drive
 * over. Each piece has a footprint on the XZ plane and a vertical extent.
 *
 *   - **Ramps** are full wedges from `baseY` up to `baseY + h` at the slope
 *     top. They are solid: the car must approach from the slope-entry side;
 *     trying to enter from the sides or back hits a wall (enforced by the
 *     per-frame step-blocker in CarController).
 *   - **Platforms** are raised decks. They only count as ground when the car
 *     is near deck level — at lower Y the platform is invisible to physics so
 *     the car can drive under it.
 *
 * `baseY` is the Y-offset of the piece's base. For a spiral staircase each
 * segment starts at the previous segment's top.
 */

export type Ramp = {
  kind: 'ramp';
  x: number;
  z: number;
  rotY: number;
  w: number;
  d: number;
  h: number;
  /** Bottom of the wedge in world Y; defaults to 0. */
  baseY?: number;
  color?: string;
};

export type Platform = {
  kind: 'platform';
  x: number;
  z: number;
  rotY: number;
  w: number;
  d: number;
  h: number;
  /** Bottom of the deck in world Y; defaults to 0. */
  baseY?: number;
  color?: string;
};

export type TerrainPiece = Ramp | Platform;

const WOOD = '#d8b88a';
const WOOD_LIGHT = '#e9d5b0';

export const TERRAIN: TerrainPiece[] = [
  // ---- bridge: up-ramp, platform, down-ramp ----
  { kind: 'ramp', x: 0, z: -42, rotY: 0, w: 6, d: 8, h: 2.4, color: WOOD },
  { kind: 'platform', x: 0, z: -50, rotY: 0, w: 6, d: 8, h: 2.4, color: WOOD_LIGHT },
  { kind: 'ramp', x: 0, z: -58, rotY: Math.PI, w: 6, d: 8, h: 2.4, color: WOOD },

  // ---- playground jump ramp ----
  { kind: 'ramp', x: 22, z: -95, rotY: 0, w: 8, d: 10, h: 3.0, color: WOOD },
];

/** Threshold below which a platform is "above" the car (drive-under allowed). */
const PLATFORM_DECK_MARGIN = 0.5;
/** Threshold below which a stacked ramp segment is "above" the car. */
const RAMP_BELOW_MARGIN = 0.5;

/**
 * Height under the car at (x, z), taking the car's current Y into account.
 *   - Ramps with baseY > 0 are skipped when the car is well below their base
 *     so the player can drive under a stacked spiral segment.
 *   - Platforms only contribute when carY is close to deck height.
 */
export function sampleHeightForCar(x: number, z: number, carY: number): number {
  let max = 0;
  for (const t of TERRAIN) {
    const dx = x - t.x;
    const dz = z - t.z;
    const c = Math.cos(-t.rotY);
    const s = Math.sin(-t.rotY);
    const lx = dx * c - dz * s;
    const lz = dx * s + dz * c;
    if (Math.abs(lx) > t.w / 2 || Math.abs(lz) > t.d / 2) continue;
    const baseY = t.baseY ?? 0;
    let h: number;
    if (t.kind === 'platform') {
      if (carY < baseY + t.h - PLATFORM_DECK_MARGIN) continue;
      h = baseY + t.h;
    } else {
      // Ramp: if the car is well below the wedge's base, the wedge is
      // overhead — let the car drive under it (relevant for stacked spiral).
      if (carY < baseY - RAMP_BELOW_MARGIN) continue;
      const tt = (t.d / 2 - lz) / t.d;
      h = baseY + t.h * tt;
    }
    if (h > max) max = h;
  }
  return max;
}

/** Raw terrain top (no carY filtering). Used by the terrain renderer. */
export function sampleHeight(x: number, z: number): number {
  return sampleHeightForCar(x, z, Number.POSITIVE_INFINITY);
}

/**
 * Height + slope at (x, z) for a car at the given Y. Uses cliff-aware
 * one-sided sampling at ramp edges so the launch velocity is correct.
 */
export function sampleSlope(
  x: number,
  z: number,
  carY: number
): { h: number; dhx: number; dhz: number } {
  const eps = 0.6;
  const cliffDrop = 0.5;
  const h = sampleHeightForCar(x, z, carY);

  const hAheadX = sampleHeightForCar(x + eps, z, carY);
  const hBehindX = sampleHeightForCar(x - eps, z, carY);
  let dhx: number;
  if (hAheadX < h - cliffDrop) dhx = (h - hBehindX) / eps;
  else if (hBehindX < h - cliffDrop) dhx = (hAheadX - h) / eps;
  else dhx = (hAheadX - hBehindX) / (2 * eps);

  const hAheadZ = sampleHeightForCar(x, z + eps, carY);
  const hBehindZ = sampleHeightForCar(x, z - eps, carY);
  let dhz: number;
  if (hAheadZ < h - cliffDrop) dhz = (h - hBehindZ) / eps;
  else if (hBehindZ < h - cliffDrop) dhz = (hAheadZ - h) / eps;
  else dhz = (hAheadZ - hBehindZ) / (2 * eps);

  return { h, dhx, dhz };
}
