'use client';

export function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <circleGeometry args={[500, 80]} />
      <meshStandardMaterial color="#ff9d54" roughness={1} metalness={0} />
    </mesh>
  );
}
