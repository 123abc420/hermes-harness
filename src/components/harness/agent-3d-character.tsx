'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { mousePosition, STATIONS } from './agent-3d-shared';
import { useAgentLiveStore } from '@/store/agent-live-store';
import type { AgentVisualState } from '@/store/agent-live-store';

const STATE_COLORS: Record<AgentVisualState, string> = {
  idle: '#f59e0b',
  thinking: '#06b6d4',
  searching: '#fb923c',
  planning: '#a78bfa',
  executing: '#f43f5e',
  verifying: '#34d399',
  celebrating: '#facc15',
  error: '#ef4444',
  evolving: '#d946ef',
  offline: '#71717a',
};

const EYE_COLORS: Record<AgentVisualState, string> = {
  idle: '#92400e',
  thinking: '#155e75',
  searching: '#9a3412',
  planning: '#5b21b6',
  executing: '#9f1239',
  verifying: '#065f46',
  celebrating: '#854d0e',
  error: '#7f1d1d',
  evolving: '#86198f',
  offline: '#3f3f46',
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(a: string, b: string, t: number): THREE.Color {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return ca.lerp(cb, t);
}

export function ChibiCharacter() {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftEyeRef = useRef<THREE.Mesh>(null!);
  const rightEyeRef = useRef<THREE.Mesh>(null!);
  const leftPupilRef = useRef<THREE.Mesh>(null!);
  const rightPupilRef = useRef<THREE.Mesh>(null!);
  const leftArmRef = useRef<THREE.Mesh>(null!);
  const rightArmRef = useRef<THREE.Mesh>(null!);
  const leftLegRef = useRef<THREE.Mesh>(null!);
  const rightLegRef = useRef<THREE.Mesh>(null!);
  const mouthRef = useRef<THREE.Mesh>(null!);
  const bubbleRef = useRef<THREE.Group>(null!);
  const bubbleTextRef = useRef<any>(null!);

  const agentState = useAgentLiveStore((s) => s.agentState);
  const message = useAgentLiveStore((s) => s.message);

  const stateRef = useRef(agentState);
  const currentColor = useRef(new THREE.Color(STATE_COLORS.idle));
  const currentEyeColor = useRef(new THREE.Color(EYE_COLORS.idle));
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentRot = useRef(0);
  const targetRot = useRef(0);
  const blinkTimer = useRef(0);
  const blinkState = useRef(0);
  const walkPhase = useRef(0);
  const isWalking = useRef(false);
  const emoteTimer = useRef(Math.random() * 4 + 2);
  const emoteType = useRef(0);
  const emotePhase = useRef(0);
  const prevMessage = useRef(message);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const station = STATIONS[agentState];
    const newTarget = new THREE.Vector3(...station.pos);

    if (!newTarget.equals(targetPos.current)) {
      targetPos.current.copy(newTarget);
      targetRot.current = station.rot;
      isWalking.current = true;
    }

    const dist = currentPos.current.distanceTo(targetPos.current);
    if (isWalking.current && dist > 0.05) {
      walkPhase.current += clampedDelta * 8;
      currentPos.current.lerp(targetPos.current, clampedDelta * 3);
      currentRot.current = lerp(currentRot.current, targetRot.current, clampedDelta * 5);
    } else if (dist <= 0.05) {
      isWalking.current = false;
      walkPhase.current = 0;
    }

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.position.y = 0;
    groupRef.current.rotation.y = currentRot.current;

    // Color lerp
    if (stateRef.current !== agentState) {
      stateRef.current = agentState;
    }
    const targetColor = new THREE.Color(STATE_COLORS[agentState]);
    const targetEyeColor = new THREE.Color(EYE_COLORS[agentState]);
    currentColor.current.lerp(targetColor, clampedDelta * 3);
    currentEyeColor.current.lerp(targetEyeColor, clampedDelta * 3);
    (bodyRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
    const accentColor = currentColor.current.clone().multiplyScalar(0.7);
    (leftArmRef.current.material as THREE.MeshStandardMaterial).color.copy(accentColor);
    (rightArmRef.current.material as THREE.MeshStandardMaterial).color.copy(accentColor);
    (leftLegRef.current.material as THREE.MeshStandardMaterial).color.copy(accentColor);
    (rightLegRef.current.material as THREE.MeshStandardMaterial).color.copy(accentColor);
    (leftEyeRef.current.material as THREE.MeshStandardMaterial).color.copy(currentEyeColor.current);
    (rightEyeRef.current.material as THREE.MeshStandardMaterial).color.copy(currentEyeColor.current);

    // Eye tracking
    const eyeLookX = THREE.MathUtils.clamp(mousePosition.x * 0.04, -0.04, 0.04);
    const eyeLookY = THREE.MathUtils.clamp(mousePosition.y * 0.03, -0.02, 0.02);
    leftPupilRef.current.position.x = -0.12 + eyeLookX;
    leftPupilRef.current.position.y = 0.93 + eyeLookY;
    rightPupilRef.current.position.x = 0.12 + eyeLookX;
    rightPupilRef.current.position.y = 0.93 + eyeLookY;

    // Blinking
    blinkTimer.current -= clampedDelta;
    if (blinkTimer.current <= 0) {
      blinkTimer.current = Math.random() * 4 + 2;
      blinkState.current = 1;
    }
    if (blinkState.current > 0) {
      blinkState.current -= clampedDelta * 8;
      if (blinkState.current < 0) blinkState.current = 0;
      const scaleY = 1 - blinkState.current;
      leftEyeRef.current.scale.y = scaleY;
      rightEyeRef.current.scale.y = scaleY;
    } else {
      leftEyeRef.current.scale.y = 1;
      rightEyeRef.current.scale.y = 1;
    }

    // Walking animation
    if (isWalking.current) {
      const swing = Math.sin(walkPhase.current) * 0.4;
      leftArmRef.current.rotation.x = swing;
      rightArmRef.current.rotation.x = -swing;
      leftLegRef.current.rotation.x = -swing;
      rightLegRef.current.rotation.x = swing;
      headRef.current.position.y = 0.95 + Math.abs(Math.sin(walkPhase.current)) * 0.03;
    } else {
      // Idle emotes
      emoteTimer.current -= clampedDelta;
      if (emoteTimer.current <= 0) {
        emoteTimer.current = Math.random() * 5 + 3;
        emoteType.current = Math.floor(Math.random() * 3);
        emotePhase.current = 0;
      }
      leftArmRef.current.rotation.x = lerp(leftArmRef.current.rotation.x, 0, clampedDelta * 5);
      rightArmRef.current.rotation.x = lerp(rightArmRef.current.rotation.x, 0, clampedDelta * 5);
      leftLegRef.current.rotation.x = lerp(leftLegRef.current.rotation.x, 0, clampedDelta * 5);
      rightLegRef.current.rotation.x = lerp(rightLegRef.current.rotation.x, 0, clampedDelta * 5);

      if (emotePhase.current < 1) {
        emotePhase.current += clampedDelta * 0.8;
        if (emotePhase.current > 1) emotePhase.current = 1;
        const t = emotePhase.current;
        if (emoteType.current === 0) {
          // Wave
          rightArmRef.current.rotation.z = -Math.sin(t * Math.PI * 2) * 0.5 - 0.3;
          rightArmRef.current.rotation.x = -0.3;
        } else if (emoteType.current === 1) {
          // Nod
          headRef.current.rotation.x = Math.sin(t * Math.PI * 3) * 0.15;
        } else {
          // Think pose
          rightArmRef.current.rotation.z = -0.3;
          rightArmRef.current.rotation.x = -1.2;
          headRef.current.rotation.z = 0.1;
        }
      } else {
        headRef.current.rotation.x = lerp(headRef.current.rotation.x, 0, clampedDelta * 5);
        headRef.current.rotation.z = lerp(headRef.current.rotation.z, 0, clampedDelta * 5);
      }
      // Idle bob
      const bob = Math.sin(Date.now() * 0.003) * 0.015;
      headRef.current.position.y = 0.95 + bob;
    }

    // Chat bubble
    if (message && message !== prevMessage.current) {
      prevMessage.current = message;
      if (bubbleTextRef.current) {
        bubbleTextRef.current.text = message.length > 40 ? message.slice(0, 37) + '...' : message;
      }
    }
    const showBubble = !!message;
    const targetScaleY = showBubble ? 1 : 0;
    bubbleRef.current.scale.y = lerp(bubbleRef.current.scale.y, targetScaleY, clampedDelta * 8);
    bubbleRef.current.visible = showBubble || bubbleRef.current.scale.y > 0.01;
  });

  const accentColorHex = STATE_COLORS[agentState];

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.35, 8, 16]} />
        <meshStandardMaterial color={STATE_COLORS.idle} roughness={0.4} />
      </mesh>

      {/* Head group */}
      <group ref={headRef} position={[0, 0.95, 0]}>
        {/* Head sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#fde8d0" roughness={0.6} />
        </mesh>

        {/* Antenna */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshStandardMaterial color={accentColorHex} />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={accentColorHex} emissive={accentColorHex} emissiveIntensity={0.5} />
        </mesh>

        {/* Left eye white */}
        <mesh ref={leftEyeRef} position={[-0.12, 0.03, 0.24]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Left pupil */}
        <mesh ref={leftPupilRef} position={[-0.12, 0.03, 0.29]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        {/* Left eye highlight */}
        <mesh position={[-0.1, 0.06, 0.3]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Right eye white */}
        <mesh ref={rightEyeRef} position={[0.12, 0.03, 0.24]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Right pupil */}
        <mesh ref={rightPupilRef} position={[0.12, 0.03, 0.29]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        {/* Right eye highlight */}
        <mesh position={[0.14, 0.06, 0.3]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.12, 0.13, 0.25]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.08, 0.015, 0.01]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.12, 0.13, 0.25]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.08, 0.015, 0.01]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.08, 0.27]}>
          <boxGeometry args={[0.06, 0.015, 0.01]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>

        {/* Cheeks */}
        <mesh position={[-0.2, -0.02, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#fda4af" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.2, -0.02, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#fda4af" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.32, 0.5, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
        <meshStandardMaterial color={accentColorHex} roughness={0.5} />
      </mesh>
      {/* Left hand */}
      <mesh position={[-0.38, 0.28, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#fde8d0" roughness={0.6} />
      </mesh>

      {/* Right arm */}
      <mesh ref={rightArmRef} position={[0.32, 0.5, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
        <meshStandardMaterial color={accentColorHex} roughness={0.5} />
      </mesh>
      {/* Right hand */}
      <mesh position={[0.38, 0.28, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#fde8d0" roughness={0.6} />
      </mesh>

      {/* Left leg */}
      <mesh ref={leftLegRef} position={[-0.1, 0.12, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.15, 8, 8]} />
        <meshStandardMaterial color={accentColorHex} roughness={0.5} />
      </mesh>
      {/* Left shoe */}
      <mesh position={[-0.1, 0.0, 0.03]}>
        <boxGeometry args={[0.1, 0.05, 0.14]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>

      {/* Right leg */}
      <mesh ref={rightLegRef} position={[0.1, 0.12, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.15, 8, 8]} />
        <meshStandardMaterial color={accentColorHex} roughness={0.5} />
      </mesh>
      {/* Right shoe */}
      <mesh position={[0.1, 0.0, 0.03]}>
        <boxGeometry args={[0.1, 0.05, 0.14]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>

      {/* Chat bubble */}
      <group ref={bubbleRef} position={[0, 1.6, 0]}>
        <mesh>
          <planeGeometry args={[0.9, 0.35]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.92} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.22, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.06, 0.12, 3]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.92} />
        </mesh>
        <Text
          ref={bubbleTextRef}
          position={[0, 0, 0.01]}
          fontSize={0.06}
          color="#1c1917"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.8}
          overflowWrap="break-word"
        >
          {message?.length ? (message.length > 40 ? message.slice(0, 37) + '...' : message) : ''}
        </Text>
      </group>
    </group>
  );
}