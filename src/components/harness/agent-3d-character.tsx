'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import { mousePosition } from './agent-3d-mouse';
import * as THREE from 'three';

// ─── State Visual Configuration ────────────────────────────────────────
interface StateConfig3D {
  primary: string;
  secondary: string;
  emissive: string;
  pulseSpeed: number;
  pulseIntensity: number;
  orbitSpeed: number;
  particleSpeed: number;
  bobAmplitude: number;
  bobSpeed: number;
  eyeScale: number;
  eyeSquint: number;
  browAngle: number;
  mouthCurve: number;
  mouthOpen: number;
  cheekGlow: number;
  glowIntensity: number;
  shakeIntensity: number;
  celebrationBounce: number;
  auraSize: number;
  auraOpacity: number;
}

const STATE_3D: Record<AgentVisualState, StateConfig3D> = {
  idle: {
    primary: '#10b981', secondary: '#059669', emissive: '#10b981',
    pulseSpeed: 0.8, pulseIntensity: 0.15, orbitSpeed: 0.3, particleSpeed: 0.15,
    bobAmplitude: 0.12, bobSpeed: 0.6, eyeScale: 1.0, eyeSquint: 0.05,
    browAngle: 0, mouthCurve: 0.2, mouthOpen: 0, cheekGlow: 0.05,
    glowIntensity: 0.5, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.6, auraOpacity: 0.06,
  },
  thinking: {
    primary: '#06b6d4', secondary: '#0891b2', emissive: '#22d3ee',
    pulseSpeed: 1.8, pulseIntensity: 0.25, orbitSpeed: 0.6, particleSpeed: 0.3,
    bobAmplitude: 0.08, bobSpeed: 1.2, eyeScale: 0.85, eyeSquint: 0.4,
    browAngle: -0.2, mouthCurve: -0.1, mouthOpen: 0.15, cheekGlow: 0.1,
    glowIntensity: 0.7, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.8, auraOpacity: 0.08,
  },
  searching: {
    primary: '#f59e0b', secondary: '#d97706', emissive: '#fbbf24',
    pulseSpeed: 1.2, pulseIntensity: 0.2, orbitSpeed: 0.9, particleSpeed: 0.5,
    bobAmplitude: 0.2, bobSpeed: 1.5, eyeScale: 1.15, eyeSquint: 0,
    browAngle: -0.1, mouthCurve: 0, mouthOpen: 0.05, cheekGlow: 0.08,
    glowIntensity: 0.6, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.9, auraOpacity: 0.07,
  },
  planning: {
    primary: '#8b5cf6', secondary: '#7c3aed', emissive: '#a78bfa',
    pulseSpeed: 0.5, pulseIntensity: 0.18, orbitSpeed: 0.4, particleSpeed: 0.25,
    bobAmplitude: 0.06, bobSpeed: 0.4, eyeScale: 0.9, eyeSquint: 0.2,
    browAngle: -0.15, mouthCurve: 0, mouthOpen: 0.1, cheekGlow: 0.05,
    glowIntensity: 0.8, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 2.0, auraOpacity: 0.09,
  },
  executing: {
    primary: '#f43f5e', secondary: '#e11d48', emissive: '#fb7185',
    pulseSpeed: 2.5, pulseIntensity: 0.35, orbitSpeed: 1.4, particleSpeed: 0.7,
    bobAmplitude: 0.2, bobSpeed: 2.0, eyeScale: 1.1, eyeSquint: 0,
    browAngle: 0.1, mouthCurve: 0, mouthOpen: 0.2, cheekGlow: 0.15,
    glowIntensity: 1.2, shakeIntensity: 0.01, celebrationBounce: 0,
    auraSize: 2.2, auraOpacity: 0.1,
  },
  verifying: {
    primary: '#34d399', secondary: '#10b981', emissive: '#6ee7b7',
    pulseSpeed: 1.0, pulseIntensity: 0.15, orbitSpeed: 0.5, particleSpeed: 0.3,
    bobAmplitude: 0.1, bobSpeed: 0.8, eyeScale: 0.95, eyeSquint: 0.1,
    browAngle: 0, mouthCurve: 0.3, mouthOpen: 0.05, cheekGlow: 0.08,
    glowIntensity: 0.6, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.7, auraOpacity: 0.06,
  },
  celebrating: {
    primary: '#eab308', secondary: '#facc15', emissive: '#fde047',
    pulseSpeed: 3.5, pulseIntensity: 0.45, orbitSpeed: 2.2, particleSpeed: 1.2,
    bobAmplitude: 0.35, bobSpeed: 3.0, eyeScale: 1.25, eyeSquint: 0,
    browAngle: 0.15, mouthCurve: 1, mouthOpen: 0.5, cheekGlow: 0.3,
    glowIntensity: 1.8, shakeIntensity: 0, celebrationBounce: 0.15,
    auraSize: 2.5, auraOpacity: 0.12,
  },
  error: {
    primary: '#ef4444', secondary: '#dc2626', emissive: '#f87171',
    pulseSpeed: 5.0, pulseIntensity: 0.5, orbitSpeed: 0.15, particleSpeed: 0.08,
    bobAmplitude: 0.03, bobSpeed: 0.2, eyeScale: 0.7, eyeSquint: 0.3,
    browAngle: 0.25, mouthCurve: -0.8, mouthOpen: 0.3, cheekGlow: 0,
    glowIntensity: 2.0, shakeIntensity: 0.06, celebrationBounce: 0,
    auraSize: 1.4, auraOpacity: 0.04,
  },
  evolving: {
    primary: '#a855f7', secondary: '#9333ea', emissive: '#c084fc',
    pulseSpeed: 1.2, pulseIntensity: 0.3, orbitSpeed: 0.8, particleSpeed: 0.5,
    bobAmplitude: 0.18, bobSpeed: 1.0, eyeScale: 1.15, eyeSquint: 0,
    browAngle: 0, mouthCurve: 0.5, mouthOpen: 0.2, cheekGlow: 0.2,
    glowIntensity: 1.2, shakeIntensity: 0, celebrationBounce: 0.05,
    auraSize: 2.8, auraOpacity: 0.14,
  },
  offline: {
    primary: '#52525b', secondary: '#3f3f46', emissive: '#27272a',
    pulseSpeed: 0.2, pulseIntensity: 0.03, orbitSpeed: 0.03, particleSpeed: 0.02,
    bobAmplitude: 0.02, bobSpeed: 0.15, eyeScale: 0.6, eyeSquint: 0.5,
    browAngle: 0, mouthCurve: 0, mouthOpen: 0, cheekGlow: 0,
    glowIntensity: 0.05, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.3, auraOpacity: 0.01,
  },
};

