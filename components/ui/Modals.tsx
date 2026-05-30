'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { SERVICES } from '@/utils/config';

function Backdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-panel scanlines relative w-full max-w-lg overflow-hidden p-6 sm:p-8"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ServiceModal() {
  const openService = useGameStore((s) => s.openService);
  const setOpenService = useGameStore((s) => s.setOpenService);
  const service = SERVICES.find((s) => s.id === openService);

  return (
    <AnimatePresence>
      {service && (
        <Backdrop onClose={() => setOpenService(null)}>
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{ background: service.color, boxShadow: `0 0 12px ${service.color}` }}
          />
          <div className="mb-3 text-4xl" style={{ color: service.color }}>
            {service.icon}
          </div>
          <h2 className="font-display text-2xl font-black text-white">{service.title}</h2>
          <p className="mt-3 text-slate-300">{service.description}</p>
          <ul className="mt-5 grid grid-cols-2 gap-2">
            {service.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-neon-cyan">▸</span>
                {f}
              </li>
            ))}
          </ul>
          <button className="btn-neon mt-6 w-full" onClick={() => setOpenService(null)}>
            Close
          </button>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

export function ProjectModal() {
  const openProject = useGameStore((s) => s.openProject);
  const setOpenProject = useGameStore((s) => s.setOpenProject);

  return (
    <AnimatePresence>
      {openProject && (
        <Backdrop onClose={() => setOpenProject(null)}>
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{ background: openProject.color, boxShadow: `0 0 12px ${openProject.color}` }}
          />
          <p
            className="font-display text-[11px] tracking-[0.4em]"
            style={{ color: openProject.color }}
          >
            {openProject.category.toUpperCase()} · {openProject.client}
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-white">
            {openProject.title}
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <span className="font-display text-xs tracking-widest text-neon-pink/80">PROBLEM</span>
              <p className="mt-1 text-slate-300">{openProject.problem}</p>
            </div>
            <div>
              <span className="font-display text-xs tracking-widest text-neon-cyan/80">SOLUTION</span>
              <p className="mt-1 text-slate-300">{openProject.solution}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {openProject.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {openProject.results.map((r) => (
              <div key={r.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="font-display text-lg font-black text-neon-cyan neon-text">
                  {r.value}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">{r.label}</div>
              </div>
            ))}
          </div>

          <button className="btn-neon btn-neon-pink mt-6 w-full" onClick={() => setOpenProject(null)}>
            Close
          </button>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}
