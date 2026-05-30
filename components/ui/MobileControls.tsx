'use client';

import { useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { controls } from '@/hooks/useControls';

/**
 * Touch joystick (steer + throttle) plus a drift button for mobile.
 * Writes directly into the shared `controls` object the CarController reads.
 */
export function MobileControls() {
  const phase = useGameStore((s) => s.phase);
  const isMobile = useGameStore((s) => s.isMobile);
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef(false);

  if (!isMobile || phase !== 'driving') return null;

  const RADIUS = 52;

  const update = (clientX: number, clientY: number) => {
    const el = base.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    const nx = dx / RADIUS;
    const ny = dy / RADIUS;
    controls.left = nx < 0 ? -nx : 0;
    controls.right = nx > 0 ? nx : 0;
    controls.forward = ny < 0 ? -ny : 0;
    controls.backward = ny > 0 ? ny : 0;
  };

  const reset = () => {
    active.current = false;
    setKnob({ x: 0, y: 0 });
    controls.left = controls.right = controls.forward = controls.backward = 0;
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between p-6 sm:hidden">
      {/* joystick */}
      <div
        ref={base}
        className="glass-panel pointer-events-auto relative flex h-32 w-32 items-center justify-center rounded-full"
        onTouchStart={(e) => {
          active.current = true;
          const t = e.touches[0];
          update(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          if (!active.current) return;
          const t = e.touches[0];
          update(t.clientX, t.clientY);
        }}
        onTouchEnd={reset}
        onTouchCancel={reset}
      >
        <div className="absolute h-full w-px bg-neon-cyan/15" />
        <div className="absolute h-px w-full bg-neon-cyan/15" />
        <div
          className="h-14 w-14 rounded-full border border-neon-cyan bg-neon-cyan/20 shadow-neon"
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>

      {/* drift button */}
      <button
        className="glass-panel pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full font-display text-xs tracking-widest text-neon-pink active:bg-neon-pink/20"
        onTouchStart={() => (controls.brake = true)}
        onTouchEnd={() => (controls.brake = false)}
      >
        DRIFT
      </button>
    </div>
  );
}
