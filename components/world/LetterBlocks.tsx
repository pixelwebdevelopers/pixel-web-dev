'use client';

import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { LETTERS, type LetterEntry } from '@/utils/knockables';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

/** Place a JSON font at this path (see public/audio/README for sourcing). */
const FONT_URL = '/fonts/helvetiker_regular.typeface.json';

const LETTER_HEIGHT = 1.9;
const LETTER_DEPTH = 0.6;

function LetterChar({ entry, idx }: { entry: LetterEntry; idx: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const delay = dropDelay(idx + 500, 0.6, 0.6);
  const { state, glyph } = entry;

  useFrame(() => {
    if (!root.current) return;
    const dropY = dropStartedAt
      ? dropOffsetY((performance.now() - dropStartedAt) / 1000, delay, 55, 1.1)
      : 0;
    root.current.position.x = state.baseX + state.offX;
    root.current.position.z = state.baseZ + state.offZ;
    root.current.rotation.y = state.rotY;
    // tip on impact, clamped so they don't spin past 60°
    const t = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.tilt));
    root.current.rotation.z = -state.tiltAxisX * t;
    root.current.rotation.x = state.tiltAxisZ * t;
    // Floor-clip compensation: lift the letter by depth/2 * |sin tilt| so
    // the bottom-front edge doesn't dip below y=0 when it tips.
    const lift = Math.abs(Math.sin(t)) * (LETTER_DEPTH / 2);
    root.current.position.y = dropY + lift;
  });

  return (
    <group ref={root}>
      {/* Centered horizontally on the prop, sitting on the ground */}
      <Center disableY top>
        <Text3D
          font={FONT_URL}
          size={LETTER_HEIGHT}
          height={LETTER_DEPTH}
          curveSegments={6}
          bevelEnabled
          bevelThickness={0.06}
          bevelSize={0.04}
          bevelSegments={2}
        >
          {glyph}
          <meshStandardMaterial
            color="#f5f1ea"
            roughness={0.7}
            metalness={0.05}
            flatShading
          />
        </Text3D>
      </Center>
    </group>
  );
}

export function LetterBlocks() {
  return (
    <Suspense fallback={null}>
      <group>
        {LETTERS.map((l, i) => (
          <LetterChar key={i} entry={l} idx={i} />
        ))}
      </group>
    </Suspense>
  );
}
