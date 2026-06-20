'use client';

import React, { useRef, useMemo, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAgentLiveStore } from '@/store/agent-live-store';
import {
  STATION_COLORS as STATE_COLORS,
  characterWorldPos, arrivalFlash,
} from './agent-3d-shared';
import { ChibiCharacter } from './agent-3d-chibi';

/* ═══════════════════════════════════════════════════════════════════════
   ARRIVAL FLASH — brief glow when character arrives at station
   ═══════════════════════════════════════════════════════════════════════ */
export const ArrivalFlashLight = memo(function ArrivalFlashLight() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.intensity = arrivalFlash.intensity;
      lightRef.current.color.set(arrivalFlash.color);
      lightRef.current.position.set(characterWorldPos.x, 0.5, characterWorldPos.z);
    }
  });

  return <pointLight ref={lightRef} intensity={0} distance={3} color="#6366f1" />;
});

/* ═══════════════════════════════════════════════════════════════════════
   CHARACTER BRIDGE — renders ChibiCharacter directly (VRM removed W226)
   ═══════════════════════════════════════════════════════════════════════ */
export function CharacterGroup() {
  const agentState = useAgentLiveStore(s => s.agentState);
  const stateColor = STATE_COLORS[agentState];

  return (
    <group>
      <ChibiCharacter />
      <ArrivalFlashLight />
      {/* Ground glow at character feet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[characterWorldPos.x, 0.008, characterWorldPos.z]}>
        <ringGeometry args={[0.15, 0.5, 24]} />
        <meshStandardMaterial
          color={stateColor} emissive={stateColor} emissiveIntensity={0.8}
          transparent opacity={0.2} side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* Chat bubble removed (drei Html eliminated for compile speed). Message shown in sidebar feed instead. */

/* Bridge — renders character (chat bubble removed for compile speed) */
export function CharacterBridge() {
  return (
    <group>
      <CharacterGroup />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CAMERA CONTROLLER — smooth third-person follow
   ═══════════════════════════════════════════════════════════════════════ */
export const CameraController = memo(function CameraController() {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0.8, 0), []);

  useFrame((_, delta) => {
    // Target: character position + offset up
    const lookTarget = new THREE.Vector3(
      characterWorldPos.x,
      0.8,
      characterWorldPos.z
    );
    target.lerp(lookTarget, delta * 2);

    // Camera position: offset behind and above
    const camPos = new THREE.Vector3(
      characterWorldPos.x * 0.3,
      3.5,
      characterWorldPos.z + 5.5
    );
    camera.position.lerp(camPos, delta * 1.5);
    camera.lookAt(target);
  });

  return null;
});

/* ═══════════════════════════════════════════════════════════════════════
   STATE-REACTIVE LIGHT — color changes with agent state
   ═══════════════════════════════════════════════════════════════════════ */
export function StateLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const agentState = useAgentLiveStore(s => s.agentState);
  const color = STATE_COLORS[agentState];

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.color.set(color);
      lightRef.current.position.set(characterWorldPos.x, 1.5, characterWorldPos.z);
    }
  });

  return <pointLight ref={lightRef} intensity={0.4} distance={4} color={color} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING PARTICLES — ambient atmosphere
   ═══════════════════════════════════════════════════════════════════════ */
export const FloatingParticles = memo(function FloatingParticles() {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 3 + 0.3, (Math.random() - 0.5) * 12),
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.03,
    })), []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      dummy.position.set(
        p.pos.x + Math.sin(t * p.speed + p.offset) * 0.3,
        p.pos.y + Math.sin(t * p.speed * 0.7 + p.offset) * 0.4,
        p.pos.z + Math.cos(t * p.speed + p.offset) * 0.3
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#a5f3fc" emissive="#a5f3fc" emissiveIntensity={0.8} transparent opacity={0.6} />
    </instancedMesh>
  );
});