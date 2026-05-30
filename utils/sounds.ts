/**
 * Multi-variant pooled sound manager with procedural Web Audio fallback.
 *
 * Each logical slot maps to a small *pool* of variant clips; on every play
 * we pick a random variant (avoiding the immediately preceding one) so
 * repeated impacts don't sound identical. If no variant has loaded yet,
 * a hand-tuned procedural synth fills in for the slot so the site has
 * audio even before files are sourced.
 *
 * Browser autoplay rules: the AudioContext is resumed inside the first user
 * gesture via armAudio().
 */

type SoundDef = {
  /** Pool of file URLs; one is picked at random per play. */
  variants: string[];
  /** Concurrent instances per variant — higher for sounds that fire often. */
  concurrent?: number;
  /** Master volume 0..1 for this slot. */
  volume?: number;
  /** Loopable (engine). */
  loop?: boolean;
};

/** Engine plays via the Web Audio path below (seamless looping + LFO wobble),
 *  so it's not in this DEFS table any more. */
const DEFS: Record<string, SoundDef> = {
  // Long musical horns (H key)
  horn: {
    variants: [
      '/audio/horns/horn-1.mp3',
      '/audio/horns/horn-2.mp3',
      '/audio/horns/horn-3.mp3',
    ],
    volume: 0.55,
    concurrent: 1,
  },
  // Short blip car horns (reserved for future use)
  carHorn: {
    variants: ['/audio/car-horns/car-horn-1.mp3', '/audio/car-horns/car-horn-2.mp3'],
    volume: 0.55,
    concurrent: 1,
  },
  // Car body thud — layered on top of the material sound on every hit
  carHit: {
    variants: [
      '/audio/car-hits/car-hit-1.mp3',
      '/audio/car-hits/car-hit-3.mp3',
      '/audio/car-hits/car-hit-4.mp3',
      '/audio/car-hits/car-hit-5.mp3',
    ],
    volume: 0.5,
    concurrent: 2,
  },
  // Stone / rock impacts
  brick: {
    variants: [
      '/audio/bricks/brick-1.mp3',
      '/audio/bricks/brick-2.mp3',
      '/audio/bricks/brick-4.mp3',
      '/audio/bricks/brick-6.mp3',
      '/audio/bricks/brick-7.mp3',
      '/audio/bricks/brick-8.mp3',
    ],
    volume: 0.5,
    concurrent: 2,
  },
  // Wood thuds — trees, station poles, letter blocks
  wood: {
    variants: ['/audio/wood-hits/wood-hit-1.mp3'],
    volume: 0.6,
    concurrent: 4,
  },
  pin: {
    variants: ['/audio/bowling/pin-1.mp3'],
    volume: 0.6,
    concurrent: 6,
  },
  area: {
    variants: ['/audio/ui/area-1.mp3'],
    volume: 0.6,
    concurrent: 1,
  },
  screech: {
    variants: ['/audio/screeches/screech-1.mp3'],
    volume: 0.45,
    concurrent: 1,
  },
  reveal: {
    variants: ['/audio/reveal/reveal-1.mp3'],
    volume: 0.6,
    concurrent: 1,
  },
};

type LoadedVariant = {
  pool: HTMLAudioElement[];
  cursor: number;
  ready: boolean;
  failed: boolean;
};
type LoadedSound = {
  def: SoundDef;
  variants: LoadedVariant[];
  lastVariantIdx: number;
};

const sounds: Record<string, LoadedSound> = {};
let armed = false;
let muted = false;
const lastPlayed: Record<string, number> = {};

/* ------------------------------------------------------------------ */
/* Web Audio context (for synth fallback + master mute ramp)           */
/* ------------------------------------------------------------------ */

let ac: AudioContext | null = null;
let masterGain: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function ctx(): AudioContext | null {
  if (ac) return ac;
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  try {
    ac = new AC();
  } catch {
    return null;
  }
  masterGain = ac.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(ac.destination);
  const len = ac.sampleRate;
  noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return ac;
}

