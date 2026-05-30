'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { CountUp } from './CountUp';
import { ContactForm } from './ContactForm';
import {
  STATIONS,
  SERVICES,
  ABOUT_STATS,
  TIMELINE,
  PROCESS_STEPS,
  TESTIMONIALS,
  PROJECTS,
  PORTFOLIO_FILTERS,
} from '@/utils/config';
import type { StationId } from '@/utils/types';

export function StationPanel() {
  const activeStation = useGameStore((s) => s.activeStation);
  const leaveStation = useGameStore((s) => s.leaveStation);
  const station = STATIONS.find((s) => s.id === activeStation);

  return (
    <AnimatePresence>
      {station && station.id !== 'hero' && (
        <motion.div
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3 sm:px-6 sm:pb-6"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        >
          <div className="glass-panel scanlines relative w-full max-w-4xl overflow-hidden">
            {/* top accent line */}
            <div
              className="absolute inset-x-0 top-0 h-0.5"
              style={{ background: station.color, boxShadow: `0 0 12px ${station.color}` }}
            />

            <div className="flex items-start justify-between gap-4 p-5 pb-3 sm:p-7 sm:pb-4">
              <div>
                <p
                  className="font-display text-[11px] tracking-[0.4em]"
                  style={{ color: station.color }}
                >
                  {station.label.toUpperCase()}
                </p>
                <h2 className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">
                  {station.title}
                </h2>
                <p className="mt-1 text-slate-400">{station.subtitle}</p>
              </div>
              <button
                onClick={leaveStation}
                className="btn-neon shrink-0 !px-4 !py-2 !text-xs"
              >
                Resume ▸
              </button>
            </div>

            <div className="glass-scroll max-h-[55vh] overflow-y-auto px-5 pb-6 sm:px-7">
              <PanelBody id={station.id} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PanelBody({ id }: { id: StationId }) {
  switch (id) {
    case 'services':
      return <ServicesBody />;
    case 'about':
      return <AboutBody />;
    case 'process':
      return <ProcessBody />;
    case 'testimonials':
      return <TestimonialsBody />;
    case 'portfolio':
      return <PortfolioBody />;
    case 'contact':
      return <ContactForm />;
    default:
      return null;
  }
}

function ServicesBody() {
  const setOpenService = useGameStore((s) => s.setOpenService);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => (
        <button
          key={s.id}
          onClick={() => setOpenService(s.id)}
          className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-neon-cyan/60 hover:bg-white/[0.06]"
        >
          <div className="mb-2 text-2xl" style={{ color: s.color }}>
            {s.icon}
          </div>
          <h3 className="font-display font-bold text-white">{s.title}</h3>
          <p className="mt-1 text-sm text-slate-400">{s.short}</p>
          <span className="mt-2 inline-block text-xs text-neon-cyan opacity-0 transition group-hover:opacity-100">
            View details →
          </span>
        </button>
      ))}
    </div>
  );
}

function AboutBody() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ABOUT_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="font-display text-3xl font-black text-neon-cyan neon-text">
              <CountUp to={s.value} />
              {s.suffix}
            </div>
            <div className="mt-1 text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <h3 className="mt-6 font-display text-sm tracking-widest text-neon-cyan/70">TIMELINE</h3>
      <div className="mt-3 space-y-3 border-l border-neon-cyan/30 pl-5">
        {TIMELINE.map((t) => (
          <div key={t.year} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-neon-cyan shadow-neon" />
            <div className="font-display text-sm font-bold text-white">
              {t.year} — {t.title}
            </div>
            <div className="text-sm text-slate-400">{t.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessBody() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {PROCESS_STEPS.map((s) => (
        <div key={s.n} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="font-display text-2xl font-black text-amber-400">{s.n}</div>
          <h3 className="mt-1 font-display font-bold text-white">{s.title}</h3>
          <p className="mt-1 text-sm text-slate-400">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

function TestimonialsBody() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TESTIMONIALS.map((t) => (
        <figure key={t.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <blockquote className="text-slate-200">&ldquo;{t.quote}&rdquo;</blockquote>
          <figcaption className="mt-3 font-display text-sm">
            <span className="text-neon-cyan">{t.name}</span>
            <span className="text-slate-500"> · {t.role}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function PortfolioBody() {
  const filter = useGameStore((s) => s.portfolioFilter);
  const setFilter = useGameStore((s) => s.setPortfolioFilter);
  const setOpenProject = useGameStore((s) => s.setOpenProject);
  const visible = PROJECTS.filter((p) => filter === 'all' || p.category === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {PORTFOLIO_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as never)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              filter === f.id
                ? 'border-neon-pink bg-neon-pink/15 text-white shadow-neon-pink'
                : 'border-white/15 text-slate-400 hover:border-neon-pink/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <button
            key={p.id}
            onClick={() => setOpenProject(p)}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-neon-pink/60"
          >
            <div className="text-xs uppercase tracking-widest" style={{ color: p.color }}>
              {p.category}
            </div>
            <h3 className="mt-1 font-display font-bold text-white">{p.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{p.client}</p>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        Tip: resume driving into a showroom pod to open a case study in-world.
      </p>
    </div>
  );
}
