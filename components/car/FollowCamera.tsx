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

    // --- third-person follow with spring lag ----------------------------
    // sit behind the car relative to its heading, raised for a high iso feel
    const back = 14 + speedN * 4; // pull back at speed
    const height = 11 + speedN * 2;
    _behind.set(
      Math.sin(carState.heading) * -back,
      height,
      Math.cos(carState.heading) * -back
    );

    // mouse orbit offset (subtle look-around)
    const orbit = mouse.current.x * 4;
    const perpX = Math.cos(carState.heading) * orbit;
    const perpZ = -Math.sin(carState.heading) * orbit;

    _camTarget.copy(carState.position).add(_behind);
    _camTarget.x += perpX;
    _camTarget.z += perpZ;
    _camTarget.y += mouse.current.y * -2;

    // faster damping at speed keeps the car framed; looser when idle
    const lambda = 4 + speedN * 4;
    camera.position.x = damp(camera.position.x, _camTarget.x, lambda, dt);
    camera.position.y = damp(camera.position.y, _camTarget.y, lambda, dt);
    camera.position.z = damp(camera.position.z, _camTarget.z, lambda, dt);

    // look slightly ahead of the car in its travel direction
    const lead = 4 + speedN * 6;
    _lookTarget.set(
      carState.position.x + Math.sin(carState.heading) * lead,
      carState.position.y + 1.5,
      carState.position.z + Math.cos(carState.heading) * lead
    );
    look.current.lerp(_lookTarget, 1 - Math.exp(-6 * dt));
    camera.lookAt(look.current);

    // speed-based FOV punch
    const cam = camera as THREE.PerspectiveCamera;
    const targetFov = 45 + speedN * 8 + (carState.drifting ? 3 : 0);
    cam.fov = damp(cam.fov, targetFov, 4, dt);
    cam.updateProjectionMatrix();
  });

  return null;
}
