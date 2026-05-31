'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

type Sign = {
  /** Post base position in the world. */
  position: [number, number, number];
  /** Unit-ish vector for where the arrow tip should point in world XZ. */
  arrow: [number, number];
  label: string;
  color: string;
};

/**
 * Wooden directional signs placed at the path junction for each destination.
 * Each sign is an extruded arrow-shaped board mounted on top of a post; the
 * board rotates around Y so its pointed end aims at the destination.
 */
const SIGNS: Sign[] = [
  // Sign east of the bridge approach, arrow toward the playground.
  { position: [8, 0, -65], arrow: [-0.22, -0.97], label: 'PLAYGROUND', color: '#f6c777' },
  // Sign on the diagonal path to services, arrow toward the services cluster.
  { position: [40, 0, -28], arrow: [0.61, -0.79], label: 'SERVICES', color: '#c08bff' },
  // Sign on the diagonal path to portfolio, arrow toward the billboards.
  { position: [-44, 0, -38], arrow: [-0.68, -0.74], label: 'PORTFOLIO', color: '#ff8fb8' },
  // Sign on the road to the contact ring, arrow north.
  { position: [8, 0, 60], arrow: [-0.30, 0.95], label: 'CONTACT', color: '#6fd6e0' },
];

const POST_HEIGHT = 3.4;
const BOARD_LEN = 4.6;
const BOARD_HEIGHT = 1.1;
const BOARD_DEPTH = 0.22;

function arrowGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const hl = BOARD_LEN / 2;
  const hh = BOARD_HEIGHT / 2;
  s.moveTo(-hl, -hh);
  s.lineTo(hl - 0.9, -hh);
  s.lineTo(hl, 0);
  s.lineTo(hl - 0.9, hh);
  s.lineTo(-hl, hh);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: BOARD_DEPTH, bevelEnabled: false });
}

function Signpost({ sign, dropIdx }: { sign: Sign; dropIdx: number }) {
  const root = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const geom = useMemo(arrowGeometry, []);

  useFrame(() => {
    if (!root.current) return;
    const elapsed = dropStartedAt
      ? (performance.now() - dropStartedAt) / 1000
      : 0;
    root.current.position.y = dropOffsetY(elapsed, dropDelay(dropIdx + 1700, 0.7, 0.4), 55, 1.0);
  });

  // Tip points along (dx, dz). For a shape whose tip starts at +X local,
  // rotating Y by atan2(-dz, dx) sends +X to (dx, -dz)→ exactly (dx, dz) in
  // world space (since three's Y rotation sends +X to (cos θ, 0, -sin θ)).
  const angle = Math.atan2(-sign.arrow[1], sign.arrow[0]);

  return (
    <group ref={root} position={[sign.position[0], 50, sign.position[2]]}>
      {/* post */}
      <mesh position={[0, POST_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, POST_HEIGHT, 8]} />
        <meshStandardMaterial color="#9a7048" roughness={0.95} flatShading />
      </mesh>
      {/* short cap on top of the post */}
      <mesh position={[0, POST_HEIGHT + 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 8]} />
        <meshStandardMaterial color="#5b3d24" roughness={1} flatShading />
      </mesh>

      {/* arrow board mounted near the top of the post */}
      <group position={[0, POST_HEIGHT - 0.3, 0]} rotation={[0, angle, 0]}>
        <mesh
          geometry={geom}
          position={[0, 0, -BOARD_DEPTH / 2]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={sign.color} roughness={0.65} flatShading />
        </mesh>
        {/* label on both faces so it reads from either side */}
        <Text
          position={[0, 0, BOARD_DEPTH / 2 + 0.005]}
          fontSize={0.5}
          color="#2a2f3a"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="rgba(255,255,255,0.55)"
        >
          {sign.label}
        </Text>
        <Text
          position={[0, 0, -BOARD_DEPTH / 2 - 0.005]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.5}
          color="#2a2f3a"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="rgba(255,255,255,0.55)"
        >
          {sign.label}
        </Text>
      </group>
    </group>
  );
}

export function Signposts() {
  return (
    <group>
      {SIGNS.map((sign, i) => (
        <Signpost key={i} sign={sign} dropIdx={i} />
      ))}
    </group>
  );
}