export function Agent3DCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const faceGroupRef = useRef<THREE.Group>(null);

  const { agentState, level } = useAgentLiveStore();
  const config = STATE_3D[agentState];

  const lerpState = useRef({
    primary: new THREE.Color(config.primary),
    secondary: new THREE.Color(config.secondary),
    emissive: new THREE.Color(config.emissive),
    eyeScale: config.eyeScale,
    eyeSquint: config.eyeSquint,
    browAngle: config.browAngle,
    mouthCurve: config.mouthCurve,
    mouthOpen: config.mouthOpen,
    cheekGlow: config.cheekGlow,
    pulseIntensity: config.pulseIntensity,
    orbitSpeed: config.orbitSpeed,
    bobAmplitude: config.bobAmplitude,
    bobSpeed: config.bobSpeed,
    glowIntensity: config.glowIntensity,
    particleSpeed: config.particleSpeed,
    pulseSpeed: config.pulseSpeed,
    shakeIntensity: config.shakeIntensity,
    celebrationBounce: config.celebrationBounce,
    auraSize: config.auraSize,
    auraOpacity: config.auraOpacity,
  });

  const numRings = useMemo(() => {
    if (level >= 12) return 3;
    if (level >= 5) return 2;
    return 1;
  }, [level]);

  const particleCount = useMemo(() => Math.min(20 + level * 6, 100), [level]);

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.3 + Math.random() * 1.0;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions, velocities };
  }, [particleCount]);

  const particleSizes = useMemo(() => {
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      sizes[i] = 0.015 + Math.random() * 0.04;
    }
    return sizes;
  }, [particleCount]);

  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const ls = lerpState.current;
    const target = STATE_3D[agentState];

    const spd = delta * 3.5;
    ls.primary.lerp(new THREE.Color(target.primary), spd);
    ls.secondary.lerp(new THREE.Color(target.secondary), spd);
    ls.emissive.lerp(new THREE.Color(target.emissive), spd);
    ls.eyeScale += (target.eyeScale - ls.eyeScale) * delta * 5;
    ls.eyeSquint += (target.eyeSquint - ls.eyeSquint) * delta * 5;
    ls.browAngle += (target.browAngle - ls.browAngle) * delta * 4;
    ls.mouthCurve += (target.mouthCurve - ls.mouthCurve) * delta * 4;
    ls.mouthOpen += (target.mouthOpen - ls.mouthOpen) * delta * 5;
    ls.cheekGlow += (target.cheekGlow - ls.cheekGlow) * delta * 3;
    ls.pulseIntensity += (target.pulseIntensity - ls.pulseIntensity) * delta * 4;
    ls.orbitSpeed += (target.orbitSpeed - ls.orbitSpeed) * delta * 3;
    ls.bobAmplitude += (target.bobAmplitude - ls.bobAmplitude) * delta * 3;
    ls.bobSpeed += (target.bobSpeed - ls.bobSpeed) * delta * 3;
    ls.glowIntensity += (target.glowIntensity - ls.glowIntensity) * delta * 4;
    ls.particleSpeed += (target.particleSpeed - ls.particleSpeed) * delta * 3;
    ls.pulseSpeed += (target.pulseSpeed - ls.pulseSpeed) * delta * 3;
    ls.shakeIntensity += (target.shakeIntensity - ls.shakeIntensity) * delta * 5;
    ls.celebrationBounce += (target.celebrationBounce - ls.celebrationBounce) * delta * 3;
    ls.auraSize += (target.auraSize - ls.auraSize) * delta * 2;
    ls.auraOpacity += (target.auraOpacity - ls.auraOpacity) * delta * 3;

    // Body movement
    const bob = Math.sin(t * ls.bobSpeed) * ls.bobAmplitude;
    const celebBob = ls.celebrationBounce > 0.01
      ? Math.abs(Math.sin(t * 6)) * ls.celebrationBounce : 0;
    groupRef.current.position.y = bob + celebBob;
    groupRef.current.rotation.y += delta * 0.12;

    if (ls.shakeIntensity > 0.001) {
      groupRef.current.rotation.x = Math.sin(t * 30) * ls.shakeIntensity;
      groupRef.current.rotation.z = Math.cos(t * 25) * ls.shakeIntensity;
    } else {
      groupRef.current.rotation.x *= 0.93;
      groupRef.current.rotation.z *= 0.93;
    }

    // Core sphere
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * ls.pulseSpeed) * ls.pulseIntensity * 0.25;
      coreRef.current.scale.setScalar(pulse);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.emissive);
      mat.emissiveIntensity = ls.glowIntensity;
    }

    // Inner wireframe
    if (innerRef.current) {
      innerRef.current.rotation.x += delta * 0.4;
      innerRef.current.rotation.z += delta * 0.25;
      innerRef.current.scale.setScalar(1 + Math.sin(t * ls.pulseSpeed * 0.7 + 1) * 0.1);
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.secondary);
      mat.emissiveIntensity = ls.glowIntensity * 0.6;
    }

    // Eye tracking
    const eyeX = mousePosition.x * 0.07;
    const eyeY = mousePosition.y * 0.04;

    // Blinking
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0 && !isBlinking.current) {
      if (Math.random() < 0.015) {
        isBlinking.current = true;
        blinkTimer.current = 0.12;
      }
    }
    if (isBlinking.current && blinkTimer.current <= 0) {
      isBlinking.current = false;
      blinkTimer.current = 2.5 + Math.random() * 4;
    }
    const blink = isBlinking.current ? 0.08 : 1.0;
    const squint = 1 - ls.eyeSquint;

    // Left eye
    if (leftEyeRef.current) {
      leftEyeRef.current.position.x = -0.24 + eyeX;
      leftEyeRef.current.position.y = 0.18 + eyeY;
      leftEyeRef.current.scale.y = ls.eyeScale * blink * squint;
      leftEyeRef.current.scale.x = ls.eyeScale;
      leftEyeRef.current.scale.z = ls.eyeScale;
    }
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.24 + eyeX * 1.8;
      leftPupilRef.current.position.y = 0.18 + eyeY * 1.8;
      leftPupilRef.current.scale.y = blink;
      leftPupilRef.current.scale.z = blink;
    }

    // Right eye
    if (rightEyeRef.current) {
      rightEyeRef.current.position.x = 0.24 + eyeX;
      rightEyeRef.current.position.y = 0.18 + eyeY;
      rightEyeRef.current.scale.y = ls.eyeScale * blink * squint;
      rightEyeRef.current.scale.x = ls.eyeScale;
      rightEyeRef.current.scale.z = ls.eyeScale;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.24 + eyeX * 1.8;
      rightPupilRef.current.position.y = 0.18 + eyeY * 1.8;
      rightPupilRef.current.scale.y = blink;
      rightPupilRef.current.scale.z = blink;
    }

    // Eyebrows
    if (leftBrowRef.current) {
      leftBrowRef.current.rotation.z = ls.browAngle;
      leftBrowRef.current.position.y = 0.34 + (ls.browAngle < 0 ? -0.03 : 0);
      const mat = leftBrowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = 0.6;
    }
    if (rightBrowRef.current) {
      rightBrowRef.current.rotation.z = -ls.browAngle;
      rightBrowRef.current.position.y = 0.34 + (ls.browAngle < 0 ? -0.03 : 0);
      const mat = rightBrowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = 0.6;
    }

    // Mouth
    if (mouthRef.current) {
      mouthRef.current.position.y = -0.12 + ls.mouthCurve * 0.06;
      mouthRef.current.scale.y = 0.3 + ls.mouthOpen * 0.5;
      mouthRef.current.scale.x = 0.2 + ls.mouthOpen * 0.08;
      const mat = mouthRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.secondary);
      mat.emissiveIntensity = ls.glowIntensity * 0.4 + ls.cheekGlow * 2;
    }

    // Face breathing
    if (faceGroupRef.current) {
      faceGroupRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.008);
    }

    // Rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * ls.orbitSpeed;
      ring1Ref.current.rotation.z = t * ls.orbitSpeed * 0.25;
      const mat = ring1Ref.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = 0.5;
      mat.opacity = 0.5 + Math.sin(t * 2) * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.visible = numRings >= 2;
      if (numRings >= 2) {
        ring2Ref.current.rotation.y = t * ls.orbitSpeed * 0.65;
        ring2Ref.current.rotation.x = t * ls.orbitSpeed * 0.35 + 1.05;
        const mat = ring2Ref.current.material as THREE.MeshStandardMaterial;
        mat.emissive.copy(ls.secondary);
        mat.emissiveIntensity = 0.4;
        mat.opacity = 0.35 + Math.sin(t * 1.5 + 1) * 0.1;
      }
    }
    if (ring3Ref.current) {
      ring3Ref.current.visible = numRings >= 3;
      if (numRings >= 3) {
        ring3Ref.current.rotation.z = t * ls.orbitSpeed * 0.45;
        ring3Ref.current.rotation.y = t * ls.orbitSpeed * 0.55 + 2.09;
        const mat = ring3Ref.current.material as THREE.MeshStandardMaterial;
        mat.emissive.copy(ls.primary);
        mat.emissiveIntensity = 0.3;
        mat.opacity = 0.25 + Math.sin(t * 1.2 + 2) * 0.1;
      }
    }

    // Aura
    if (auraRef.current) {
      auraRef.current.scale.setScalar(ls.auraSize + Math.sin(t * ls.pulseSpeed * 0.4) * 0.15);
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(ls.primary);
      mat.opacity = ls.auraOpacity;
    }

    // Particles
    if (pointsRef.current) {
      const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const x = posArr[idx];
        const z = posArr[idx + 2];
        const speed = ls.particleSpeed * (0.3 + Math.abs(particlePositions.velocities[i * 3]) * 40);
        const a = speed * delta;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        posArr[idx] = x * cosA - z * sinA;
        posArr[idx + 2] = x * sinA + z * cosA;
        posArr[idx + 1] += Math.sin(t * 1.5 + i * 0.7) * 0.0008;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.color.copy(ls.primary);
      mat.size = 0.03 + Math.sin(t * ls.pulseSpeed) * 0.008;
      mat.opacity = 0.5 + Math.sin(t * 1.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={config.primary} transparent opacity={config.auraOpacity} depthWrite={false} />
      </mesh>

      {/* Core body */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.75, 3]} />
        <meshStandardMaterial
          color={config.primary} emissive={config.emissive}
          emissiveIntensity={config.glowIntensity}
          transparent opacity={0.88} roughness={0.15} metalness={0.4}
        />
      </mesh>

      {/* Inner wireframe soul */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color={config.secondary} emissive={config.secondary}
          emissiveIntensity={config.glowIntensity * 0.5}
          wireframe transparent opacity={0.5}
        />
      </mesh>

      {/* Face */}
      <group ref={faceGroupRef} position={[0, 0, 0.62]}>
        {/* Left eye */}
        <mesh ref={leftEyeRef} position={[-0.24, 0.18, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[-0.24, 0.18, 0.09]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.3} roughness={0.2} />
        </mesh>
        <mesh ref={leftPupilRef} position={[-0.24, 0.18, 0.12]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.3} />
        </mesh>
        <mesh position={[-0.22, 0.21, 0.13]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>

        {/* Right eye */}
        <mesh ref={rightEyeRef} position={[0.24, 0.18, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[0.24, 0.18, 0.09]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.3} roughness={0.2} />
        </mesh>
        <mesh ref={rightPupilRef} position={[0.24, 0.18, 0.12]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.3} />
        </mesh>
        <mesh position={[0.26, 0.21, 0.13]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>

        {/* Eyebrows */}
        <mesh ref={leftBrowRef} position={[-0.24, 0.34, 0.03]}>
          <boxGeometry args={[0.2, 0.035, 0.025]} />
          <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
        <mesh ref={rightBrowRef} position={[0.24, 0.34, 0.03]}>
          <boxGeometry args={[0.2, 0.035, 0.025]} />
          <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.6} roughness={0.3} />
        </mesh>

        {/* Cheek blush */}
        <mesh position={[-0.35, 0.05, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color={config.primary} transparent opacity={0.02} />
        </mesh>
        <mesh position={[0.35, 0.05, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color={config.primary} transparent opacity={0.02} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.12, 0.03]}>
          <sphereGeometry args={[0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial
            color={config.secondary} emissive={config.secondary}
            emissiveIntensity={0.3} transparent opacity={0.65} roughness={0.4}
          />
        </mesh>
      </group>

      {/* Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.15, 0.018, 8, 80]} />
        <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.5} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.3, 0.014, 8, 80]} />
        <meshStandardMaterial color={config.secondary} emissive={config.secondary} emissiveIntensity={0.4} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[1.45, 0.01, 8, 80]} />
        <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.3} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={particlePositions.positions.slice()} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={particleCount} array={particleSizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial color={config.primary} size={0.03} transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
}