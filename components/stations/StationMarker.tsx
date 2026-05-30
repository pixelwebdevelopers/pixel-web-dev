'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Station } from '@/utils/types';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

/**
 * A friendly low-poly signpost the car drives up to. A colored sign on a pole,
 * a soft ground marker showing the trigger area, and a gentle bob. Scales up
 * when the car is nearby.
 */
export function StationMarker({ station }: { station: Station }) {
  const root = useRef<THREE.Group>(null);
  const sign = useRef<THREE.Group>(null);
  const nearbyStation = useGameStore((s) => s.nearbyStation);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const isNear = nearbyStation === station.id;
  const dropSeed = (station.position[0] * 17 + station.position[2] * 31) | 0;
  const delay = dropDelay(dropSeed, 0.3, 0.6);

  useFrame((state) => {
    if (root.current && dropStartedAt) {
      const elapsed = (performance.now() - dropStartedAt) / 1000;
      root.current.position.y = dropOffsetY(elapsed, delay, 60, 1.1);
    }
    if (!sign.current) return;
    const bob = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    sign.current.position.y = 4.4 + bob;
    const target = isNear ? 1.15 : 1;
    sign.current.scale.lerp({ x: target, y: target, z: target } as THREE.Vector3, 0.1);
  });

  const [x, , z] = station.position;

  return (
    <group ref={root} position={[x, 60, z]}>
      {/* soft ground marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <ringGeometry args={[station.radius - 1.4, station.radius, 48]} />
        <meshStandardMaterial color={station.color} roughness={0.9} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[station.radius - 1.4, 40]} />
        <meshStandardMaterial color={station.color} roughness={1} transparent opacity={0.12} />
      </mesh>

      {/* pole */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 4.4, 8]} />
        <meshStandardMaterial color="#9aa0a8" roughness={1} flatShading />
      </mesh>

      {/* sign */}
      <group ref={sign} position={[0, 4.4, 0]}>
        <RoundedBox args={[5, 1.8, 0.4]} radius={0.2} smoothness={3} castShadow>
          <meshStandardMaterial color={station.color} roughness={0.7} flatShading />
        </RoundedBox>
        <Text
          position={[0, 0, 0.24]}
          fontSize={0.62}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={4.5}
          textAlign="center"
          outlineWidth={0.02}
          outlineColor="rgba(0,0,0,0.25)"
        >
          {station.label.toUpperCase()}
        </Text>
      </group>
    </group>
  );
}
