'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { carState } from '@/store/carState';

/**
 * Stylized low-poly red jeep, built procedurally from primitives — no GLB
 * needed. Flat-shaded chunky body, roll cage, big wheels. The controller only
 * moves the wrapping group, so this is easy to swap for a loaded model.
 */
export function CarModel() {
  const wheelFL = useRef<THREE.Mesh>(null);
  const wheelFR = useRef<THREE.Mesh>(null);
  const wheelRL = useRef<THREE.Mesh>(null);
  const wheelRR = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    const spin = carState.speed * dt * 0.5;
    [wheelRL, wheelRR].forEach((w) => w.current && (w.current.rotation.x += spin));
    const steerRot = carState.steer * 0.5;
    [wheelFL, wheelFR].forEach((w) => {
      if (!w.current) return;
      w.current.rotation.x += spin;
      w.current.rotation.y = steerRot;
    });
  });

  const RED = '#e8472b';
  const DARK = '#2a2f3a';
  const BLACK = '#15171e';

  const Wheel = ({
    refObj,
    x,
    z,
  }: {
    refObj: React.RefObject<THREE.Mesh>;
    x: number;
    z: number;
  }) => (
    <mesh ref={refObj} position={[x, 0.45, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.45, 0.45, 0.4, 14]} />
      <meshStandardMaterial color={BLACK} roughness={0.85} flatShading />
    </mesh>
  );

  return (
    <group>
      {/* main body */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.7, 3.4]} />
        <meshStandardMaterial color={RED} roughness={0.5} metalness={0.1} flatShading />
      </mesh>
      {/* raised hood (front, slightly lower) */}
      <mesh position={[0, 0.7, 1.35]} castShadow>
        <boxGeometry args={[1.7, 0.45, 0.9]} />
        <meshStandardMaterial color={RED} roughness={0.5} flatShading />
      </mesh>
      {/* lower chassis / skid */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.9, 0.3, 3.5]} />
        <meshStandardMaterial color={DARK} roughness={0.8} flatShading />
      </mesh>
      {/* cabin block (seats area) */}
      <mesh position={[0, 1.25, -0.3]} castShadow>
        <boxGeometry args={[1.55, 0.55, 1.5]} />
        <meshStandardMaterial color="#c93a22" roughness={0.6} flatShading />
      </mesh>

      {/* windshield frame */}
      <mesh position={[0, 1.55, 0.55]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.7, 0.08]} />
        <meshStandardMaterial color={DARK} roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 1.55, 0.58]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[1.3, 0.5, 0.04]} />
        <meshStandardMaterial color="#bfe9ff" roughness={0.1} metalness={0.2} />
      </mesh>

      {/* roll cage — 4 posts + top frame */}
      {([[0.72, 0.4], [-0.72, 0.4], [0.72, -1.05], [-0.72, -1.05]] as const).map(
        ([x, z], i) => (
          <mesh key={i} position={[x, 1.7, z]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 1, 8]} />
            <meshStandardMaterial color={DARK} roughness={0.6} />
          </mesh>
        )
      )}
      <mesh position={[0, 2.2, -0.32]}>
        <boxGeometry args={[1.5, 0.08, 1.5]} />
        <meshStandardMaterial color={DARK} roughness={0.6} flatShading />
      </mesh>

      {/* headlights */}
      {[0.55, -0.55].map((x) => (
        <mesh key={x} position={[x, 0.85, 1.82]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#fff7e0" emissive="#fff2c0" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* front bumper */}
      <mesh position={[0, 0.6, 1.78]} castShadow>
        <boxGeometry args={[1.95, 0.22, 0.18]} />
        <meshStandardMaterial color={DARK} roughness={0.8} flatShading />
      </mesh>
      {/* spare wheel on the back */}
      <mesh position={[0, 1.0, -1.85]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.25, 14]} />
        <meshStandardMaterial color={BLACK} roughness={0.85} flatShading />
      </mesh>

      {/* wheels */}
      <Wheel refObj={wheelFL} x={0.95} z={1.15} />
      <Wheel refObj={wheelFR} x={-0.95} z={1.15} />
      <Wheel refObj={wheelRL} x={0.95} z={-1.15} />
      <Wheel refObj={wheelRR} x={-0.95} z={-1.15} />
    </group>
  );
}
