'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { carState } from '@/store/carState';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';
import { clamp } from '@/utils/math';

/**
 * Portfolio billboards: tall framed screens that show a full-page website
 * screenshot. As the car approaches, the visible portion of the screenshot
 * scrolls from the top of the page toward the bottom, giving the feel of
 * "browsing" the site while driving past.
 *
 * Drop more .webp/.png screenshots into public/Images/portfolio and add an
 * entry to BILLBOARDS below.
 */

const PORTFOLIO_CENTER = { x: -60, z: -55 };
const SCREEN_W = 7;
const SCREEN_H = 4;
const FRAME_THICKNESS = 0.45;

// Repeat the one image we have across four slots for now. Replace each
// `image` URL as more screenshots arrive.
type BillboardSlot = {
  x: number;
  z: number;
  rotY: number;
  image: string;
  label: string;
};
const IMG = '/Images/portfolio/co-6-robotics-website.webp';
const BILLBOARDS: BillboardSlot[] = [
  { x: PORTFOLIO_CENTER.x - 18, z: PORTFOLIO_CENTER.z - 6, rotY: 0.35, image: IMG, label: 'CO-6 Robotics' },
  { x: PORTFOLIO_CENTER.x - 4, z: PORTFOLIO_CENTER.z - 16, rotY: -0.1, image: IMG, label: 'Project Two' },
  { x: PORTFOLIO_CENTER.x + 10, z: PORTFOLIO_CENTER.z - 10, rotY: -0.45, image: IMG, label: 'Project Three' },
  { x: PORTFOLIO_CENTER.x + 2, z: PORTFOLIO_CENTER.z + 8, rotY: Math.PI, image: IMG, label: 'Project Four' },
];

function Billboard({ slot, idx }: { slot: BillboardSlot; idx: number }) {
  const root = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const delay = useMemo(() => dropDelay(idx + 700, 0.5, 0.6), [idx]);
  const tex = useLoader(THREE.TextureLoader, slot.image);

  // The visible vertical fraction of the image is computed from its aspect
  // so the screen never stretches. Recomputed on load.
  const visibleFractionRef = useRef(0.18);

  useEffect(() => {
    if (!tex.image) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    // imgAspect = height/width. We want to fit screen's aspect on the screen
    // and show that portion of the image at a time.
    const imgAspect = tex.image.height / tex.image.width;
    const screenAspect = SCREEN_H / SCREEN_W;
    const visible = clamp(screenAspect / imgAspect, 0.05, 1);
    visibleFractionRef.current = visible;
    tex.repeat.set(1, visible);
    // Start with the top of the image visible.
    tex.offset.set(0, 1 - visible);
    tex.needsUpdate = true;
  }, [tex]);

  useFrame(() => {
    if (!root.current) return;
    // Drop-in
    const dropY = dropStartedAt
      ? dropOffsetY((performance.now() - dropStartedAt) / 1000, delay, 60, 1.2)
      : 0;
    root.current.position.y = dropY;

    // Distance-driven vertical scroll. Map distance 22..3 to scroll 0..1
    // where 0 = top of image, 1 = bottom.
    const dx = carState.position.x - slot.x;
    const dz = carState.position.z - slot.z;
    const dist = Math.hypot(dx, dz);
    const scroll = clamp((22 - dist) / (22 - 3), 0, 1);
    const visible = visibleFractionRef.current;
    // offset.y interpolates from (1 - visible) at scroll=0 down to 0 at scroll=1
    const targetOffset = (1 - visible) * (1 - scroll);
    // Smooth the offset so the scroll feels natural, not snappy.
    tex.offset.y += (targetOffset - tex.offset.y) * 0.12;
  });

  // 1.4-unit base height so the screen reads as raised off the ground
  const screenCenterY = 1.4 + SCREEN_H / 2;

  return (
    <group
      ref={root}
      position={[slot.x, 60, slot.z]}
      rotation={[0, slot.rotY, 0]}
    >
      {/* support legs */}
      <mesh position={[-SCREEN_W * 0.32, 0.7, 0]} castShadow>
        <boxGeometry args={[0.35, 1.4, 0.35]} />
        <meshStandardMaterial color="#d8b88a" roughness={1} flatShading />
      </mesh>
      <mesh position={[SCREEN_W * 0.32, 0.7, 0]} castShadow>
        <boxGeometry args={[0.35, 1.4, 0.35]} />
        <meshStandardMaterial color="#d8b88a" roughness={1} flatShading />
      </mesh>

      {/* frame box */}
      <mesh position={[0, screenCenterY, 0]} castShadow>
        <boxGeometry
          args={[
            SCREEN_W + FRAME_THICKNESS * 2,
            SCREEN_H + FRAME_THICKNESS * 2,
            FRAME_THICKNESS,
          ]}
        />
        <meshStandardMaterial color="#f0e6d6" roughness={0.85} flatShading />
      </mesh>

      {/* the screen itself, just in front of the frame */}
      <mesh position={[0, screenCenterY, FRAME_THICKNESS / 2 + 0.01]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial ref={screenMat} map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function PortfolioBillboards() {
  return (
    <group>
      {BILLBOARDS.map((slot, i) => (
        <Billboard key={i} slot={slot} idx={i} />
      ))}
    </group>
  );
}
