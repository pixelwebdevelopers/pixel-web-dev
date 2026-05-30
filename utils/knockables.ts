/**
 * Live, mutable state for any prop the car can knock around. Rocks have their
 * own list in obstacles.ts (they spring home). Pins and letter blocks live
 * here — they stay where they were knocked until a reset zone fires.
 */
export type Knockable = {
  baseX: number;
  baseZ: number;
  offX: number;
  offZ: number;
  velX: number;
  velZ: number;
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
};

function k(baseX: number, baseZ: number, r: number, mass: number): Knockable {
  return {
    baseX,
    baseZ,
    offX: 0,
    offZ: 0,
    velX: 0,
    velZ: 0,
    rotY: 0,
    vrot: 0,
    tilt: 0,
    vtilt: 0,
    tiltAxisX: 1,
    tiltAxisZ: 0,
    mass,
    r,
  };
}

export function resetKnockable(p: Knockable) {
  p.offX = 0;
  p.offZ = 0;
  p.velX = 0;
  p.velZ = 0;
  p.rotY = 0;
  p.vrot = 0;
  p.tilt = 0;
  p.vtilt = 0;
}

/* ------------------------------------------------------------------ */
/* Bowling pins                                                        */
/* ------------------------------------------------------------------ */

const PIN_LANE_CENTER = { x: 80, z: -110 };
const PIN_RADIUS = 0.45;
const PIN_MASS = 0.3;
const PIN_SPACING = 1.6;

function trianglePins(): Knockable[] {
  // 1 + 2 + 3 + 4 = 10 pins arranged like a bowling rack, point facing -Z so
  // the car approaching from +Z hits the lead pin first.
  const out: Knockable[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col <= row; col++) {
      const x = PIN_LANE_CENTER.x + (col - row / 2) * PIN_SPACING;
      const z = PIN_LANE_CENTER.z - row * PIN_SPACING * 0.9;
      out.push(k(x, z, PIN_RADIUS, PIN_MASS));
    }
  }
  return out;
}

export const PIN_STATES: Knockable[] = trianglePins();

/* ------------------------------------------------------------------ */
/* Big hittable 3D letters near spawn                                  */
/* ------------------------------------------------------------------ */

const LETTER_STRING = 'PIXEL WEB DEVELOPERS';
const LETTER_PITCH = 3.0; // X distance between consecutive characters
const LETTER_SPACE_EXTRA = 1.4; // extra gap added on top of pitch for a space
const LETTER_CENTER_Z = -22;
const LETTER_RADIUS = 1.4;
const LETTER_MASS = 2.2;

export type LetterEntry = {
  glyph: string;
  state: Knockable;
};

function buildLetters(): LetterEntry[] {
  // First pass: compute the X of every character (spaces included) so the
  // whole phrase can be centered around X=0.
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
/** Flat list of letter states for collision + physics iteration. */
export const LETTER_STATES: Knockable[] = LETTERS.map((l) => l.state);

/* ------------------------------------------------------------------ */
/* Reset zones                                                         */
/* ------------------------------------------------------------------ */

export type ResetZone = {
  x: number;
  z: number;
  size: number;
  /** which knockable groups to respawn when triggered */
  resets: Array<'pins' | 'letters' | 'rocks'>;
  label: string;
};

export const RESET_ZONES: ResetZone[] = [
  // next to the bowling rack — restocks the pins
  {
    x: PIN_LANE_CENTER.x,
    z: PIN_LANE_CENTER.z + 14,
    size: 4,
    resets: ['pins'],
    label: 'RESET PINS',
  },
];
