'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

export function HeroOverlay() {
  const phase = useGameStore((s) => s.phase);

  return (
    <AnimatePresence>
      {phase === 'intro' && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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
            className="mt-12 font-display text-[11px] tracking-[0.3em] text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            DRIVE WITH W A S D · BUMP ROCKS · EXPLORE
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