/* ------------------------------------------------------------------ */
/* Engine via Web Audio: seamless loop + LFO wobble                    */
/* ------------------------------------------------------------------ */
/*
 * HTMLAudioElement looping inserts a tiny gap at the loop boundary that
 * the ear quickly latches onto. AudioBufferSourceNode with loop=true is
 * sample-accurate: no click, no gap. We also feed an LFO into the
 * source's playbackRate AudioParam so the pitch is never *perfectly*
 * still — even at steady speed it wobbles ±2–3%, which masks any
 * residual sense of the same waveform repeating.
 */
const ENGINE_FILE = '/audio/engines/1/low_off.mp3';
const ENGINE_MASTER_VOL = 0.28;

type EngineFile = {
  src: AudioBufferSourceNode;
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
};
let engineFile: EngineFile | null = null;
let engineLoadStarted = false;

async function loadEngineFile() {
  if (engineLoadStarted || engineFile) return;
  engineLoadStarted = true;
  const c = ctx();
  if (!c || !masterGain) return;
  try {
    const res = await fetch(ENGINE_FILE);
    if (!res.ok) return;
    const ab = await res.arrayBuffer();
    const buffer = await c.decodeAudioData(ab);
    if (!masterGain) return;

    const src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.playbackRate.value = 0.6;

    // Slow LFO drifts the playbackRate so the loop never sits perfectly still.
    const lfo = c.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.65;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(src.playbackRate);

    const gain = c.createGain();
    gain.gain.value = 0;

    src.connect(gain).connect(masterGain);
    src.start();
    lfo.start();

    engineFile = { src, gain, lfo, lfoGain };
    silenceSynthEngine();
  } catch {
    // file missing or decode failed — synth fallback keeps playing
  }
}

/* ------------------------------------------------------------------ */
/* Procedural engine (used until the file loop loads)                  */
/* ------------------------------------------------------------------ */

type EngineNodes = {
  lowOsc: OscillatorNode;
  midOsc: OscillatorNode;
  noise: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  out: GainNode;
};
let engineSynth: EngineNodes | null = null;

function startSynthEngine() {
  const c = ctx();
  if (!c || !masterGain || !noiseBuf || engineSynth) return;
  const lowOsc = c.createOscillator();
  lowOsc.type = 'sawtooth';
  lowOsc.frequency.value = 55;
  const midOsc = c.createOscillator();
  midOsc.type = 'square';
  midOsc.frequency.value = 110;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.015;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  filter.Q.value = 1.4;
  const out = c.createGain();
  out.gain.value = 0;
  lowOsc.connect(filter);
  midOsc.connect(filter);
  noise.connect(noiseGain).connect(filter);
  filter.connect(out);
  out.connect(masterGain);
  lowOsc.start();
  midOsc.start();
  noise.start();
  engineSynth = { lowOsc, midOsc, noise, filter, out };
}

function setSynthEngine(volume: number, rate: number) {
  startSynthEngine();
  if (!engineSynth || !ac) return;
  const t = ac.currentTime;
  const baseLow = 55 * rate;
  engineSynth.lowOsc.frequency.setTargetAtTime(baseLow, t, 0.06);
  engineSynth.midOsc.frequency.setTargetAtTime(baseLow * 2.02, t, 0.06);
  engineSynth.filter.frequency.setTargetAtTime(350 + rate * 900, t, 0.08);
  engineSynth.out.gain.setTargetAtTime(volume * 0.07, t, 0.1);
}
function silenceSynthEngine() {
  if (!engineSynth || !ac) return;
  engineSynth.out.gain.setTargetAtTime(0, ac.currentTime, 0.08);
}

/* ------------------------------------------------------------------ */
/* Procedural one-shot synth fallbacks (slot → synth fn)               */
/* ------------------------------------------------------------------ */

