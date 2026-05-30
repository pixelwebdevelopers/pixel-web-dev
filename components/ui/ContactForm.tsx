'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { CONTACT_BUDGETS } from '@/utils/config';

export function ContactForm() {
  const contactSent = useGameStore((s) => s.contactSent);
  const setContactSent = useGameStore((s) => s.setContactSent);
  const [form, setForm] = useState({ name: '', email: '', budget: CONTACT_BUDGETS[1], message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.message.trim()) errs.message = 'Tell us about your project';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Demo: no backend. Wire this to an API route / email service in production.
    setContactSent(true);
  };

  const field =
    'w-full rounded-lg border border-neon-cyan/25 bg-white/5 px-3 py-2.5 text-white outline-none transition focus:border-neon-cyan focus:shadow-neon placeholder:text-slate-500';

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {contactSent ? (
          <motion.div
            key="sent"
            className="flex flex-col items-center py-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-full border border-neon-cyan text-3xl"
              animate={{ boxShadow: ['0 0 0px #22d3ee', '0 0 40px #22d3ee', '0 0 12px #22d3ee'] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ✦
            </motion.div>
            <h3 className="mt-5 font-display text-2xl font-bold text-neon-cyan neon-text">
              MESSAGE SENT
            </h3>
            <p className="mt-2 max-w-sm text-slate-300">
              Your transmission reached Pixel HQ. We&apos;ll be in touch within one business day.
            </p>
            <button className="btn-neon mt-6" onClick={() => setContactSent(false)}>
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            className="grid gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-display text-[11px] tracking-widest text-neon-cyan/70">
                  NAME
                </label>
                <input
                  className={field}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
                {errors.name && <p className="mt-1 text-xs text-neon-pink">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block font-display text-[11px] tracking-widest text-neon-cyan/70">
                  EMAIL
                </label>
                <input
                  className={field}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                />
                {errors.email && <p className="mt-1 text-xs text-neon-pink">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block font-display text-[11px] tracking-widest text-neon-cyan/70">
                BUDGET
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTACT_BUDGETS.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setForm({ ...form, budget: b })}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      form.budget === b
                        ? 'border-neon-cyan bg-neon-cyan/15 text-white shadow-neon'
                        : 'border-white/15 text-slate-400 hover:border-neon-cyan/50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block font-display text-[11px] tracking-widest text-neon-cyan/70">
                MESSAGE
              </label>
              <textarea
                className={`${field} min-h-[110px] resize-none`}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="What are you building?"
              />
              {errors.message && <p className="mt-1 text-xs text-neon-pink">{errors.message}</p>}
            </div>

            <button type="submit" className="btn-neon mt-1 w-full">
              Transmit ▸
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
