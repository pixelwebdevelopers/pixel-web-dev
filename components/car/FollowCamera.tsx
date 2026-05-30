'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { carState } from '@/store/carState';
import { useGameStore } from '@/store/useGameStore';
import { STATIONS } from '@/utils/config';
import { damp, clamp } from '@/utils/math';

const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _behind = new THREE.Vector3();

/**
 * Fixed world-space direction the camera sits relative to its target.
 * The camera never rotates with the car heading — it slides to follow the
 * car's position while keeping this angle constant. Y is up.
 */
const ISO_DIR = new THREE.Vector3(1.2, 0.75, 1.4).normalize();

export function FollowCamera() {
  const { camera } = useThree();
  const phase = useGameStore((s) => s.phase);
  const activeStation = useGameStore((s) => s.activeStation);

  const mouse = useRef({ x: 0, y: 0 });
  const look = useRef(new THREE.Vector3(0, 1.5, 0));
  const introT = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);

    // --- intro: gentle high isometric idle over the spawn ----------------
    if (phase !== 'driving') {
      introT.current += dt * 0.25;
      _camTarget.set(
        14 + Math.sin(introT.current) * 2,
        17,
        24 + Math.cos(introT.current) * 2
      );
      camera.position.lerp(_camTarget, 1 - Math.exp(-3 * dt));
      _lookTarget.set(0, 1, 0);
      look.current.lerp(_lookTarget, 1 - Math.exp(-4 * dt));
      camera.lookAt(look.current);
      return;
    }

    const speedN = clamp(Math.abs(carState.speed) / 42, 0, 1);

    // --- station arrival: zoom in cinematically -------------------------
    if (activeStation) {
      const st = STATIONS.find((s) => s.id === activeStation)!;
      const center = new THREE.Vector3(...st.position);
      _camTarget.set(
        center.x + Math.sin(carState.heading) * -10,
        9,
        center.z + Math.cos(carState.heading) * -10
      );
      camera.position.lerp(_camTarget, 1 - Math.exp(-2.5 * dt));
      _lookTarget.copy(center).setY(2.5);
      look.current.lerp(_lookTarget, 1 - Math.exp(-3 * dt));
      camera.lookAt(look.current);
      return;
    }

    // --- fixed-angle iso follow ------------------------------------------
    // Camera sits at a constant world-space direction from the car and only
    // translates with it — it never yaws when the car turns. Zoom (distance)
    // gently grows with speed for a pull-back feel.
    const distance = 45 + speedN * 6;
    _behind.copy(ISO_DIR).multiplyScalar(distance);

    // subtle mouse parallax — small lateral and vertical drift only
    _camTarget.copy(carState.position).add(_behind);
    _camTarget.x += mouse.current.x * 3;
    _camTarget.y += mouse.current.y * -1.5;

    // looser damping so the camera floats rather than snaps to the car
    const lambda = 2.5 + speedN * 2;
    camera.position.x = damp(camera.position.x, _camTarget.x, lambda, dt);
    camera.position.y = damp(camera.position.y, _camTarget.y, lambda, dt);
    camera.position.z = damp(camera.position.z, _camTarget.z, lambda, dt);

    // look at the car body, with a tiny forward lead at speed
    const lead = 1 + speedN * 2;
    _lookTarget.set(
      carState.position.x + Math.sin(carState.heading) * lead,
      carState.position.y + 1.0,
      carState.position.z + Math.cos(carState.heading) * lead
    );
    look.current.lerp(_lookTarget, 1 - Math.exp(-5 * dt));
    camera.lookAt(look.current);

    // narrow FOV gives the flat iso feel; small punch at speed
    const cam = camera as THREE.PerspectiveCamera;
    const targetFov = 38 + speedN * 3 + (carState.drifting ? 2 : 0);
    cam.fov = damp(cam.fov, targetFov, 4, dt);
    cam.updateProjectionMatrix();
  });

  return null;
}
