'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { STATIONS, SERVICES } from '@/utils/config';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

/**
 * Services station: a slowly-rotating cluster of colored cards orbiting a
 * tall pole, one per service. The whole rig drops in like the rest of the
 * world and bobs gently in place.
 */
export function ServicesStation() {
  const station = STATIONS.find((s) => s.id === 'services');
  const root = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const nearbyStation = useGameStore((s) => s.nearbyStation);
  const isNear = nearbyStation === 'services';

  useFrame((state, dt) => {
    if (!root.current) return;
    const elapsed = dropStartedAt
      ? (performance.now() - dropStartedAt) / 1000
      : 0;
    root.current.position.y = dropOffsetY(elapsed, dropDelay(31, 0.4, 0.4), 65, 1.2);
    if (ring.current) {
      ring.current.rotation.y += dt * 0.35;
      // Subtle bob
      const t = state.clock.elapsedTime;
      ring.current.position.y = 3.5 + Math.sin(t * 1.1) * 0.18;
      const target = isNear ? 1.08 : 1;
      ring.current.scale.lerp({ x: target, y: target, z: target } as THREE.Vector3, 0.08);
    }
  });

  if (!station) return null;
  const [sx, , sz] = station.position;
  const orbitRadius = 4.6;
  const orbitHeight = 2.5;

  return (
    <group ref={root} position={[sx, 65, sz]}>
      {/* ground ring marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <ringGeometry args={[station.radius - 1.2, station.radius, 48]} />
        <meshStandardMaterial
          color={station.color}
          roughness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* central pole */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 6, 8]} />
        <meshStandardMaterial color="#3a3f4a" roughness={0.7} flatShading />
      </mesh>

      {/* big label on top of pole */}
      <Text
        position={[0, 6.7, 0]}
        fontSize={0.85}
        color={station.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="rgba(0,0,0,0.4)"
      >
        SERVICES
      </Text>

      {/* orbiting service cards */}
      <group ref={ring}>
        {SERVICES.map((svc, i) => {
          const angle = (i / SERVICES.length) * Math.PI * 2;
          const x = Math.cos(angle) * orbitRadius;
          const z = Math.sin(angle) * orbitRadius;
          // Stagger the cards vertically in a gentle helix
          const y = orbitHeight + ((i % 3) - 1) * 0.5;
          return (
            <group
              key={svc.id}
              position={[x, y, z]}
              rotation={[0, -angle + Math.PI / 2, 0]}
            >
              <RoundedBox args={[1.5, 1.5, 0.18]} radius={0.18} smoothness={3} castShadow>
                <meshStandardMaterial color={svc.color} roughness={0.55} flatShading />
              </RoundedBox>
              <Text
                position={[0, 0, 0.12]}
                fontSize={0.85}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.025}
                outlineColor="rgba(0,0,0,0.4)"
              >
                {svc.icon}
              </Text>
            </group>
          );
        })}
      </group>
    </group>
  );
}
