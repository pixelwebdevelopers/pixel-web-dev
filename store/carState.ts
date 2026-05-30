import * as THREE from 'three';

/**
 * Mutable, non-reactive car state shared across the 3D scene.
 * Updated every frame by the CarController and read by cameras,
 * proximity detectors, particles, etc. — without triggering React renders.
 */
export const carState = {
  position: new THREE.Vector3(0, 0, 6),
  velocity: new THREE.Vector3(),
  heading: Math.PI, // facing -Z (into the world)
  speed: 0, // signed scalar speed along heading
  steer: 0, // -1..1 current steering
  drifting: false,
};

export function resetCar() {
  carState.position.set(0, 0, 6);
  carState.velocity.set(0, 0, 0);
  carState.heading = Math.PI;
  carState.speed = 0;
  carState.steer = 0;
  carState.drifting = false;
}
