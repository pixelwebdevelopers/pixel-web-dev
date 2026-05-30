'use client';

/**
 * Bright, warm, low-poly daytime atmosphere — a soft sun, gentle fill light
 * and peach-tinted fog that blends the ground into the gradient sky.
 */
export function WorldEnvironment() {
  return (
    <>
      {/* fog matched to the warm horizon so geometry fades softly */}
      <fog attach="fog" args={['#ffb27a', 140, 460]} />

      {/* soft sky/ground ambient */}
      <hemisphereLight args={['#fff4e6', '#ff9d5c', 1.0]} />
      <ambientLight intensity={0.35} color="#fff1e0" />

      {/* the sun — warm key light casting long soft shadows */}
      <directionalLight
        position={[60, 90, 40]}
        intensity={2.1}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-160}
        shadow-camera-right={160}
        shadow-camera-top={160}
        shadow-camera-bottom={-160}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-bias={-0.0005}
      />
      {/* cool bounce fill from the opposite side */}
      <directionalLight position={[-40, 30, -30]} intensity={0.4} color="#ffd9b0" />
    </>
  );
}
