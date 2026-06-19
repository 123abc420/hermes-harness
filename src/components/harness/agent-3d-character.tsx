'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import { mousePosition } from './agent-3d-shared';
import * as THREE from 'three';

// ─── Warm State Visual Configuration ─────────────────────────────────
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
    primary: '#f59e0b', secondary: '#d97706', emissive: '#fbbf24',
    pulseSpeed: 0.6, pulseIntensity: 0.12, orbitSpeed: 0.2, particleSpeed: 0.1,
    bobAmplitude: 0.1, bobSpeed: 0.5, eyeScale: 1.0, eyeSquint: 0.03,
    browAngle: 0.02, mouthCurve: 0.3, mouthOpen: 0, cheekGlow: 0.08,
    glowIntensity: 0.6, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.5, auraOpacity: 0.05,
  },
  thinking: {
    primary: '#06b6d4', secondary: '#0891b2', emissive: '#22d3ee',
    pulseSpeed: 1.5, pulseIntensity: 0.2, orbitSpeed: 0.5, particleSpeed: 0.25,
    bobAmplitude: 0.06, bobSpeed: 1.0, eyeScale: 0.85, eyeSquint: 0.35,
    browAngle: -0.2, mouthCurve: -0.1, mouthOpen: 0.12, cheekGlow: 0.1,
    glowIntensity: 0.8, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.7, auraOpacity: 0.07,
  },
  searching: {
    primary: '#fb923c', secondary: '#ea580c', emissive: '#fdba74',
    pulseSpeed: 1.0, pulseIntensity: 0.18, orbitSpeed: 0.7, particleSpeed: 0.4,
    bobAmplitude: 0.15, bobSpeed: 1.2, eyeScale: 1.2, eyeSquint: 0,
    browAngle: -0.08, mouthCurve: 0.05, mouthOpen: 0.04, cheekGlow: 0.1,
    glowIntensity: 0.7, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.8, auraOpacity: 0.06,
  },
  planning: {
    primary: '#c084fc', secondary: '#a855f7', emissive: '#d8b4fe',
    pulseSpeed: 0.4, pulseIntensity: 0.15, orbitSpeed: 0.3, particleSpeed: 0.2,
    bobAmplitude: 0.05, bobSpeed: 0.35, eyeScale: 0.9, eyeSquint: 0.15,
    browAngle: -0.12, mouthCurve: 0.05, mouthOpen: 0.08, cheekGlow: 0.06,
    glowIntensity: 0.9, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.9, auraOpacity: 0.08,
  },
  executing: {
    primary: '#f43f5e', secondary: '#e11d48', emissive: '#fda4af',
    pulseSpeed: 2.0, pulseIntensity: 0.3, orbitSpeed: 1.2, particleSpeed: 0.6,
    bobAmplitude: 0.18, bobSpeed: 1.8, eyeScale: 1.1, eyeSquint: 0,
    browAngle: 0.08, mouthCurve: 0, mouthOpen: 0.15, cheekGlow: 0.12,
    glowIntensity: 1.3, shakeIntensity: 0.008, celebrationBounce: 0,
    auraSize: 2.1, auraOpacity: 0.09,
  },
  verifying: {
    primary: '#34d399', secondary: '#10b981', emissive: '#6ee7b7',
    pulseSpeed: 0.8, pulseIntensity: 0.12, orbitSpeed: 0.4, particleSpeed: 0.25,
    bobAmplitude: 0.08, bobSpeed: 0.7, eyeScale: 0.95, eyeSquint: 0.08,
    browAngle: 0, mouthCurve: 0.35, mouthOpen: 0.04, cheekGlow: 0.1,
    glowIntensity: 0.7, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.6, auraOpacity: 0.06,
  },
  celebrating: {
    primary: '#fde047', secondary: '#facc15', emissive: '#fef08a',
    pulseSpeed: 3.0, pulseIntensity: 0.4, orbitSpeed: 2.0, particleSpeed: 1.0,
    bobAmplitude: 0.3, bobSpeed: 2.5, eyeScale: 1.3, eyeSquint: 0,
    browAngle: 0.12, mouthCurve: 1, mouthOpen: 0.5, cheekGlow: 0.35,
    glowIntensity: 1.8, shakeIntensity: 0, celebrationBounce: 0.12,
    auraSize: 2.4, auraOpacity: 0.12,
  },
  error: {
    primary: '#f87171', secondary: '#ef4444', emissive: '#fca5a5',
    pulseSpeed: 4.0, pulseIntensity: 0.45, orbitSpeed: 0.1, particleSpeed: 0.05,
    bobAmplitude: 0.02, bobSpeed: 0.15, eyeScale: 0.7, eyeSquint: 0.25,
    browAngle: 0.22, mouthCurve: -0.7, mouthOpen: 0.25, cheekGlow: 0,
    glowIntensity: 2.0, shakeIntensity: 0.05, celebrationBounce: 0,
    auraSize: 1.3, auraOpacity: 0.03,
  },
  evolving: {
    primary: '#e879f9', secondary: '#d946ef', emissive: '#f0abfc',
    pulseSpeed: 1.0, pulseIntensity: 0.25, orbitSpeed: 0.7, particleSpeed: 0.4,
    bobAmplitude: 0.15, bobSpeed: 0.9, eyeScale: 1.15, eyeSquint: 0,
    browAngle: 0, mouthCurve: 0.5, mouthOpen: 0.18, cheekGlow: 0.2,
    glowIntensity: 1.3, shakeIntensity: 0, celebrationBounce: 0.04,
    auraSize: 2.6, auraOpacity: 0.12,
  },
  offline: {
    primary: '#71717a', secondary: '#52525b', emissive: '#3f3f46',
    pulseSpeed: 0.15, pulseIntensity: 0.02, orbitSpeed: 0.02, particleSpeed: 0.01,
    bobAmplitude: 0.015, bobSpeed: 0.1, eyeScale: 0.6, eyeSquint: 0.45,
    browAngle: 0, mouthCurve: 0, mouthOpen: 0, cheekGlow: 0,
    glowIntensity: 0.03, shakeIntensity: 0, celebrationBounce: 0,
    auraSize: 1.2, auraOpacity: 0.01,
  },
};