function synthThud(baseHz: number, decay: number, gain: number) {
  const c = ctx();
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseHz * 2.2, t);
  osc.frequency.exponentialRampToValueAtTime(baseHz, t + decay);
  const og = c.createGain();
  og.gain.setValueAtTime(gain, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + decay);
  osc.connect(og).connect(masterGain);
  osc.start(t);
  osc.stop(t + decay + 0.05);
}
function synthClack(centerHz: number, decay: number, gain: number) {
  const c = ctx();
  if (!c || !masterGain || !noiseBuf) return;
  const t = c.currentTime;
  const n = c.createBufferSource();
  n.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = centerHz;
  f.Q.value = 4;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + decay);
  n.connect(f).connect(g).connect(masterGain);
  n.start(t);
  n.stop(t + decay + 0.05);
}
function synthHorn() {
  const c = ctx();
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const dur = 0.42;
  const a = c.createOscillator();
  a.type = 'sawtooth';
  a.frequency.value = 220;
  const b = c.createOscillator();
  b.type = 'sawtooth';
  b.frequency.value = 277;
  const filt = c.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 1800;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.18, t + 0.02);
  g.gain.linearRampToValueAtTime(0.18, t + dur - 0.06);
  g.gain.linearRampToValueAtTime(0, t + dur);
  a.connect(filt);
  b.connect(filt);
  filt.connect(g).connect(masterGain);
  a.start(t);
  b.start(t);
  a.stop(t + dur);
  b.stop(t + dur);
}
function synthChime() {
  const c = ctx();
  if (!c || !masterGain) return;
  [659.25, 987.77].forEach((f, i) => {
    const t = c.currentTime + i * 0.09;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g).connect(masterGain!);
    o.start(t);
    o.stop(t + 0.5);
  });
}
function synthSweep() {
  const c = ctx();
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const dur = 0.5;
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(880, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.25, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(masterGain);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function synthScreech() {
  const c = ctx();
  if (!c || !masterGain || !noiseBuf) return;
  const t = c.currentTime;
  const dur = 0.5;
  const n = c.createBufferSource();
  n.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(2200, t);
  f.frequency.linearRampToValueAtTime(1400, t + dur);
  f.Q.value = 12;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(f).connect(g).connect(masterGain);
  n.start(t);
  n.stop(t + dur + 0.05);
}

const SYNTH: Record<string, (gain: number) => void> = {
  horn: () => synthHorn(),
  carHorn: () => synthHorn(),
  carHit: (g) => synthThud(85, 0.18, 0.3 * g),
  brick: (g) => synthClack(900, 0.14, 0.22 * g),
  wood: (g) => synthThud(110, 0.22, 0.3 * g),
  pin: (g) => synthClack(1600, 0.09, 0.2 * g),
  area: () => synthChime(),
  screech: () => synthScreech(),
  reveal: () => synthSweep(),
  // Synth-only — no file in the audio folder; used by the RESET PINS pad.
  reset: () => synthChime(),
};

/* ------------------------------------------------------------------ */
/* File loading (one pool per variant)                                 */
/* ------------------------------------------------------------------ */

function ensureLoaded(name: string): LoadedSound | null {
  const def = DEFS[name];
  if (!def) return null;
  if (sounds[name]) return sounds[name];

  const concurrent = def.concurrent ?? 1;
  const variants: LoadedVariant[] = def.variants.map((url) => {
    const v: LoadedVariant = { pool: [], cursor: 0, ready: false, failed: false };
    for (let i = 0; i < concurrent; i++) {
      const el = new Audio(url);
      el.preload = 'auto';
      el.volume = def.volume ?? 1;
      if (def.loop) el.loop = true;
      el.addEventListener('error', () => {
        v.failed = true;
      });
      el.addEventListener('canplaythrough', () => {
        v.ready = true;
      });
      v.pool.push(el);
    }
    return v;
  });

  sounds[name] = { def, variants, lastVariantIdx: -1 };
  return sounds[name];
}

function pickVariantIdx(s: LoadedSound): number {
  const ready: number[] = [];
  for (let i = 0; i < s.variants.length; i++) {
    const v = s.variants[i];
    if (v.ready && !v.failed) ready.push(i);
  }
  if (!ready.length) return -1;
  // Avoid the last one if we have alternatives — keeps repeats from feeling robotic.
  let pool = ready;
  if (ready.length > 1 && s.lastVariantIdx !== -1) {
    pool = ready.filter((i) => i !== s.lastVariantIdx);
    if (!pool.length) pool = ready;
  }
  const idx = pool[Math.floor(Math.random() * pool.length)];
  s.lastVariantIdx = idx;
  return idx;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function armAudio() {
  if (armed) return;
  armed = true;
  const c = ctx();
  if (c && c.state === 'suspended') void c.resume();
  startSynthEngine();
  // Fetch + decode the engine loop on the user gesture so it's ready by the
  // time the first frame after intro fires.
  void loadEngineFile();
}

export function setMuted(m: boolean) {
  muted = m;
  if (masterGain && ac) {
    masterGain.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.05);
  }
  for (const key in sounds) {
    for (const v of sounds[key].variants) {
      for (const el of v.pool) {
        if (el && !el.paused && muted) el.pause();
      }
    }
  }
}

export function playSound(name: string, throttleMs = 0, gain = 1) {
  if (!armed || muted) return;
  const now = performance.now();
  if (throttleMs > 0 && lastPlayed[name] && now - lastPlayed[name] < throttleMs)
    return;
  lastPlayed[name] = now;

  const s = ensureLoaded(name);
  if (s) {
    const idx = pickVariantIdx(s);
    if (idx >= 0) {
      const v = s.variants[idx];
      const el = v.pool[v.cursor];
      v.cursor = (v.cursor + 1) % v.pool.length;
      try {
        el.currentTime = 0;
        el.volume = Math.min(1, (s.def.volume ?? 1) * gain);
        // Small per-play pitch variation makes repeated samples feel organic.
        // playbackRate is supported by HTMLMediaElement across modern browsers.
        el.playbackRate = 0.94 + Math.random() * 0.12;
        void el.play();
        return;
      } catch {
        /* fall through to synth */
      }
    }
  }
  SYNTH[name]?.(gain);
}

/* Engine dynamics — combine normalized speed and positive acceleration into a
 * single "progress" 0..1 that drives both rate and volume. Asymmetric easing
 * (fast up, slow down) gives the real combustion-engine character: the moment
 * the gas is pressed, accel spikes and the engine revs before the car has
 * actually picked up speed. */
const ENGINE_SPEED_MUL = 2.5;
const ENGINE_ACCEL_MUL = 0.5;
const ENGINE_EASE_UP = 0.28; // per-frame
const ENGINE_EASE_DOWN = 0.12;
const ENGINE_RATE_MIN = 0.4;
const ENGINE_RATE_MAX = 1.45;
const ENGINE_VOL_MIN = 0.4;
const ENGINE_VOL_MAX = 1.0;

let engineProgress = 0;

export function updateEngine(speedN: number, accelN: number) {
  if (!armed) return;

  // Target progress from speed + positive acceleration.
  const target = Math.min(
    1,
    Math.abs(speedN) * ENGINE_SPEED_MUL + Math.max(0, accelN) * ENGINE_ACCEL_MUL
  );
  const ease = target > engineProgress ? ENGINE_EASE_UP : ENGINE_EASE_DOWN;
  engineProgress += (target - engineProgress) * ease;

  const rate = ENGINE_RATE_MIN + (ENGINE_RATE_MAX - ENGINE_RATE_MIN) * engineProgress;
  const vol = ENGINE_VOL_MIN + (ENGINE_VOL_MAX - ENGINE_VOL_MIN) * engineProgress;

  if (engineFile && ac) {
    silenceSynthEngine();
    const t = ac.currentTime;
    if (muted) {
      engineFile.gain.gain.setTargetAtTime(0, t, 0.05);
      return;
    }
    engineFile.src.playbackRate.setTargetAtTime(rate, t, 0.05);
    engineFile.gain.gain.setTargetAtTime(vol * ENGINE_MASTER_VOL, t, 0.08);
    // Wobble grows slightly with rate so high-RPM has a touch more shake.
    engineFile.lfoGain.gain.setTargetAtTime(0.015 + rate * 0.02, t, 0.1);
  } else if (muted) {
    silenceSynthEngine();
  } else {
    setSynthEngine(vol, rate);
  }
}

export function stopEngine() {
  silenceSynthEngine();
  if (engineFile && ac) {
    engineFile.gain.gain.setTargetAtTime(0, ac.currentTime, 0.05);
  }
}
