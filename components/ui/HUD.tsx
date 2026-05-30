'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { carState } from '@/store/carState';
import { STATIONS, WORLD, CAR_CONFIG } from '@/utils/config';

export function HUD() {
  const phase = useGameStore((s) => s.phase);
  const speed = useGameStore((s) => s.speed);
  const muted = useGameStore((s) => s.muted);
  const toggleMuted = useGameStore((s) => s.toggleMuted);
  const nearbyStation = useGameStore((s) => s.nearbyStation);
  const activeStation = useGameStore((s) => s.activeStation);
  const enterStation = useGameStore((s) => s.enterStation);
  const isMobile = useGameStore((s) => s.isMobile);

  if (phase !== 'driving') return null;

  const near = STATIONS.find((s) => s.id === nearbyStation);
  const kmh = Math.round((speed / CAR_CONFIG.maxSpeed) * 220);

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {/* top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4 sm:p-6">
        <div className="glass-panel scanlines pointer-events-auto relative flex items-center gap-2 px-4 py-2">
          <span className="font-display text-sm font-bold tracking-widest text-neon-cyan neon-text">
            PIXEL
          </span>
          <span className="font-display text-[10px] tracking-[0.3em] text-slate-400">
            WEB DEVELOPERS
          </span>
        </div>

        <button
          onClick={toggleMuted}
          className="glass-panel pointer-events-auto flex h-10 w-10 items-center justify-center text-neon-cyan"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* speedometer */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
        <div className="glass-panel scanlines relative flex flex-col items-center px-5 py-3">
          <span className="font-display text-3xl font-black tabular-nums text-white sm:text-4xl">
            {kmh}
          </span>
          <span className="font-display text-[10px] tracking-[0.3em] text-neon-cyan/70">
            KM / H
          </span>
        </div>
      </div>

      {/* controls hint (desktop) */}
      {!isMobile && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="glass-panel flex items-center gap-3 px-4 py-2 font-display text-[11px] tracking-widest text-slate-300">
            <Key>W</Key> Accelerate <Key>S</Key> Brake <Key>A</Key>
            <Key>D</Key> Steer <Key>␣</Key> Drift
          </div>
        </div>
      )}

      <Minimap />

      {/* station prompt */}
      <AnimatePresence>
        {near && !activeStation && (
          <motion.div
            key={near.id}
            className="pointer-events-auto absolute left-1/2 top-20 -translate-x-1/2"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <button
              onClick={() => enterStation(near.id)}
              className="glass-panel neon-border flex items-center gap-3 px-5 py-2.5"
              style={{ borderColor: near.color }}
            >
              <span
                className="h-2 w-2 animate-pulse-glow rounded-full"
                style={{ background: near.color, boxShadow: `0 0 10px ${near.color}` }}
              />
              <span className="font-display text-sm tracking-widest text-white">
                {near.label.toUpperCase()}
              </span>
              <span className="font-display text-[10px] tracking-widest text-slate-400">
                — STOP TO ENTER
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border border-neon-cyan/40 bg-white/5 px-1.5 py-0.5 text-neon-cyan">
      {children}
    </kbd>
  );
}

/** Live top-down minimap reading the car state each frame. */
function Minimap() {
  const dot = useRef<SVGCircleElement>(null);
  const heading = useRef<SVGLineElement>(null);
  const SIZE = 150;
  const scale = SIZE / 2 / WORLD.boundary;

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const cx = SIZE / 2 + carState.position.x * scale;
      const cy = SIZE / 2 + carState.position.z * scale;
      if (dot.current) {
        dot.current.setAttribute('cx', String(cx));
        dot.current.setAttribute('cy', String(cy));
      }
      if (heading.current) {
        heading.current.setAttribute('x1', String(cx));
        heading.current.setAttribute('y1', String(cy));
        heading.current.setAttribute('x2', String(cx + Math.sin(carState.heading) * 8));
        heading.current.setAttribute('y2', String(cy + Math.cos(carState.heading) * 8));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scale]);

  return (
    <div className="glass-panel absolute left-4 top-20 hidden p-2 sm:block">
      <svg width={SIZE} height={SIZE} className="overflow-visible">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2} fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.25)" />
        {STATIONS.map((s) => (
          <circle
            key={s.id}
            cx={SIZE / 2 + s.position[0] * scale}
            cy={SIZE / 2 + s.position[2] * scale}
            r={3}
            fill={s.color}
          />
        ))}
        <line ref={heading} stroke="#fff" strokeWidth={2} />
        <circle ref={dot} r={3.5} fill="#fff" stroke="#22d3ee" strokeWidth={1.5} />
      </svg>
    </div>
  );
}
