'use client';

import { Text } from '@react-three/drei';
import { RESET_ZONES } from '@/utils/knockables';

/** Drives car into one of these to respawn the associated props. */
export function ResetZones() {
  return (
    <group>
      {RESET_ZONES.map((z, i) => (
        <group key={i} position={[z.x, 0, z.z]}>
          {/* outlined square painted on the ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <ringGeometry args={[z.size - 0.18, z.size, 4]} />
            <meshStandardMaterial color="#f5f1ea" roughness={0.9} transparent opacity={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <planeGeometry args={[z.size * 1.8, z.size * 1.8]} />
            <meshStandardMaterial color="#f5f1ea" roughness={1} transparent opacity={0.08} />
          </mesh>
          <Text
            position={[0, 0.06, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.6}
            color="#f5f1ea"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
            outlineWidth={0.025}
            outlineColor="#2a2f3a"
          >
            {z.label}
          </Text>
        </group>
      ))}
    </group>
  );
}
