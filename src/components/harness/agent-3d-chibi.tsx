'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAgentLiveStore } from '@/store/agent-live-store';
import {
  STATIONS, STATION_COLORS as STATE_COLORS, mousePosition,
  characterWorldPos, arrivalFlash,
} from './agent-3d-shared';

/* ═══════════════════════════════════════════════════════════════════════
   CHIBI CHARACTER — cute humanoid fallback
   ═══════════════════════════════════════════════════════════════════════ */
export function ChibiCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const blushRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  const agentState = useAgentLiveStore(s => s.agentState);
  const stateRef = useRef(agentState);
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const targetRot = useRef(0);
  const prevRot = useRef(0);
  const isMoving = useRef(false);

  useEffect(() => {
    stateRef.current = agentState;
  }, [agentState]);

  useEffect(() => {
    const station = STATIONS[agentState];
    if (station) {
      targetPos.set(station.pos[0], station.pos[1], station.pos[2]);
      targetRot.current = station.rot;
    }
  }, [agentState, targetPos]);

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    const g = groupRef.current;
    const b = bodyRef.current;
    const t = state.clock.elapsedTime;

    // Movement
    const dist = g.position.distanceTo(targetPos);
    const wasMoving = isMoving.current;
    isMoving.current = dist > 0.05;

    // Trigger arrival flash when stopping
    if (wasMoving && !isMoving.current) {
      arrivalFlash.intensity = 2.0;
      arrivalFlash.color = STATE_COLORS[stateRef.current] || '#6366f1';
    }
    // Decay flash
    if (arrivalFlash.intensity > 0) {
      arrivalFlash.intensity = Math.max(0, arrivalFlash.intensity - delta * 3);
    }
    if (isMoving.current) {
      g.position.lerp(targetPos, delta * 2.5);
      // Face movement direction
      const dir = new THREE.Vector3().subVectors(targetPos, g.position);
      if (dir.length() > 0.01) {
        const angle = Math.atan2(dir.x, dir.z);
        prevRot.current = THREE.MathUtils.lerp(prevRot.current, angle + Math.PI, delta * 5);
        g.rotation.y = prevRot.current;
      }
    } else {
      // At station — face the target rotation
      const stationAngle = targetRot.current + Math.PI;
      prevRot.current = THREE.MathUtils.lerp(prevRot.current, stationAngle, delta * 2);
      g.rotation.y = prevRot.current;
    }

    // Walk animation
    const walkSpeed = 6;
    const walkAmp = isMoving.current ? 0.4 : 0;
    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmp;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp;
    if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp * 0.7;
    if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmp * 0.7;

    // Body bob while walking
    if (isMoving.current) {
      b.position.y = Math.abs(Math.sin(t * walkSpeed * 2)) * 0.03;
    } else {
      // Idle breathing
      b.position.y = Math.sin(t * 1.5) * 0.01;
      b.scale.y = 1 + Math.sin(t * 2) * 0.008;
    }

    // Head subtle movement
    if (headRef.current && !isMoving.current) {
      headRef.current.rotation.z = Math.sin(t * 0.7) * 0.03;
      headRef.current.rotation.x = Math.sin(t * 0.5) * 0.02;
    }

    // State-specific gestures (only when not moving)
    if (!isMoving.current) {
      const st = stateRef.current;
      if (st === 'celebrating') {
        // Both arms wave up
        const wave = Math.sin(t * 4) * 0.3;
        if (leftArmRef.current) { leftArmRef.current.rotation.z = 1.2 + wave; leftArmRef.current.rotation.x = -0.5; }
        if (rightArmRef.current) { rightArmRef.current.rotation.z = -1.2 - wave; rightArmRef.current.rotation.x = -0.5; }
        // Bounce
        if (headRef.current) headRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.05;
      } else if (st === 'thinking') {
        // Right hand near chin, left down
        if (rightArmRef.current) { rightArmRef.current.rotation.z = -0.3; rightArmRef.current.rotation.x = -1.0; }
        if (leftArmRef.current) { leftArmRef.current.rotation.z = 0.1; leftArmRef.current.rotation.x = 0; }
        // Head tilt
        if (headRef.current) headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0.15, delta * 3);
      } else if (st === 'executing') {
        // Punching motion with right arm
        const punch = Math.max(0, Math.sin(t * 3));
        if (rightArmRef.current) { rightArmRef.current.rotation.x = -punch * 1.2; rightArmRef.current.rotation.z = -0.2; }
        if (leftArmRef.current) { leftArmRef.current.rotation.z = 0.2; leftArmRef.current.rotation.x = -0.3; }
      } else if (st === 'searching') {
        // Hand over eyes (looking far)
        if (rightArmRef.current) { rightArmRef.current.rotation.x = -1.3; rightArmRef.current.rotation.z = -0.3; }
        if (leftArmRef.current) { leftArmRef.current.rotation.z = 0.1; leftArmRef.current.rotation.x = 0; }
        if (headRef.current) headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.1, delta * 2);
      } else if (st === 'error') {
        // Hands on head
        if (leftArmRef.current) { leftArmRef.current.rotation.z = 0.8; leftArmRef.current.rotation.x = -1.5; }
        if (rightArmRef.current) { rightArmRef.current.rotation.z = -0.8; rightArmRef.current.rotation.x = -1.5; }
        // Shake head
        if (headRef.current) headRef.current.rotation.z = Math.sin(t * 8) * 0.1;
      } else if (st === 'planning') {
        // Arms crossed (both slightly forward)
        if (leftArmRef.current) { leftArmRef.current.rotation.z = 0.5; leftArmRef.current.rotation.x = -0.6; }
        if (rightArmRef.current) { rightArmRef.current.rotation.z = -0.5; rightArmRef.current.rotation.x = -0.6; }
      } else if (st === 'verifying') {
        // Nodding head
        if (headRef.current) headRef.current.rotation.x = Math.sin(t * 3) * 0.08;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.1;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -0.1;
      } else if (st === 'evolving') {
        // Spin effect via arm rotation
        const spin = t * 2;
        if (leftArmRef.current) { leftArmRef.current.rotation.z = 1.0 + Math.sin(spin) * 0.3; leftArmRef.current.rotation.x = -0.5 + Math.cos(spin) * 0.3; }
        if (rightArmRef.current) { rightArmRef.current.rotation.z = -1.0 - Math.sin(spin) * 0.3; rightArmRef.current.rotation.x = -0.5 + Math.cos(spin) * 0.3; }
      } else {
        // Reset arms to neutral
        if (leftArmRef.current) { leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, delta * 3); leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 3); }
        if (rightArmRef.current) { rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, delta * 3); rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, delta * 3); }
      }
    } else {
      // Reset gesture rotations while walking
      if (leftArmRef.current) { leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, delta * 5); }
      if (rightArmRef.current) { rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, delta * 5); }
    }

    // Eye tracking
    const mx = mousePosition.x * 0.02;
    const my = mousePosition.y * 0.015;
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.07 + mx;
      leftPupilRef.current.position.y = 0.72 + my;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.07 + mx;
      rightPupilRef.current.position.y = 0.72 + my;
    }

    // Blink (every 3-5s)
    const blinkCycle = t % (3 + Math.sin(t * 0.1) * 1);
    const isBlinking = blinkCycle > 3.8 && blinkCycle < 4.0;
    if (headRef.current) {
      const sy = isBlinking ? 0.1 : 1;
      headRef.current.scale.y = THREE.MathUtils.lerp(headRef.current.scale.y, sy, delta * 20);
    }

    // Blush on certain states
    if (blushRef.current) {
      const showBlush = stateRef.current === 'celebrating' || stateRef.current === 'thinking';
      blushRef.current.visible = showBlush;
    }

    // Mouth shape by state
    if (mouthRef.current) {
      const ms = mouthRef.current.scale;
      const st = stateRef.current;
      if (st === 'celebrating' || st === 'happy') {
        ms.x = THREE.MathUtils.lerp(ms.x, 1.2, delta * 5);
        ms.y = THREE.MathUtils.lerp(ms.y, 1.5, delta * 5);
      } else if (st === 'error') {
        ms.x = THREE.MathUtils.lerp(ms.x, 1.5, delta * 5);
        ms.y = THREE.MathUtils.lerp(ms.y, 0.5, delta * 5);
      } else if (st === 'thinking') {
        ms.x = THREE.MathUtils.lerp(ms.x, 0.8, delta * 5);
        ms.y = THREE.MathUtils.lerp(ms.y, 0.5, delta * 5);
      } else {
        ms.x = THREE.MathUtils.lerp(ms.x, 1, delta * 5);
        ms.y = THREE.MathUtils.lerp(ms.y, 0.8, delta * 5);
      }
    }

    // Update shared world position
    characterWorldPos.copy(g.position);
  });

  const bodyColor = STATE_COLORS[agentState];

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyRef}>
        {/* Head */}
        <group ref={headRef}>
          <mesh position={[0, 0.72, 0]} castShadow>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 0.82, -0.02]} castShadow>
            <sphereGeometry args={[0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#4A3728" roughness={0.8} />
          </mesh>
          {/* Hair bangs */}
          <mesh position={[0, 0.78, 0.12]} castShadow>
            <boxGeometry args={[0.35, 0.08, 0.08]} />
            <meshStandardMaterial color="#4A3728" roughness={0.8} />
          </mesh>
          {/* Left Eye white */}
          <mesh position={[-0.07, 0.73, 0.17]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Right Eye white */}
          <mesh position={[0.07, 0.73, 0.17]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Left Pupil */}
          <mesh ref={leftPupilRef} position={[-0.07, 0.73, 0.21]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          {/* Right Pupil */}
          <mesh ref={rightPupilRef} position={[0.07, 0.73, 0.21]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          {/* Blush */}
          <group ref={blushRef} visible={false}>
            <mesh position={[-0.14, 0.68, 0.14]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#ff9999" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0.14, 0.68, 0.14]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#ff9999" transparent opacity={0.4} />
            </mesh>
          </group>
          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, 0.64, 0.2]} scale={[1, 0.8, 0.3]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#cc6666" />
          </mesh>
        </group>

        {/* Body */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.26, 0.32, 0.16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        {/* Belt */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.27, 0.04, 0.17]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} />
        </mesh>
        {/* Scarf */}
        <mesh position={[0, 0.52, 0.04]} castShadow>
          <boxGeometry args={[0.2, 0.06, 0.1]} />
          <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.3} roughness={0.5} />
        </mesh>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.2, 0.48, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.24, 6]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.2, 0.48, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.24, 6]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.07, 0.22, 0]}>
          <mesh position={[0, -0.11, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.22, 6]} />
            <meshStandardMaterial color="#37474F" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.23, 0.02]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
            <meshStandardMaterial color="#5D4037" roughness={0.8} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.07, 0.22, 0]}>
          <mesh position={[0, -0.11, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.22, 6]} />
            <meshStandardMaterial color="#37474F" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.23, 0.02]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
            <meshStandardMaterial color="#5D4037" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Ground aura */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.2, 0.45, 24]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.6} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}