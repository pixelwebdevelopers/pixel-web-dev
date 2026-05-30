'use client';

import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Preload, useProgress } from '@react-three/drei';
import { World } from '@/components/world/World';
import { CarController } from '@/components/car/CarController';
import { FollowCamera } from '@/components/car/FollowCamera';
import { TireTrail } from '@/components/car/TireTrail';
import { Effects } from './Effects';
import { useGameStore } from '@/store/useGameStore';

/** Bridges drei's asset loading progress into the game store. */
function LoaderBridge() {
  const { progress, active } = useProgress();
  const setLoadProgress = useGameStore((s) => s.setLoadProgress);
  useEffect(() => {
    setLoadProgress(progress);
    if (!active && progress >= 100) setLoadProgress(100);
  }, [progress, active, setLoadProgress]);
  return null;
}

export function Experience() {
  const isMobile = useGameStore((s) => s.isMobile);

  return (
    <Canvas
      shadows="soft"
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 18, 26], fov: 45, near: 0.5, far: 1000 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      className="absolute inset-0"
    >
      <Suspense fallback={null}>
        <LoaderBridge />
        <World />
        <CarController />
        <TireTrail />
        <Preload all />
      </Suspense>

      <FollowCamera />
      <Effects />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
