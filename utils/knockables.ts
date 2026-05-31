/**
 * Live, mutable state for any prop the car can knock around. Rocks have their
 * own list in obstacles.ts (they spring home). Pins, letter blocks, the
 * bowling ball, and brick-wall pieces live here.
 */
export type Knockable = {
  baseX: number;
  baseZ: number;
  /** Vertical home position. Used by stacked bricks; defaults to 0. */
  baseY: number;
  offX: number;
  offZ: number;
  /** Vertical offset (gravity drop for bricks); 0 for pins/letters/ball. */
  offY: number;
  velX: number;
  velZ: number;
  /** Vertical velocity (gravity for bricks). */
  velY: number;
  /** yaw spin */
  rotY: number;
  vrot: number;
  /** tilt — pins fall over, letters tip a bit */
  tilt: number;
  vtilt: number;
  /** tilt-axis direction (set on impact so the prop falls away from the car) */
  tiltAxisX: number;
  tiltAxisZ: number;
  /** higher = harder to move */
  mass: number;
  /** collision radius */
  r: number;
  /**
   * For bricks: while `true` the brick is held in its wall slot by springs.
   * Once it (or the brick supporting it from below) gets bumped far enough,
   * it flips `false`, the springs disengage, and gravity takes over.
   */
  isStable: boolean;
  /** Seconds the brick has been at rest on the floor — for auto-recovery. */
  restTime: number;
};

function k(
  baseX: number,
  baseZ: number,
  r: number,
  mass: number,
  baseY = 0
): Knockable {
  return {
    baseX,
    baseY,
    baseZ,
    offX: 0,
    offZ: 0,
    offY: 0,
    velX: 0,
    velZ: 0,
    velY: 0,
    rotY: 0,
    vrot: 0,
    tilt: 0,
    vtilt: 0,
    tiltAxisX: 1,
    tiltAxisZ: 0,
    mass,
    r,
    isStable: true,
    restTime: 0,
  };
}

export function resetKnockable(p: Knockable) {
  p.offX = 0;
  p.offZ = 0;
  p.offY = 0;
  p.velX = 0;
  p.velZ = 0;
  p.velY = 0;
  p.rotY = 0;
  p.vrot = 0;
  p.tilt = 0;
  p.vtilt = 0;
  p.isStable = true;
  p.restTime = 0;
}

/* ------------------------------------------------------------------ */
/* Playground layout — every play prop is anchored to PLAYGROUND_*    */
/* ------------------------------------------------------------------ */

/** Playground center (south of spawn). All props are positioned relative to this. */
export const PLAYGROUND = { x: 0, z: -100 };
/** Where the entrance signboard + reset pad sits (north edge). */
export const PLAYGROUND_ENTRANCE_Z = -70;

/* ------------------------------------------------------------------ */
/* Bowling pins — single rack on the west side of the playground       */
/* ------------------------------------------------------------------ */

const PIN_LANE_CENTER = { x: -18, z: PLAYGROUND.z - 12 }; // (-18, -112)
const PIN_RADIUS = 0.45;
const PIN_MASS = 0.3;
const PIN_SPACING = 1.6;

function trianglePins(centerX: number, centerZ: number): Knockable[] {
  // Lead pin (row 0) closest to +Z so a player approaching from spawn-side
  // hits it first. Row 3 (4 pins) is the back.
  const out: Knockable[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col <= row; col++) {
      const x = centerX + (col - row / 2) * PIN_SPACING;
      const z = centerZ - row * PIN_SPACING * 0.9;
      out.push(k(x, z, PIN_RADIUS, PIN_MASS));
    }
  }
  return out;
}

export const PIN_STATES: Knockable[] = trianglePins(PIN_LANE_CENTER.x, PIN_LANE_CENTER.z);

/* ------------------------------------------------------------------ */
/* Bowling ball — heavy sphere, single instance                         */
/* ------------------------------------------------------------------ */

export const BALL_RADIUS = 1.05;
export const BALL_MASS = 1.4;
/** Ball sits south of the pin lane so the player can shove it into the pins. */
export const BALL_STATES: Knockable[] = [
  k(PIN_LANE_CENTER.x, PIN_LANE_CENTER.z + 18, BALL_RADIUS, BALL_MASS),
];

/* ------------------------------------------------------------------ */
/* Brick wall — east side of the playground, 6 wide × 3 tall           */
/* ------------------------------------------------------------------ */

export const BRICK_W = 1.0;
export const BRICK_H = 0.5;
export const BRICK_D = 0.5;
const BRICK_COLS = 8;
const BRICK_ROWS = 12;
const BRICK_MASS = 0.18;
const BRICK_WALL_CENTER = { x: 20, z: PLAYGROUND.z - 12 }; // (20, -112)

function brickWall(centerX: number, centerZ: number): Knockable[] {
  const out: Knockable[] = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    // Stagger every other row for a masonry feel.
    const offsetX = (row % 2) * (BRICK_W / 2);
    for (let col = 0; col < BRICK_COLS; col++) {
      const x =
        centerX + (col - (BRICK_COLS - 1) / 2) * BRICK_W + offsetX - BRICK_W / 4;
      const baseY = row * BRICK_H + BRICK_H / 2;
      const brick = k(x, centerZ, BRICK_W * 0.45, BRICK_MASS, baseY);
      out.push(brick);
    }
  }
  return out;
}

export const BRICK_STATES: Knockable[] = brickWall(
  BRICK_WALL_CENTER.x,
  BRICK_WALL_CENTER.z
);

