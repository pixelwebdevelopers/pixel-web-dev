'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { carState } from '@/store/carState';

const POOL = 90;
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _color = new THREE.Color('#7a4520');
const _drift = new THREE.Color('#5c3318');

/**
 * Glowing tire trail. A fixed pool of additive ground quads is dropped at the
 * rear wheels while moving (brighter/pink while drifting), then fades out by
 * shrinking — cheap, GPU-friendly, and no per-frame allocations.
 */
export function TireTrail() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const life = useRef<Float32Array>(new Float32Array(POOL));
  const cursor = useRef(0);
  const dropTimer = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const im = mesh.current;
    if (!im) return;

    const moving = Math.abs(carState.speed) > 4;
    dropTimer.current += dt;
    const interval = carState.drifting ? 0.02 : 0.05;

    if (moving && dropTimer.current >= interval) {
      dropTimer.current = 0;
      // rear-wheel world offsets
      const cos = Math.cos(carState.heading);
      const sin = Math.sin(carState.heading);
      const rearX = carState.position.x - sin * 1.15;
      const rearZ = carState.position.z - cos * 1.15;
      const sideX = cos * 0.9;
      const sideZ = -sin * 0.9;

      for (const s of [1, -1]) {
        const i = cursor.current % POOL;
        cursor.current++;
        _p.set(rearX + sideX * s, 0.05, rearZ + sideZ * s);
        _m.compose(_p, _q, new THREE.Vector3(0.35, 1.6, 1));
        im.setMatrixAt(i, _m);
        im.setColorAt(i, carState.drifting ? _drift : _color);
        life.current[i] = carState.drifting ? 1 : 0.6;
      }
    }

    // fade everything
    let dirty = false;
    for (let i = 0; i < POOL; i++) {
      if (life.current[i] > 0) {
        life.current[i] = Math.max(0, life.current[i] - dt * 0.8);
        im.getMatrixAt(i, _m);
        _m.decompose(_p, _q, _s);
        const k = life.current[i];
        _m.compose(_p, _q, _s.set(0.35 * k, 1.6 * k, 1));
        im.setMatrixAt(i, _m);
        dirty = true;
      }
    }
    if (dirty) {
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, POOL]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent opacity={0.28} depthWrite={false} />
    </instancedMesh>
  );
}
