'use client';

import { useEffect } from 'react';
import { Experience } from '@/components/3d/Experience';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { HeroOverlay } from '@/components/ui/HeroOverlay';
import { HUD } from '@/components/ui/HUD';
import { StationPanel } from '@/components/ui/StationPanel';
import { ServiceModal, ProjectModal } from '@/components/ui/Modals';
import { MobileControls } from '@/components/ui/MobileControls';
import { useGameStore } from '@/store/useGameStore';
import { armAudio, playSound } from '@/utils/sounds';

export default function PixelWorld() {
  const setIsMobile = useGameStore((s) => s.setIsMobile);
  const phase = useGameStore((s) => s.phase);
  const startDriving = useGameStore((s) => s.startDriving);

  useEffect(() => {
    const check = () =>
      setIsMobile(
        typeof window !== 'undefined' &&
          (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768)
      );
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsMobile]);

  // Auto-advance from the drop-in intro straight into driving — no start button.
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = window.setTimeout(startDriving, 2400);
    return () => window.clearTimeout(t);
  }, [phase, startDriving]);

  // Arm audio on the very first user interaction (any pointer or key event).
  // Browser autoplay rules need a gesture before any sound can play.
  useEffect(() => {
    const arm = () => {
      armAudio();
      // The reveal sound is the intro stinger — fires once when audio unlocks
      // during the intro phase.
      if (useGameStore.getState().phase === 'intro') {
        playSound('reveal');
      }
    };
    window.addEventListener('pointerdown', arm, { once: true });
    window.addEventListener('keydown', arm, { once: true });
    window.addEventListener('touchstart', arm, { once: true });
    return () => {
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
      window.removeEventListener('touchstart', arm);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <Experience />

      {/* UI layers (DOM, above the canvas) */}
      <LoadingScreen />
      <HeroOverlay />
      <HUD />
      <MobileControls />
      <StationPanel />
      <ServiceModal />
      <ProjectModal />
    </div>
  );
}