/* ------------------------------------------------------------------ */
/* Cardboard boxes — smashable stack east of the brick wall            */
/* ------------------------------------------------------------------ */

export const BOX_SIZE = 1.1;
const BOX_MASS = 0.22;
const BOX_STACK_CENTER = { x: 28, z: -100 };
const BOX_COLS = 3;
const BOX_ROWS = 4;

export const BOX_STATES: Knockable[] = (() => {
  const out: Knockable[] = [];
  for (let row = 0; row < BOX_ROWS; row++) {
    const colsThisRow = BOX_COLS - Math.floor(row / 2); // pyramid taper
    for (let col = 0; col < colsThisRow; col++) {
      const x =
        BOX_STACK_CENTER.x + (col - (colsThisRow - 1) / 2) * BOX_SIZE * 1.02;
      const baseY = row * BOX_SIZE + BOX_SIZE / 2;
      out.push(k(x, BOX_STACK_CENTER.z, BOX_SIZE * 0.5, BOX_MASS, baseY));
    }
  }
  return out;
})();

/**
 * Like BRICK_SUPPORTS — for each box, the box directly below it. Used by
 * cascade detection so the top of the pile falls when the base is knocked.
 */
export const BOX_SUPPORTS: number[] = (() => {
  const result: number[] = new Array(BOX_STATES.length).fill(-1);
  for (let i = 0; i < BOX_STATES.length; i++) {
    const me = BOX_STATES[i];
    if (me.baseY < BOX_SIZE * 0.9) continue;
    let bestIdx = -1;
    let bestDx = Infinity;
    for (let j = 0; j < BOX_STATES.length; j++) {
      if (i === j) continue;
      const other = BOX_STATES[j];
      if (Math.abs(other.baseY - (me.baseY - BOX_SIZE)) > 0.05) continue;
      const dx = Math.abs(other.baseX - me.baseX);
      if (dx < bestDx && dx < BOX_SIZE * 0.7) {
        bestDx = dx;
        bestIdx = j;
      }
    }
    result[i] = bestIdx;
  }
  return result;
})();

/**
 * For each brick, the index of the brick directly below it (one row down,
 * closest in X). -1 for bottom-row bricks (resting on the ground).
 *
 * Used by the brick physics to cascade falls: if my support brick has
 * been knocked, I lose stability too and fall via gravity.
 */
export const BRICK_SUPPORTS: number[] = (() => {
  const result: number[] = new Array(BRICK_STATES.length).fill(-1);
  for (let i = 0; i < BRICK_STATES.length; i++) {
    const me = BRICK_STATES[i];
    if (me.baseY < BRICK_H * 0.9) continue; // bottom row: ground supports
    let bestIdx = -1;
    let bestDx = Infinity;
    for (let j = 0; j < BRICK_STATES.length; j++) {
      if (i === j) continue;
      const other = BRICK_STATES[j];
      if (Math.abs(other.baseY - (me.baseY - BRICK_H)) > 0.05) continue;
      const dx = Math.abs(other.baseX - me.baseX);
      if (dx < bestDx && dx < BRICK_W * 0.7) {
        bestDx = dx;
        bestIdx = j;
      }
    }
    result[i] = bestIdx;
  }
  return result;
})();

/* ------------------------------------------------------------------ */
/* Big hittable 3D letters near spawn                                  */
/* ------------------------------------------------------------------ */

const LETTER_STRING = 'PIXEL WEB DEVELOPERS';
const LETTER_PITCH = 2.1;
const LETTER_SPACE_EXTRA = 1.1;
const LETTER_CENTER_Z = -20;
const LETTER_RADIUS = 1.0;
const LETTER_MASS = 1.8;

export type LetterEntry = {
  glyph: string;
  state: Knockable;
};

function buildLetters(): LetterEntry[] {
  const xs: number[] = [];
  let cursor = 0;
  for (let i = 0; i < LETTER_STRING.length; i++) {
    xs.push(cursor);
    cursor +=
      LETTER_STRING[i] === ' ' ? LETTER_PITCH + LETTER_SPACE_EXTRA : LETTER_PITCH;
  }
  const total = cursor - LETTER_PITCH;
  const shift = -total / 2;

  const out: LetterEntry[] = [];
  for (let i = 0; i < LETTER_STRING.length; i++) {
    const g = LETTER_STRING[i];
    if (g === ' ') continue;
    out.push({
      glyph: g,
      state: k(xs[i] + shift, LETTER_CENTER_Z, LETTER_RADIUS, LETTER_MASS),
    });
  }
  return out;
}

export const LETTERS: LetterEntry[] = buildLetters();
export const LETTER_STATES: Knockable[] = LETTERS.map((l) => l.state);

/* ------------------------------------------------------------------ */
/* Reset zones                                                         */
/* ------------------------------------------------------------------ */

export type ResetTag =
  | 'pins'
  | 'letters'
  | 'rocks'
  | 'bricks'
  | 'ball'
  | 'boxes';

export type ResetZone = {
  x: number;
  z: number;
  size: number;
  resets: ResetTag[];
  label: string;
};

export const RESET_ZONES: ResetZone[] = [
  // One reset pad inside the playground that restocks every playground prop.
  {
    x: 0,
    z: PLAYGROUND_ENTRANCE_Z - 6,
    size: 4,
    resets: ['pins', 'bricks', 'ball', 'boxes', 'letters'],
    label: 'RESET',
  },
];
