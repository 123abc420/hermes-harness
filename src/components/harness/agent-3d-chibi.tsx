'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import { mousePosition } from './agent-3d-shared';
import * as THREE from 'three';

export const STATIONS: Record<AgentVisualState, { pos: [number, number, number]; rot: number; label: string }> = {
  idle:       { pos: [0, 0, 0],     rot: 0,     label: 'CASA' },
  thinking:   { pos: [-2.5, 0, -1.5], rot: 0.6,  label: 'BIBLIOTECA' },
  searching:  { pos: [2.5, 0, -1.5],  rot: -0.6, label: 'OBSERVATORIO' },
  planning:   { pos: [0, 0, -3],     rot: 0,     label: 'MAPA' },
  executing:  { pos: [2.8, 0, 1.5],  rot: -0.8, label: 'TALLER' },
  verifying:  { pos: [-2.8, 0, 1.5], rot: 0.8,  label: 'LABORATORIO' },
  celebrating:{ pos: [0, 0, 2],      rot: 0,     label: 'PLAZA' },
  error:      { pos: [0, 0, -0.5],   rot: 0,     label: '' },
  evolving:   { pos: [0, 0, 0],      rot: 0,     label: 'PORTAL' },
  offline:    { pos: [0, 0, 0],      rot: 0,     label: '' },
};

const SC: Record<AgentVisualState, { body: string; accent: string; eye: string; glow: string }> = {
  idle:       { body: '#f59e0b', accent: '#fbbf24', eye: '#92400e', glow: '#fde68a' },
  thinking:   { body: '#06b6d4', accent: '#22d3ee', eye: '#164e63', glow: '#a5f3fc' },
  searching:  { body: '#fb923c', accent: '#fdba74', eye: '#7c2d12', glow: '#fed7aa' },
  planning:   { body: '#a78bfa', accent: '#c4b5fd', eye: '#4c1d95', glow: '#ddd6fe' },
  executing:  { body: '#f43f5e', accent: '#fda4af', eye: '#881337', glow: '#fecdd3' },
  verifying:  { body: '#34d399', accent: '#6ee7b7', eye: '#064e3b', glow: '#a7f3d0' },
  celebrating:{ body: '#facc15', accent: '#fef08a', eye: '#713f12', glow: '#fef9c3' },
  error:      { body: '#ef4444', accent: '#fca5a5', eye: '#7f1d1d', glow: '#fecaca' },
  evolving:   { body: '#d946ef', accent: '#f0abfc', eye: '#701a75', glow: '#f5d0fe' },
  offline:    { body: '#71717a', accent: '#a1a1aa', eye: '#27272a', glow: '#e4e4e7' },
};

