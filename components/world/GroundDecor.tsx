'use client';

import { Text, RoundedBox } from '@react-three/drei';

function Key({
  label,
  position,
}: {
  label: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <RoundedBox args={[1.6, 0.6, 1.6]} radius={0.18} smoothness={3} castShadow position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#f3eee8" roughness={0.8} flatShading />
      </RoundedBox>
      <Text
        position={[0, 0.62, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.7}
        color="#3a3f4a"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/** Spawn-area instructions: floor text + chunky 3D WASD keys. */
export function GroundDecor() {
  return (
    <group position={[0, 0, 11]}>
      <Text
        position={[0, 0.06, 4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        outlineWidth={0.04}
        outlineColor="#d8602a"
      >
        USE WASD OR ARROW KEYS TO DRIVE
      </Text>

      {/* key cluster */}
      <Key label="W" position={[0, 0, 0]} />
      <Key label="A" position={[-1.8, 0, 1.8]} />
      <Key label="S" position={[0, 0, 1.8]} />
      <Key label="D" position={[1.8, 0, 1.8]} />
    </group>
  );
}
