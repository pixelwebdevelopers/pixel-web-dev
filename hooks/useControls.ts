'use client';

import { useEffect } from 'react';
import type { CarControls } from '@/utils/types';

/**
 * Shared, mutable control state. Keyboard listeners and the on-screen
 * mobile joystick both write here; the CarController reads it each frame.
 */
export const controls: CarControls = {
  forward: 0,
  backward: 0,
  left: 0,
  right: 0,
  brake: false,
};

const keyMap: Record<string, keyof CarControls> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

export function useKeyboardControls() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        controls.brake = true;
        e.preventDefault();
        return;
      }
      const k = keyMap[e.code];
      if (k && k !== 'brake') (controls[k] as number) = 1;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        controls.brake = false;
        return;
      }
      const k = keyMap[e.code];
      if (k && k !== 'brake') (controls[k] as number) = 0;
    };
    const blur = () => {
      controls.forward = controls.backward = controls.left = controls.right = 0;
      controls.brake = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);
}