export function ChibiCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);
  const leftCheekRef = useRef<THREE.Mesh>(null);
  const rightCheekRef = useRef<THREE.Mesh>(null);
  const bubbleRef = useRef<THREE.Group>(null);

  const { agentState, message } = useAgentLiveStore();

  const colors = useRef({ body: new THREE.Color(SC.idle.body), accent: new THREE.Color(SC.idle.accent), eye: new THREE.Color(SC.idle.eye), glow: new THREE.Color(SC.idle.glow) });
  const moveState = useRef({ currentPos: new THREE.Vector3(0, 0, 0), currentRot: 0, isWalking: false, walkCycle: 0, targetPos: new THREE.Vector3(0, 0, 0), targetRot: 0 });
  const blinkTimer = useRef(2 + Math.random() * 3);
  const blinkAmount = useRef(0);
  const emoteTimer = useRef(4 + Math.random() * 4);
  const emoteType = useRef<'wave' | 'nod' | 'think' | 'none'>('none');
  const emoteProgress = useRef(0);
  const idlePhase = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current || !headRef.current) return;
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);
    const target = SC[agentState];
    const ms = moveState.current;
    const c = colors.current;

    c.body.lerp(new THREE.Color(target.body), d * 3);
    c.accent.lerp(new THREE.Color(target.accent), d * 3);
    c.eye.lerp(new THREE.Color(target.eye), d * 3);
    c.glow.lerp(new THREE.Color(target.glow), d * 3);

    const station = STATIONS[agentState];
    ms.targetPos.set(station.pos[0], station.pos[1], station.pos[2]);
    ms.targetRot = station.rot;
    const dist = ms.currentPos.distanceTo(ms.targetPos);
    ms.isWalking = dist > 0.08;

    if (ms.isWalking) {
      const dir = new THREE.Vector3().subVectors(ms.targetPos, ms.currentPos);
      dir.y = 0;
      if (dir.length() > 0.01) { dir.normalize(); ms.currentPos.add(dir.multiplyScalar(1.8 * d)); }
      ms.currentRot += (ms.targetRot - ms.currentRot) * d * 4;
      ms.walkCycle += d * 8;
    } else { ms.walkCycle *= 0.9; }

    groupRef.current.position.x = ms.currentPos.x;
    groupRef.current.position.z = ms.currentPos.z;
    groupRef.current.rotation.y = ms.currentRot;
    idlePhase.current += d * 2;
    groupRef.current.position.y = ms.isWalking ? Math.abs(Math.sin(ms.walkCycle)) * 0.08 : Math.sin(idlePhase.current) * 0.03;

    const legSwing = ms.isWalking ? Math.sin(ms.walkCycle) * 0.6 : 0;
    const armSwing = ms.isWalking ? Math.sin(ms.walkCycle) * 0.5 : 0;
    if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

    emoteTimer.current -= d;
    if (emoteTimer.current <= 0 && !ms.isWalking) {
      const types: Array<'wave' | 'nod' | 'think' | 'none'> = ['wave', 'nod', 'think', 'none', 'none', 'none'];
      emoteType.current = types[Math.floor(Math.random() * types.length)];
      emoteTimer.current = 3 + Math.random() * 5;
      emoteProgress.current = 0;
    }
    emoteProgress.current += d * 2;

    if (emoteType.current === 'wave' && rightArmRef.current) {
      rightArmRef.current.rotation.z = -(Math.sin(emoteProgress.current * 6) * 0.5 + 0.8);
      rightArmRef.current.rotation.x = -0.3;
    } else if (rightArmRef.current) { rightArmRef.current.rotation.z *= 0.9; }

    if (emoteType.current === 'nod' && headRef.current) {
      headRef.current.rotation.x = Math.sin(emoteProgress.current * 5) * 0.15;
    } else if (headRef.current) { headRef.current.rotation.x *= 0.92; }

    if (emoteType.current === 'think' && headRef.current) {
      headRef.current.rotation.z = 0.15 + Math.sin(emoteProgress.current * 2) * 0.05;
      if (rightArmRef.current) { rightArmRef.current.rotation.z = -0.3; rightArmRef.current.rotation.x = -1.2; }
    } else if (headRef.current) { headRef.current.rotation.z *= 0.92; }

    const eyeX = mousePosition.x * 0.08;
    const eyeY = mousePosition.y * 0.06;
    if (leftEyeRef.current) { leftEyeRef.current.position.x = -0.14 + eyeX; leftEyeRef.current.position.y = 0.12 + eyeY; }
    if (rightEyeRef.current) { rightEyeRef.current.position.x = 0.14 + eyeX; rightEyeRef.current.position.y = 0.12 + eyeY; }

    blinkTimer.current -= d;
    if (blinkTimer.current <= 0) { blinkAmount.current = 1; blinkTimer.current = 2 + Math.random() * 4; }
    blinkAmount.current *= 0.85;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = 1 - blinkAmount.current * 0.9;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = 1 - blinkAmount.current * 0.9;

    const browY = (agentState === 'thinking' || agentState === 'planning') ? -0.04 : 0;
    const browAngle = agentState === 'error' ? 0.3 : 0;
    if (leftBrowRef.current) { leftBrowRef.current.position.y = 0.28 + browY; leftBrowRef.current.rotation.z = browAngle; }
    if (rightBrowRef.current) { rightBrowRef.current.position.y = 0.28 + browY; rightBrowRef.current.rotation.z = -browAngle; }

    if (mouthRef.current) {
      const mat = mouthRef.current.material as THREE.MeshStandardMaterial;
      mat.color.copy(c.accent); mat.emissive.copy(c.accent);
      const ms2 = { idle: { x: 0.08, y: 0.02 }, thinking: { x: 0.06, y: 0.04 }, searching: { x: 0.1, y: 0.03 }, planning: { x: 0.07, y: 0.02 }, executing: { x: 0.09, y: 0.06 }, verifying: { x: 0.1, y: 0.05 }, celebrating: { x: 0.12, y: 0.08 }, error: { x: 0.1, y: 0.06 }, evolving: { x: 0.09, y: 0.09 }, offline: { x: 0.05, y: 0.01 } }[agentState] ?? { x: 0.08, y: 0.02 };
      mouthRef.current.scale.x = ms2.x; mouthRef.current.scale.y = ms2.y;
      mat.emissiveIntensity = 0.3;
    }

    const cheekOp = (agentState === 'celebrating') ? 0.4 : 0.15;
    if (leftCheekRef.current) { (leftCheekRef.current.material as THREE.MeshBasicMaterial).opacity = cheekOp; }
    if (rightCheekRef.current) { (rightCheekRef.current.material as THREE.MeshBasicMaterial).opacity = cheekOp; }

    if (bubbleRef.current) {
      const show = message && message !== 'Esperando actividad...' && message.length > 0;
      const ts = show ? 1 : 0;
      bubbleRef.current.scale.lerp(new THREE.Vector3(ts, ts, ts), d * 5);
      bubbleRef.current.position.y = 1.3 + Math.sin(t * 1.5) * 0.03;
    }

    bodyRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.userData?.role === 'body') { mat.color.copy(c.body); mat.emissive.copy(c.body); mat.emissiveIntensity = 0.15; }
        else if (mat.userData?.role === 'accent') { mat.color.copy(c.accent); mat.emissive.copy(c.accent); mat.emissiveIntensity = 0.3; }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <circleGeometry args={[0.4, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
      <group ref={bodyRef}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.22, 0.35, 8, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.1} userData={{ role: 'body' }} />
        </mesh>
        <mesh position={[0, 0.02, 0.15]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.6} transparent opacity={0.3} />
        </mesh>
        <group ref={headRef} position={[0, 0.55, 0]}>
          <mesh>
            <sphereGeometry args={[0.32, 24, 24]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.05} userData={{ role: 'body' }} />
          </mesh>
          <mesh position={[0, -0.02, 0.2]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.5} transparent opacity={0.25} />
          </mesh>
          <group ref={leftEyeRef} position={[-0.14, 0.12, 0.22]}>
            <mesh><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={0.1} emissive="#ffffff" emissiveIntensity={0.2} /></mesh>
            <mesh position={[0, 0, 0.06]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#f59e0b" roughness={0.2} userData={{ role: 'accent' }} /></mesh>
            <mesh position={[0, 0, 0.09]}><sphereGeometry args={[0.03, 10, 10]} /><meshStandardMaterial color="#0a0a0a" roughness={0.3} /></mesh>
            <mesh position={[0.03, 0.03, 0.1]}><sphereGeometry args={[0.012, 6, 6]} /><meshBasicMaterial color="#ffffff" /></mesh>
          </group>
          <group ref={rightEyeRef} position={[0.14, 0.12, 0.22]}>
            <mesh><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={0.1} emissive="#ffffff" emissiveIntensity={0.2} /></mesh>
            <mesh position={[0, 0, 0.06]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#f59e0b" roughness={0.2} userData={{ role: 'accent' }} /></mesh>
            <mesh position={[0, 0, 0.09]}><sphereGeometry args={[0.03, 10, 10]} /><meshStandardMaterial color="#0a0a0a" roughness={0.3} /></mesh>
            <mesh position={[0.03, 0.03, 0.1]}><sphereGeometry args={[0.012, 6, 6]} /><meshBasicMaterial color="#ffffff" /></mesh>
          </group>
          <mesh ref={leftBrowRef} position={[-0.14, 0.28, 0.2]}><boxGeometry args={[0.1, 0.02, 0.02]} /><meshStandardMaterial color="#0a0a0a" roughness={0.5} /></mesh>
          <mesh ref={rightBrowRef} position={[0.14, 0.28, 0.2]}><boxGeometry args={[0.1, 0.02, 0.02]} /><meshStandardMaterial color="#0a0a0a" roughness={0.5} /></mesh>
          <mesh ref={leftCheekRef} position={[-0.24, 0.02, 0.18]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#fb923c" transparent opacity={0.15} /></mesh>
          <mesh ref={rightCheekRef} position={[0.24, 0.02, 0.18]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#fb923c" transparent opacity={0.15} /></mesh>
          <mesh ref={mouthRef} position={[0, -0.08, 0.26]}><sphereGeometry args={[0.06, 12, 8]} /><meshStandardMaterial color="#f59e0b" roughness={0.4} userData={{ role: 'accent' }} /></mesh>
          <group position={[0, 0.32, 0]}>
            <mesh position={[0, 0.12, 0]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} roughness={0.2} userData={{ role: 'accent' }} /></mesh>
            <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.015, 0.015, 0.08, 6]} /><meshStandardMaterial color="#f59e0b" roughness={0.4} userData={{ role: 'body' }} /></mesh>
          </group>
        </group>
        <group ref={leftArmRef} position={[-0.3, 0.08, 0]}>
          <mesh position={[0, -0.12, 0]}><capsuleGeometry args={[0.06, 0.18, 6, 12]} /><meshStandardMaterial color="#f59e0b" roughness={0.4} userData={{ role: 'body' }} /></mesh>
          <mesh position={[0, -0.25, 0]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#fef3c7" roughness={0.5} /></mesh>
        </group>
        <group ref={rightArmRef} position={[0.3, 0.08, 0]}>
          <mesh position={[0, -0.12, 0]}><capsuleGeometry args={[0.06, 0.18, 6, 12]} /><meshStandardMaterial color="#f59e0b" roughness={0.4} userData={{ role: 'body' }} /></mesh>
          <mesh position={[0, -0.25, 0]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#fef3c7" roughness={0.5} /></mesh>
        </group>
        <group ref={leftLegRef} position={[-0.1, -0.32, 0]}>
          <mesh position={[0, -0.1, 0]}><capsuleGeometry args={[0.07, 0.15, 6, 12]} /><meshStandardMaterial color="#f59e0b" roughness={0.4} userData={{ role: 'body' }} /></mesh>
          <mesh position={[0, -0.22, 0.03]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#92400e" roughness={0.6} /></mesh>
        </group>
        <group ref={rightLegRef} position={[0.1, -0.32, 0]}>
          <mesh position={[0, -0.1, 0]}><capsuleGeometry args={[0.07, 0.15, 6, 12]} /><meshStandardMaterial color="#f59e0b" roughness={0.4} userData={{ role: 'body' }} /></mesh>
          <mesh position={[0, -0.22, 0.03]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#92400e" roughness={0.6} /></mesh>
        </group>
      </group>
      <group ref={bubbleRef} position={[0, 1.3, 0]} scale={[0, 0, 0]}>
        <mesh position={[0, 0, 0]}><planeGeometry args={[1.8, 0.5]} /><meshBasicMaterial color="#1c1917" transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, -0.01]}><planeGeometry args={[1.85, 0.55]} /><meshBasicMaterial color="#f59e0b" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 4]}><planeGeometry args={[0.2, 0.2]} /><meshBasicMaterial color="#1c1917" transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.1} color="#fef3c7" anchorX="center" anchorY="middle" maxWidth={1.6} font={undefined}>
          {message && message !== 'Esperando actividad...' ? message.slice(0, 40) : ''}
        </Text>
      </group>
    </group>
  );
}