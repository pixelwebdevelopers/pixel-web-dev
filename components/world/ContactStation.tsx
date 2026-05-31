'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { STATIONS } from '@/utils/config';
import { useGameStore } from '@/store/useGameStore';
import { dropOffsetY, dropDelay } from '@/utils/dropIn';

/**
 * Contact station: a vertical glowing torus ("portal") with a bright inner
 * disc and a swarm of small orbs drifting around it. Driving through the
 * ring triggers the existing station auto-enter.
 */
export function ContactStation() {
  const station = STATIONS.find((s) => s.id === 'contact');
  const root = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const disc = useRef<THREE.Mesh>(null);
  const orbsGroup = useRef<THREE.Group>(null);
  const dropStartedAt = useGameStore((s) => s.dropStartedAt);
  const nearbyStation = useGameStore((s) => s.nearbyStation);
  const isNear = nearbyStation === 'contact';

  // Pre-compute random orb data so they stay stable across frames.
  const orbs = useMemo(() => {
    const out: { r: number; a: number; speed: number; phase: number; size: number }[] = [];
    for (let i = 0; i < 18; i++) {
      out.push({
        r: 3.4 + Math.random() * 1.2,
        a: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        size: 0.08 + Math.random() * 0.12,
      });
    }
    return out;
  }, []);

  useFrame((state, dt) => {
    if (!root.current) return;
    const elapsed = dropStartedAt
      ? (performance.now() - dropStartedAt) / 1000
      : 0;
    root.current.position.y = dropOffsetY(elapsed, dropDelay(73, 0.4, 0.4), 65, 1.2);

    const t = state.clock.elapsedTime;
    if (ring.current) {
      // Subtle pulse + slow tilt-wobble. Scale up slightly when the car is near.
      const target = isNear ? 1.12 : 1;
      ring.current.scale.lerp({ x: target, y: target, z: target } as THREE.Vector3, 0.08);
      ring.current.rotation.z = Math.sin(t * 0.6) * 0.05;
    }
    if (disc.current) {
      const mat = disc.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(t * 2.2) * 0.12;
    }
    if (orbsGroup.current) {
      const children = orbsGroup.current.children;
      for (let i = 0; i < children.length; i++) {
        const orb = orbs[i];
        const ang = orb.a + t * orb.speed;
        children[i].position.set(
          Math.cos(ang) * orb.r,
          Math.sin(ang) * orb.r + Math.sin(t * 1.4 + orb.phase) * 0.3,
          Math.sin(t * 0.7 + orb.phase) * 0.4
        );
      }
    }
  });

  if (!station) return null;
  const [sx, , sz] = station.position;
  const ringMajor = 4.2;
  const ringMinor = 0.32;
  const ringCenterY = 4.4;

  return (
    <group ref={root} position={[sx, 65, sz]}>
      {/* faint ground marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <ringGeometry args={[station.radius - 1.2, station.radius, 48]} />
        <meshStandardMaterial
          color={station.color}
          roughness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* glowing portal ring — stands vertically facing the spawn (which is +Z from here) */}
      <mesh
        ref={ring}
        position={[0, ringCenterY, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <torusGeometry args={[ringMajor, ringMinor, 16, 64]} />
        <meshStandardMaterial
          color={station.color}
          emissive={station.color}
          emissiveIntensity={1.3}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* inner glow disc */}
      <mesh ref={disc} position={[0, ringCenterY, 0]} rotation={[0, 0, 0]}>
        <circleGeometry args={[ringMajor - ringMinor * 1.4, 48]} />
        <meshBasicMaterial
          color={station.color}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* drifting orbs inside */}
      <group ref={orbsGroup} position={[0, ringCenterY, 0]}>
        {orbs.map((o, i) => (
          <mesh key={i}>
            <sphereGeometry args={[o.size, 8, 8]} />
            <meshBasicMaterial color={station.color} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* label below */}
      <Text
        position={[0, 1.1, 0]}
        fontSize={0.85}
        color={station.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="rgba(0,0,0,0.4)"
      >
        CONTACT
      </Text>
    </group>
  );
}
