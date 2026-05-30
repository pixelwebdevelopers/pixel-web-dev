'use client';

import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useGameStore } from '@/store/useGameStore';

export function Effects() {
  const isMobile = useGameStore((s) => s.isMobile);

  // Bright, clean low-poly look — just a touch of soft bloom on highlights,
  // and skip post entirely on mobile to protect the frame budget.
  if (isMobile) return null;

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.5}
      />
    </EffectComposer>
  );
}
