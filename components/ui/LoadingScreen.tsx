'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

const STEPS = [
  'Booting Pixel World…',
  'Forging neon roads…',
  'Assembling your car…',
  'Charging station beacons…',
  'Initializing Pixel World…',
];

export function LoadingScreen() {
  const phase = useGameStore((s) => s.phase);
  const loadProgress = useGameStore((s) => s.loadProgress);
  const finishLoading = useGameStore((s) => s.finishLoading);

  // The world is procedural, so drei's useProgress may never register assets.
  // Drive the bar primarily off elapsed time, then blend in any real asset
  // progress as a floor — this guarantees it always advances and completes.
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const DURATION = 2800; // ms ramp to 100%
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const timeRamp = Math.min(100, ((now - start) / DURATION) * 100);
      const target = Math.max(timeRamp, loadProgress);
      setDisplay((d) => d + (target - d) * 0.12);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loadProgress]);

  useEffect(() => {
    if (display >= 99.4 && phase === 'loading') {
      const t = setTimeout(finishLoading, 350);
      return () => clearTimeout(t);
    }
  }, [display, phase, finishLoading]);

  const pct = Math.round(display);
  const stepIndex = Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length));

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* animated grid backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34,211,238,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.12) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(circle at 50% 55%, black, transparent 70%)',
            }}
          />

          {/* car assembling animation */}
          <CarAssembly progress={pct} />

          <motion.h1
            className="mt-10 font-display text-2xl font-black tracking-[0.3em] text-neon-cyan neon-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            PIXEL WEB DEVELOPERS
          </motion.h1>

          <div className="mt-8 w-[min(420px,80vw)]">
            <div className="mb-2 flex justify-between font-display text-xs tracking-widest text-neon-cyan/80">
              <span>{STEPS[stepIndex]}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                style={{ width: `${pct}%`, boxShadow: '0 0 12px rgba(34,211,238,0.8)' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Wireframe car whose parts fly into place as progress climbs. */
function CarAssembly({ progress }: { progress: number }) {
  const parts = [
    { d: 'M30 70 h140 v18 h-140 z', delay: 0 }, // chassis
    { d: 'M55 52 h90 l-12 18 h-66 z', delay: 15 }, // cabin
    { d: 'M44 92 a14 14 0 1 0 0.1 0 z', delay: 35 }, // wheel L
    { d: 'M156 92 a14 14 0 1 0 0.1 0 z', delay: 35 }, // wheel R
    { d: 'M168 74 h10 v8 h-10 z', delay: 60 }, // headlight
  ];
  return (
    <svg width="220" height="130" viewBox="0 0 200 120" className="drop-shadow-[0_0_18px_rgba(34,211,238,0.6)]">
      {parts.map((p, i) => {
        const on = progress >= p.delay;
        return (
          <motion.path
            key={i}
            d={p.d}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
            initial={{ opacity: 0, pathLength: 0, y: -8 }}
            animate={on ? { opacity: 1, pathLength: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        );
      })}
    </svg>
  );
}
