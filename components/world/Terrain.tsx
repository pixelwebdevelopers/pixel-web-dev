'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TERRAIN, type Ramp, type Platform } from '@/utils/terrain';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

/**
 * Wedge BufferGeometry sized to (w, d, h):
 *   - Base sits flat on Y=0
 *   - Slope rises from low end at +Z to high end at -Z
 *   - Back wall is at -Z (high-end vertical face)
 *
 * Non-indexed so flat shading produces clean hard edges per face.
 */
function wedgeGeometry(w: number, d: number, h: number): THREE.BufferGeometry {
  const hx = w / 2;
  const hd = d / 2;
  const p0: [number, number, number] = [-hx, 0, +hd]; // low-end-left
  const p1: [number, number, number] = [+hx, 0, +hd]; // low-end-right
  const p2: [number, number, number] = [+hx, 0, -hd]; // high-end-right-base
  const p3: [number, number, number] = [-hx, 0, -hd]; // high-end-left-base
  const p4: [number, number, number] = [-hx, h, -hd]; // high-end-left-top
  const p5: [number, number, number] = [+hx, h, -hd]; // high-end-right-top

  const tris: [number, number, number][][] = [
    [p0, p2, p1],
    [p0, p3, p2],
    [p0, p1, p5],
    [p0, p5, p4],
    [p3, p5, p2],
    [p3, p4, p5],
    [p0, p4, p3],
    [p1, p2, p5],
  ];

  const positions = new Float32Array(tris.length * 9);
  let i = 0;
  for (const t of tris) {
    for (const v of t) {
      positions[i++] = v[0];
      positions[i++] = v[1];
      positions[i++] = v[2];
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.computeVertexNormals();
  return g;
}

function RampMesh({ ramp, dropIdx }: { ramp: Ramp; dropIdx: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const geom = useMemo(() => wedgeGeometry(ramp.w, ramp.d, ramp.h), [ramp.w, ramp.d, ramp.h]);
  const baseY = ramp.baseY ?? 0;

  useFrame(() => {
    if (!root.current) return;
    const elapsed = dropStartedAt
      ? (performance.now() - dropStartedAt) / 1000
      : 0;
    const dropY = dropOffsetY(elapsed, dropDelay(dropIdx + 800, 0.6, 0.4), 50, 1.0);
    root.current.position.y = baseY + dropY;
  });

  return (
    <group ref={root} position={[ramp.x, baseY + 50, ramp.z]} rotation={[0, ramp.rotY, 0]}>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial
          color={ramp.color ?? '#d8b88a'}
          roughness={0.85}
          flatShading
        />
      </mesh>
    </group>
  );
}

function PlatformMesh({ p, dropIdx }: { p: Platform; dropIdx: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const baseY = p.baseY ?? 0;
  // Stacked platforms (baseY > 0) don't need ground-supporting legs — they
  // sit on whatever's below (the spiral, etc.). Bridge platform at baseY=0
  // does get legs.
  const showLegs = baseY === 0;

  useFrame(() => {
    if (!root.current) return;
    const elapsed = dropStartedAt
      ? (performance.now() - dropStartedAt) / 1000
      : 0;
    const dropY = dropOffsetY(elapsed, dropDelay(dropIdx + 850, 0.7, 0.4), 50, 1.0);
    root.current.position.y = baseY + dropY;
  });

  const legR = 0.22;
  const legInset = 0.5;
  const legPositions: [number, number][] = [
    [-p.w / 2 + legInset, -p.d / 2 + legInset],
    [+p.w / 2 - legInset, -p.d / 2 + legInset],
    [-p.w / 2 + legInset, +p.d / 2 - legInset],
    [+p.w / 2 - legInset, +p.d / 2 - legInset],
  ];

  return (
    <group ref={root} position={[p.x, baseY + 50, p.z]} rotation={[0, p.rotY, 0]}>
      {/* deck */}
      <mesh position={[0, p.h - 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[p.w, 0.3, p.d]} />
        <meshStandardMaterial color={p.color ?? '#d8b88a'} roughness={0.85} flatShading />
      </mesh>

      {showLegs &&
        legPositions.map(([lx, lz], i) => (
          <mesh key={i} position={[lx, (p.h - 0.3) / 2, lz]} castShadow>
            <cylinderGeometry args={[legR, legR * 1.1, p.h - 0.3, 8]} />
            <meshStandardMaterial color="#b89466" roughness={0.9} flatShading />
          </mesh>
        ))}

      {/* short side rails */}
      <mesh position={[-p.w / 2 + 0.12, p.h + 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, p.d]} />
        <meshStandardMaterial color="#b89466" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[p.w / 2 - 0.12, p.h + 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, p.d]} />
        <meshStandardMaterial color="#b89466" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

export function Terrain() {
  return (
    <group>
      {TERRAIN.map((t, i) =>
        t.kind === 'ramp' ? (
          <RampMesh key={i} ramp={t} dropIdx={i} />
        ) : (
          <PlatformMesh key={i} p={t} dropIdx={i} />
        )
      )}
    </group>
  );
}
