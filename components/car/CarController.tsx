'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CarModel } from './CarModel';
import { carState, resetCar } from '@/store/carState';
import { controls, useKeyboardControls } from '@/hooks/useControls';
import { useGameStore } from '@/store/useGameStore';
import { CAR_CONFIG, WORLD, STATIONS } from '@/utils/config';
import { clamp, damp } from '@/utils/math';

const _forward = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _flat = new THREE.Vector3();

export function CarController() {
  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);

  const phase = useGameStore((s) => s.phase);
  const activeStation = useGameStore((s) => s.activeStation);
  const setNearbyStation = useGameStore((s) => s.setNearbyStation);
  const setSpeed = useGameStore((s) => s.setSpeed);

  useKeyboardControls();

  useEffect(() => {
    resetCar();
  }, []);

  const speedTimer = useRef(0);
  const lastNearby = useRef<string | null>(null);
  const lastEntered = useRef<string | null>(null);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30); // clamp huge frames (tab switches)
    const cfg = CAR_CONFIG;

    // Freeze car physics while not driving or while reading a station panel.
    const locked = phase !== 'driving' || activeStation !== null;
    const c = locked
      ? { forward: 0, backward: 0, left: 0, right: 0, brake: true }
      : controls;

    // --- steering ---------------------------------------------------------
    const steerInput = c.right - c.left;
    carState.steer = damp(carState.steer, steerInput, 8, dt);
    const speedFactor = clamp(Math.abs(carState.speed) / 6, 0, 1);
    const dir = carState.speed >= 0 ? 1 : -1;
    carState.heading -= carState.steer * cfg.turnSpeed * speedFactor * dir * dt;

    // --- longitudinal -----------------------------------------------------
    const throttle = c.forward - c.backward;
    carState.speed += throttle * cfg.accel * dt;
    carState.speed -= carState.speed * cfg.drag * dt; // passive drag
    if (c.brake) carState.speed -= carState.speed * 2.6 * dt; // handbrake slows
    carState.speed = clamp(carState.speed, -cfg.maxReverseSpeed, cfg.maxSpeed);
    if (Math.abs(carState.speed) < 0.02) carState.speed = 0;

    // --- velocity with grip / drift --------------------------------------
    _forward.set(Math.sin(carState.heading), 0, Math.cos(carState.heading));
    _desired.copy(_forward).multiplyScalar(carState.speed);
    const grip = c.brake ? cfg.handbrakeGrip : 1;
    carState.velocity.lerp(_desired, 1 - Math.exp(-cfg.gripRecovery * grip * dt));
    carState.drifting = c.brake && Math.abs(carState.speed) > 8;

    // --- integrate position ----------------------------------------------
    carState.position.addScaledVector(carState.velocity, dt);
    carState.position.y = WORLD.groundY;

    // --- soft circular boundary ------------------------------------------
    _flat.set(carState.position.x, 0, carState.position.z);
    const dist = _flat.length();
    if (dist > WORLD.boundary) {
      const inward = _flat.clone().multiplyScalar(-1 / dist);
      carState.position.x = inward.x * -WORLD.boundary;
      carState.position.z = inward.z * -WORLD.boundary;
      carState.velocity.multiplyScalar(0.4);
      carState.speed *= 0.5;
    }

    // --- apply to scene graph --------------------------------------------
    if (group.current) {
      group.current.position.copy(carState.position);
      group.current.rotation.y = carState.heading;
    }
    if (tilt.current) {
      // body roll on turns + squat under accel for arcade juice
      const roll = -carState.steer * speedFactor * 0.12;
      const pitch = clamp(-throttle * 0.04, -0.05, 0.05);
      tilt.current.rotation.z = damp(tilt.current.rotation.z, roll, 6, dt);
      tilt.current.rotation.x = damp(tilt.current.rotation.x, pitch, 6, dt);
    }

    // --- HUD speed (throttled) -------------------------------------------
    speedTimer.current += dt;
    if (speedTimer.current > 0.08) {
      speedTimer.current = 0;
      setSpeed(Math.abs(carState.speed));
    }

    // --- station proximity -----------------------------------------------
    // Hero is just the spawn point — never a trigger, or it would lock controls.
    let nearest: string | null = null;
    let nearestD = Infinity;
    for (const st of STATIONS) {
      if (st.id === 'hero') continue;
      const dx = carState.position.x - st.position[0];
      const dz = carState.position.z - st.position[2];
      const d = Math.hypot(dx, dz);
      if (d < st.radius && d < nearestD) {
        nearestD = d;
        nearest = st.id;
      }
    }
    if (nearest !== lastNearby.current) {
      lastNearby.current = nearest;
      setNearbyStation(nearest as never);
    }
    // auto-enter a station once mostly stopped inside it
    if (
      nearest &&
      nearest !== lastEntered.current &&
      Math.abs(carState.speed) < 4 &&
      !activeStation
    ) {
      lastEntered.current = nearest;
      useGameStore.getState().enterStation(nearest as never);
    }
    if (!nearest) lastEntered.current = null;
  });

  return (
    <group ref={group}>
      <group ref={tilt}>
        <CarModel />
      </group>
    </group>
  );
}
