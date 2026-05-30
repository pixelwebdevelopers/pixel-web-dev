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

export default function PixelWorld() {
  const setIsMobile = useGameStore((s) => s.setIsMobile);

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