// ─── Idle Behavior System ───────────────────────────────────────────
// Makes the character feel alive even when nothing is happening
const IDLE_BEHAVIORS = [
  { name: 'neutral', duration: [3, 6] },      // Default gentle sway
  { name: 'lookLeft', duration: [2, 4] },      // Glance left
  { name: 'lookRight', duration: [2, 4] },     // Glance right
  { name: 'lookUp', duration: [1.5, 3] },      // Look up thoughtfully
  { name: 'stretch', duration: [1.5, 2.5] },   // Subtle stretch
  { name: 'nod', duration: [1, 2] },           // Small nod
  { name: 'tiltHead', duration: [2, 4] },      // Head tilt
] as const;

type IdleBehavior = typeof IDLE_BEHAVIORS[number]['name'];

function pickNextBehavior(): { behavior: IdleBehavior; duration: number } {
  const b = IDLE_BEHAVIORS[Math.floor(Math.random() * IDLE_BEHAVIORS.length)];
  return {
    behavior: b.name,
    duration: b.duration[0] + Math.random() * (b.duration[1] - b.duration[0]),
  };
}

// ─── Character Component ────────────────────────────────────────────
export function Agent3DCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftIrisRef = useRef<THREE.Mesh>(null);
  const rightIrisRef = useRef<THREE.Mesh>(null);
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

  // Smooth lerp state
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

  // Idle behavior system
  const idleState = useRef({
    currentBehavior: 'neutral' as IdleBehavior,
    timer: 2,
    lookTargetX: 0,
    lookTargetY: 0,
    stretchAmount: 0,
    nodAmount: 0,
    tiltAmount: 0,
  });

  // Ring count by level
  const numRings = useMemo(() => {
    if (level >= 12) return 3;
    if (level >= 5) return 2;
    return 1;
  }, [level]);

  // Particle system
  const particleCount = useMemo(() => Math.min(20 + level * 5, 80), [level]);

  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2 + Math.random() * 1.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions, velocities };
  }, [particleCount]);

  // Blink system
  const blinkTimer = useRef(3);
  const isBlinking = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    const t = state.clock.elapsedTime;
    const ls = lerpState.current;
    const target = STATE_3D[agentState];
    const idle = idleState.current;

    // ─── Smooth state transitions ───
    const spd = delta * 3.0;
    ls.primary.lerp(new THREE.Color(target.primary), spd);
    ls.secondary.lerp(new THREE.Color(target.secondary), spd);
    ls.emissive.lerp(new THREE.Color(target.emissive), spd);
    
    const lerpSpeed = 4.0;
    ls.eyeScale += (target.eyeScale - ls.eyeScale) * delta * lerpSpeed;
    ls.eyeSquint += (target.eyeSquint - ls.eyeSquint) * delta * lerpSpeed;
    ls.browAngle += (target.browAngle - ls.browAngle) * delta * 3;
    ls.mouthCurve += (target.mouthCurve - ls.mouthCurve) * delta * 3;
    ls.mouthOpen += (target.mouthOpen - ls.mouthOpen) * delta * lerpSpeed;
    ls.cheekGlow += (target.cheekGlow - ls.cheekGlow) * delta * 2.5;
    ls.pulseIntensity += (target.pulseIntensity - ls.pulseIntensity) * delta * 3;
    ls.orbitSpeed += (target.orbitSpeed - ls.orbitSpeed) * delta * 2.5;
    ls.bobAmplitude += (target.bobAmplitude - ls.bobAmplitude) * delta * 2.5;
    ls.bobSpeed += (target.bobSpeed - ls.bobSpeed) * delta * 2.5;
    ls.glowIntensity += (target.glowIntensity - ls.glowIntensity) * delta * 3;
    ls.particleSpeed += (target.particleSpeed - ls.particleSpeed) * delta * 2.5;
    ls.pulseSpeed += (target.pulseSpeed - ls.pulseSpeed) * delta * 2.5;
    ls.shakeIntensity += (target.shakeIntensity - ls.shakeIntensity) * delta * 5;
    ls.celebrationBounce += (target.celebrationBounce - ls.celebrationBounce) * delta * 2.5;
    ls.auraSize += (target.auraSize - ls.auraSize) * delta * 2;
    ls.auraOpacity += (target.auraOpacity - ls.auraOpacity) * delta * 2.5;

    // ─── Idle Behavior System ───
    idle.timer -= delta;
    if (idle.timer <= 0) {
      const next = pickNextBehavior();
      idle.currentBehavior = next.behavior;
      idle.timer = next.duration;

      // Set targets for the new behavior
      switch (next.behavior) {
        case 'lookLeft':
          idle.lookTargetX = -0.4 - Math.random() * 0.3;
          idle.lookTargetY = (Math.random() - 0.5) * 0.2;
          break;
        case 'lookRight':
          idle.lookTargetX = 0.4 + Math.random() * 0.3;
          idle.lookTargetY = (Math.random() - 0.5) * 0.2;
          break;
        case 'lookUp':
          idle.lookTargetX = (Math.random() - 0.5) * 0.2;
          idle.lookTargetY = 0.3 + Math.random() * 0.2;
          break;
        case 'stretch':
          idle.stretchAmount = 1;
          break;
        case 'nod':
          idle.nodAmount = 1;
          break;
        case 'tiltHead':
          idle.tiltAmount = 0.15 + Math.random() * 0.1;
          break;
        default:
          idle.lookTargetX = 0;
          idle.lookTargetY = 0;
          break;
      }
    }

    // Decay behavior modifiers
    idle.stretchAmount *= 0.96;
    idle.nodAmount *= 0.95;
    idle.tiltAmount *= 0.98;
    idle.lookTargetX *= 0.995;
    idle.lookTargetY *= 0.995;

    // ─── Body Movement ───
    const bob = Math.sin(t * ls.bobSpeed) * ls.bobAmplitude;
    const celebBob = ls.celebrationBounce > 0.01
      ? Math.abs(Math.sin(t * 5)) * ls.celebrationBounce : 0;
    const stretchBob = idle.stretchAmount * 0.15;

    // Main group: vertical bob
    groupRef.current.position.y = bob + celebBob + stretchBob;

    // Body group: slow rotation + idle behaviors
    bodyRef.current.rotation.y += delta * 0.08; // Very slow turn
    
    // Head tilt behavior
    const targetTilt = idle.tiltAmount;
    bodyRef.current.rotation.z += (targetTilt - bodyRef.current.rotation.z) * delta * 2;
    
    // Nod behavior
    const nodOffset = idle.nodAmount > 0.01 ? Math.sin(t * 8) * 0.05 * idle.nodAmount : 0;
    bodyRef.current.rotation.x += (nodOffset - bodyRef.current.rotation.x) * delta * 5;

    // Shake (error state)
    if (ls.shakeIntensity > 0.001) {
      bodyRef.current.rotation.x += Math.sin(t * 30) * ls.shakeIntensity;
      bodyRef.current.rotation.z += Math.cos(t * 25) * ls.shakeIntensity * 0.5;
    }

    // ─── Core Sphere ───
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * ls.pulseSpeed) * ls.pulseIntensity * 0.2;
      const stretch = 1 + idle.stretchAmount * 0.08;
      coreRef.current.scale.setScalar(pulse * stretch);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.emissive);
      mat.emissiveIntensity = ls.glowIntensity;
    }

    // ─── Inner Wireframe Soul ───
    if (innerRef.current) {
      innerRef.current.rotation.x += delta * 0.3;
      innerRef.current.rotation.z += delta * 0.2;
      innerRef.current.scale.setScalar(1 + Math.sin(t * ls.pulseSpeed * 0.6 + 1) * 0.08);
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.secondary);
      mat.emissiveIntensity = ls.glowIntensity * 0.5;
    }

    // ─── Eye Tracking (mouse + idle behavior) ───
    const mouseEyeX = mousePosition.x * 0.06;
    const mouseEyeY = mousePosition.y * 0.04;
    const idleEyeX = idle.lookTargetX * 0.08;
    const idleEyeY = idle.lookTargetY * 0.06;
    const eyeX = mouseEyeX + idleEyeX;
    const eyeY = mouseEyeY + idleEyeY;

    // ─── Blinking ───
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0 && !isBlinking.current) {
      if (Math.random() < 0.02) {
        isBlinking.current = true;
        blinkTimer.current = 0.1;
      }
    }
    if (isBlinking.current && blinkTimer.current <= 0) {
      isBlinking.current = false;
      blinkTimer.current = 2 + Math.random() * 4;
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
    // Left iris tracks with pupil (slower movement)
    if (leftIrisRef.current) {
      leftIrisRef.current.position.x = -0.24 + eyeX * 1.2;
      leftIrisRef.current.position.y = 0.18 + eyeY * 1.2;
      leftIrisRef.current.scale.y = ls.eyeScale * blink * squint;
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
    // Right iris tracks with pupil (slower movement)
    if (rightIrisRef.current) {
      rightIrisRef.current.position.x = 0.24 + eyeX * 1.2;
      rightIrisRef.current.position.y = 0.18 + eyeY * 1.2;
      rightIrisRef.current.scale.y = ls.eyeScale * blink * squint;
    }

    // ─── Eyebrows ───
    if (leftBrowRef.current) {
      leftBrowRef.current.rotation.z = ls.browAngle + idle.tiltAmount * 0.3;
      leftBrowRef.current.position.y = 0.34 + (ls.browAngle < 0 ? -0.03 : 0);
      const mat = leftBrowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = 0.5;
    }
    if (rightBrowRef.current) {
      rightBrowRef.current.rotation.z = -ls.browAngle - idle.tiltAmount * 0.3;
      rightBrowRef.current.position.y = 0.34 + (ls.browAngle < 0 ? -0.03 : 0);
      const mat = rightBrowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = 0.5;
    }

    // ─── Mouth ───
    if (mouthRef.current) {
      mouthRef.current.position.y = -0.12 + ls.mouthCurve * 0.06;
      mouthRef.current.scale.y = 0.3 + ls.mouthOpen * 0.5;
      mouthRef.current.scale.x = 0.2 + ls.mouthOpen * 0.08;
      const mat = mouthRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.secondary);
      mat.emissiveIntensity = ls.glowIntensity * 0.35 + ls.cheekGlow * 1.5;
    }

    // ─── Face Breathing ───
    if (faceGroupRef.current) {
      const breathe = 1 + Math.sin(t * 1.0) * 0.012;
      faceGroupRef.current.scale.setScalar(breathe);
    }

    // ─── Rings ───
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * ls.orbitSpeed;
      ring1Ref.current.rotation.z = t * ls.orbitSpeed * 0.2;
      const mat = ring1Ref.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = 0.4;
      mat.opacity = 0.4 + Math.sin(t * 1.8) * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.visible = numRings >= 2;
      if (numRings >= 2) {
        ring2Ref.current.rotation.y = t * ls.orbitSpeed * 0.6;
        ring2Ref.current.rotation.x = t * ls.orbitSpeed * 0.3 + 1.05;
        const mat = ring2Ref.current.material as THREE.MeshStandardMaterial;
        mat.emissive.copy(ls.secondary);
        mat.emissiveIntensity = 0.3;
        mat.opacity = 0.3 + Math.sin(t * 1.3 + 1) * 0.08;
      }
    }
    if (ring3Ref.current) {
      ring3Ref.current.visible = numRings >= 3;
      if (numRings >= 3) {
        ring3Ref.current.rotation.z = t * ls.orbitSpeed * 0.4;
        ring3Ref.current.rotation.y = t * ls.orbitSpeed * 0.5 + 2.09;
        const mat = ring3Ref.current.material as THREE.MeshStandardMaterial;
        mat.emissive.copy(ls.primary);
        mat.emissiveIntensity = 0.25;
        mat.opacity = 0.2 + Math.sin(t * 1.0 + 2) * 0.08;
      }
    }

    // ─── Aura ───
    if (auraRef.current) {
      auraRef.current.scale.setScalar(ls.auraSize + Math.sin(t * ls.pulseSpeed * 0.3) * 0.12);
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(ls.primary);
      mat.opacity = ls.auraOpacity;
    }

    // ─── Particles ───
    if (pointsRef.current) {
      const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const x = posArr[idx];
        const z = posArr[idx + 2];
        const speed = ls.particleSpeed * (0.2 + Math.abs(particleData.velocities[i * 3]) * 35);
        const a = speed * delta;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        posArr[idx] = x * cosA - z * sinA;
        posArr[idx + 2] = x * sinA + z * cosA;
        posArr[idx + 1] += Math.sin(t * 1.2 + i * 0.6) * 0.0006;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.color.copy(ls.primary);
      mat.size = 0.025 + Math.sin(t * ls.pulseSpeed) * 0.006;
      mat.opacity = 0.45 + Math.sin(t * 1.2) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Warm aura glow */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={config.primary} transparent opacity={config.auraOpacity} depthWrite={false} />
      </mesh>

      {/* Body group (separate for idle behaviors) */}
      <group ref={bodyRef}>
        {/* Core body */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.75, 3]} />
          <meshStandardMaterial
            color={config.primary}
            emissive={config.emissive}
            emissiveIntensity={config.glowIntensity}
            transparent
            opacity={0.9}
            roughness={0.12}
            metalness={0.45}
          />
        </mesh>

        {/* Inner wireframe soul */}
        <mesh ref={innerRef}>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial
            color={config.secondary}
            emissive={config.secondary}
            emissiveIntensity={config.glowIntensity * 0.4}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Face group with breathing */}
        <group ref={faceGroupRef} position={[0, 0, 0.62]}>
          {/* Left eye white */}
          <mesh ref={leftEyeRef} position={[-0.24, 0.18, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#fef9ee" emissive="#fef9ee" emissiveIntensity={0.5} roughness={0.08} />
          </mesh>
          {/* Left iris */}
          <mesh ref={leftIrisRef} position={[-0.24, 0.18, 0.09]}>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.3} roughness={0.15} />
          </mesh>
          {/* Left pupil */}
          <mesh ref={leftPupilRef} position={[-0.24, 0.18, 0.12]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
          </mesh>
          {/* Left eye sparkle */}
          <mesh position={[-0.22, 0.21, 0.13]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>

          {/* Right eye white */}
          <mesh ref={rightEyeRef} position={[0.24, 0.18, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#fef9ee" emissive="#fef9ee" emissiveIntensity={0.5} roughness={0.08} />
          </mesh>
          {/* Right iris */}
          <mesh ref={rightIrisRef} position={[0.24, 0.18, 0.09]}>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.3} roughness={0.15} />
          </mesh>
          {/* Right pupil */}
          <mesh ref={rightPupilRef} position={[0.24, 0.18, 0.12]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
          </mesh>
          {/* Right eye sparkle */}
          <mesh position={[0.26, 0.21, 0.13]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>

          {/* Eyebrows */}
          <mesh ref={leftBrowRef} position={[-0.24, 0.34, 0.03]}>
            <boxGeometry args={[0.2, 0.035, 0.025]} />
            <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.5} roughness={0.25} />
          </mesh>
          <mesh ref={rightBrowRef} position={[0.24, 0.34, 0.03]}>
            <boxGeometry args={[0.2, 0.035, 0.025]} />
            <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.5} roughness={0.25} />
          </mesh>

          {/* Warm cheek blush */}
          <mesh position={[-0.35, 0.05, 0.05]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.03} />
          </mesh>
          <mesh position={[0.35, 0.05, 0.05]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.03} />
          </mesh>

          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, -0.12, 0.03]}>
            <sphereGeometry args={[0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial
              color={config.secondary}
              emissive={config.secondary}
              emissiveIntensity={0.25}
              transparent
              opacity={0.6}
              roughness={0.35}
            />
          </mesh>
        </group>
      </group>

      {/* Orbiting rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.15, 0.016, 8, 80]} />
        <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.4} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.3, 0.012, 8, 80]} />
        <meshStandardMaterial color={config.secondary} emissive={config.secondary} emissiveIntensity={0.3} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[1.45, 0.009, 8, 80]} />
        <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.25} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Particle cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={particleData.positions.slice()} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          color={config.primary}
          size={0.025}
          transparent
          opacity={0.45}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}