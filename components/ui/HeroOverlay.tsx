'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

export function HeroOverlay() {
  const phase = useGameStore((s) => s.phase);
  const startDriving = useGameStore((s) => s.startDriving);
  const enterStation = useGameStore((s) => s.enterStation);

  return (
    <AnimatePresence>
      {phase === 'intro' && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7 }}
        >
          <motion.p
            className="mb-3 font-display text-xs tracking-[0.5em] text-neon-cyan/70"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            DIGITAL AGENCY
          </motion.p>

          <motion.h1
            className="font-display text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="neon-text">PIXEL</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink">
              WEB DEVELOPERS
            </span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-xl font-body text-lg text-slate-300 sm:text-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            We Build Digital Experiences That Move.
          </motion.p>

          <motion.div
            className="pointer-events-auto mt-10 flex flex-col items-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button className="btn-neon" onClick={startDriving}>
              ▸ Start Driving
            </button>
            <button
              className="btn-neon btn-neon-pink"
              onClick={() => {
                startDriving();
                setTimeout(() => enterStation('portfolio'), 300);
              }}
            >
              View Work
            </button>
          </motion.div>

          <motion.p
            className="mt-12 font-display text-[11px] tracking-[0.3em] text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            DRIVE WITH W A S D · DISCOVER EVERY ZONE
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
