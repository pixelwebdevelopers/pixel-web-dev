'use client';

import { create } from 'zustand';
import type { StationId, Project } from '@/utils/types';

type Phase = 'loading' | 'intro' | 'driving';

interface GameState {
  // lifecycle
  phase: Phase;
  loadProgress: number; // 0..100
  setLoadProgress: (p: number) => void;
  finishLoading: () => void;
  startDriving: () => void;

  // input / device
  isMobile: boolean;
  setIsMobile: (m: boolean) => void;
  muted: boolean;
  toggleMuted: () => void;

  // telemetry (updated from useFrame, read by HUD)
  speed: number;
  setSpeed: (s: number) => void;

  // stations
  activeStation: StationId | null;
  nearbyStation: StationId | null;
  setNearbyStation: (id: StationId | null) => void;
  enterStation: (id: StationId) => void;
  leaveStation: () => void;

  // services
  openService: string | null;
  setOpenService: (id: string | null) => void;

  // portfolio
  openProject: Project | null;
  setOpenProject: (p: Project | null) => void;
  portfolioFilter: Project['category'] | 'all';
  setPortfolioFilter: (f: Project['category'] | 'all') => void;

  // contact
  contactSent: boolean;
  setContactSent: (b: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'loading',
  loadProgress: 0,
  setLoadProgress: (p) =>
    set((s) => ({ loadProgress: Math.max(s.loadProgress, Math.min(100, p)) })),
  finishLoading: () => set((s) => (s.phase === 'loading' ? { phase: 'intro' } : {})),
  startDriving: () => set({ phase: 'driving' }),

  isMobile: false,
  setIsMobile: (m) => set({ isMobile: m }),
  muted: true,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  speed: 0,
  setSpeed: (s) => set({ speed: s }),

  activeStation: null,
  nearbyStation: null,
  setNearbyStation: (id) => set({ nearbyStation: id }),
  enterStation: (id) => set({ activeStation: id }),
  leaveStation: () => set({ activeStation: null }),

  openService: null,
  setOpenService: (id) => set({ openService: id }),

  openProject: null,
  setOpenProject: (p) => set({ openProject: p }),
  portfolioFilter: 'all',
  setPortfolioFilter: (f) => set({ portfolioFilter: f }),

  contactSent: false,
  setContactSent: (b) => set({ contactSent: b }),
}));
