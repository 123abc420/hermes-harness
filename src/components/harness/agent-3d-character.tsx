'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import { mousePosition } from './agent-3d-sandbox';
import * as THREE from 'three';

// ─── State Color/Behavior Configuration ──────────────────────────────────
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
  mouthOpen: number;
  glowIntensity: number;
}

const STATE_3D: Record<AgentVisualState, StateConfig3D> = {
  idle: {
    primary: '#10b981', secondary: '#059669', emissive: '#10b981',
    pulseSpeed: 0.8, pulseIntensity: 0.15, orbitSpeed: 0.3,
    particleSpeed: 0.2, bobAmplitude: 0.15, bobSpeed: 0.8,
    eyeScale: 1.0, mouthOpen: 0, glowIntensity: 0.6,
  },
  thinking: {
    primary: '#06b6d4', secondary: '#0891b2', emissive: '#06b6d4',
    pulseSpeed: 1.5, pulseIntensity: 0.3, orbitSpeed: 0.6,
    particleSpeed: 0.4, bobAmplitude: 0.2, bobSpeed: 1.2,
    eyeScale: 0.85, mouthOpen: 0.15, glowIntensity: 0.8,
  },
  searching: {
    primary: '#f59e0b', secondary: '#d97706', emissive: '#f59e0b',
    pulseSpeed: 1.0, pulseIntensity: 0.25, orbitSpeed: 0.8,
    particleSpeed: 0.5, bobAmplitude: 0.3, bobSpeed: 1.5,
    eyeScale: 1.2, mouthOpen: 0, glowIntensity: 0.7,
  },
  planning: {
    primary: '#8b5cf6', secondary: '#7c3aed', emissive: '#8b5cf6',
    pulseSpeed: 0.6, pulseIntensity: 0.2, orbitSpeed: 0.4,
    particleSpeed: 0.3, bobAmplitude: 0.1, bobSpeed: 0.5,
    eyeScale: 0.9, mouthOpen: 0.1, glowIntensity: 0.9,
  },
  executing: {
    primary: '#f43f5e', secondary: '#e11d48', emissive: '#f43f5e',
    pulseSpeed: 2.0, pulseIntensity: 0.4, orbitSpeed: 1.2,
    particleSpeed: 0.8, bobAmplitude: 0.25, bobSpeed: 1.8,
    eyeScale: 1.1, mouthOpen: 0.3, glowIntensity: 1.2,
  },
  verifying: {
    primary: '#10b981', secondary: '#059669', emissive: '#34d399',
    pulseSpeed: 1.2, pulseIntensity: 0.2, orbitSpeed: 0.5,
    particleSpeed: 0.3, bobAmplitude: 0.12, bobSpeed: 0.9,
    eyeScale: 0.95, mouthOpen: 0.05, glowIntensity: 0.7,
  },
  celebrating: {
    primary: '#eab308', secondary: '#facc15', emissive: '#fbbf24',
    pulseSpeed: 3.0, pulseIntensity: 0.5, orbitSpeed: 2.0,
    particleSpeed: 1.5, bobAmplitude: 0.4, bobSpeed: 2.5,
    eyeScale: 1.3, mouthOpen: 0.6, glowIntensity: 1.5,
  },
  error: {
    primary: '#ef4444', secondary: '#dc2626', emissive: '#ef4444',
    pulseSpeed: 4.0, pulseIntensity: 0.6, orbitSpeed: 0.2,
    particleSpeed: 0.1, bobAmplitude: 0.05, bobSpeed: 0.3,
    eyeScale: 0.7, mouthOpen: 0.4, glowIntensity: 1.8,
  },
  evolving: {
    primary: '#a855f7', secondary: '#9333ea', emissive: '#c084fc',
    pulseSpeed: 1.0, pulseIntensity: 0.35, orbitSpeed: 0.7,
    particleSpeed: 0.6, bobAmplitude: 0.2, bobSpeed: 1.0,
    eyeScale: 1.15, mouthOpen: 0.2, glowIntensity: 1.0,
  },
  offline: {
    primary: '#71717a', secondary: '#52525b', emissive: '#3f3f46',
    pulseSpeed: 0.3, pulseIntensity: 0.05, orbitSpeed: 0.05,
    particleSpeed: 0.05, bobAmplitude: 0.05, bobSpeed: 0.2,
    eyeScale: 0.5, mouthOpen: 0, glowIntensity: 0.1,
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
  const glowRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const { agentState, level } = useAgentLiveStore();

  const config = STATE_3D[agentState];

  // Lerp targets for smooth transitions
  const lerpState = useRef({
    primary: new THREE.Color(config.primary),
    secondary: new THREE.Color(config.secondary),
    emissive: new THREE.Color(config.emissive),
    eyeScale: config.eyeScale,
    mouthOpen: config.mouthOpen,
    pulseIntensity: config.pulseIntensity,
    orbitSpeed: config.orbitSpeed,
    bobAmplitude: config.bobAmplitude,
    bobSpeed: config.bobSpeed,
    glowIntensity: config.glowIntensity,
    particleSpeed: config.particleSpeed,
    pulseSpeed: config.pulseSpeed,
  });

  // Determine number of rings based on level
  const numRings = useMemo(() => {
    if (level >= 12) return 3;
    if (level >= 5) return 2;
    return 1;
  }, [level]);

  // Particle count based on level
  const particleCount = useMemo(() => {
    return Math.min(15 + level * 5, 80);
  }, [level]);

  // Create particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2 + Math.random() * 0.8;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions, velocities };
  }, [particleCount]);

  // Create sizes for particles
  const particleSizes = useMemo(() => {
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      sizes[i] = 0.02 + Math.random() * 0.04;
    }
    return sizes;
  }, [particleCount]);

  // Blink timer
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const ls = lerpState.current;
    const target = STATE_3D[agentState];

    // Smooth lerp all values
    ls.primary.lerp(new THREE.Color(target.primary), delta * 3);
    ls.secondary.lerp(new THREE.Color(target.secondary), delta * 3);
    ls.emissive.lerp(new THREE.Color(target.emissive), delta * 3);
    ls.eyeScale += (target.eyeScale - ls.eyeScale) * delta * 5;
    ls.mouthOpen += (target.mouthOpen - ls.mouthOpen) * delta * 5;
    ls.pulseIntensity += (target.pulseIntensity - ls.pulseIntensity) * delta * 4;
    ls.orbitSpeed += (target.orbitSpeed - ls.orbitSpeed) * delta * 3;
    ls.bobAmplitude += (target.bobAmplitude - ls.bobAmplitude) * delta * 3;
    ls.bobSpeed += (target.bobSpeed - ls.bobSpeed) * delta * 3;
    ls.glowIntensity += (target.glowIntensity - ls.glowIntensity) * delta * 4;
    ls.particleSpeed += (target.particleSpeed - ls.particleSpeed) * delta * 3;
    ls.pulseSpeed += (target.pulseSpeed - ls.pulseSpeed) * delta * 3;

    // Bobbing
    const bob = Math.sin(t * ls.bobSpeed) * ls.bobAmplitude;
    groupRef.current.position.y = bob;

    // Gentle rotation
    groupRef.current.rotation.y += delta * 0.15;

    // Error shake
    if (agentState === 'error') {
      groupRef.current.rotation.x = Math.sin(t * 30) * 0.05;
      groupRef.current.rotation.z = Math.cos(t * 25) * 0.05;
    } else {
      groupRef.current.rotation.x *= 0.95;
      groupRef.current.rotation.z *= 0.95;
    }

    // Core pulsing
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * ls.pulseSpeed) * ls.pulseIntensity * 0.3;
      coreRef.current.scale.setScalar(pulse);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = ls.glowIntensity;
    }

    // Inner rotating icosahedron
    if (innerRef.current) {
      innerRef.current.rotation.x += delta * 0.5;
      innerRef.current.rotation.z += delta * 0.3;
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.secondary);
      mat.emissiveIntensity = ls.glowIntensity * 0.7;
    }

    // Eye tracking - follow mouse
    const eyeOffsetX = mousePosition.x * 0.08;
    const eyeOffsetY = mousePosition.y * 0.05;

    // Blinking
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0 && !isBlinking.current) {
      if (Math.random() < 0.02) {
        isBlinking.current = true;
        blinkTimer.current = 0.15;
      }
    }
    if (isBlinking.current && blinkTimer.current <= 0) {
      isBlinking.current = false;
      blinkTimer.current = 2 + Math.random() * 4;
    }
    const eyeYScale = isBlinking.current ? 0.1 : 1.0;

    // Left eye
    if (leftEyeRef.current) {
      leftEyeRef.current.position.x = -0.22 + eyeOffsetX;
      leftEyeRef.current.position.y = 0.15 + eyeOffsetY;
      leftEyeRef.current.scale.y = ls.eyeScale * eyeYScale;
      leftEyeRef.current.scale.x = ls.eyeScale;
      const mat = leftEyeRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8;
    }
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.22 + eyeOffsetX * 1.5;
      leftPupilRef.current.position.y = 0.15 + eyeOffsetY * 1.5;
      leftPupilRef.current.scale.y = eyeYScale;
    }

    // Right eye
    if (rightEyeRef.current) {
      rightEyeRef.current.position.x = 0.22 + eyeOffsetX;
      rightEyeRef.current.position.y = 0.15 + eyeOffsetY;
      rightEyeRef.current.scale.y = ls.eyeScale * eyeYScale;
      rightEyeRef.current.scale.x = ls.eyeScale;
      const mat = rightEyeRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.22 + eyeOffsetX * 1.5;
      rightPupilRef.current.position.y = 0.15 + eyeOffsetY * 1.5;
      rightPupilRef.current.scale.y = eyeYScale;
    }

    // Eyebrows - angle based on state
    const browAngle = agentState === 'thinking' ? -0.15 :
                      agentState === 'error' ? 0.2 :
                      agentState === 'searching' ? -0.1 : 0;
    if (leftBrowRef.current) {
      leftBrowRef.current.rotation.z = browAngle;
      leftBrowRef.current.position.y = 0.3 + (agentState === 'thinking' ? -0.03 : 0);
    }
    if (rightBrowRef.current) {
      rightBrowRef.current.rotation.z = -browAngle;
      rightBrowRef.current.position.y = 0.3 + (agentState === 'thinking' ? -0.03 : 0);
    }

    // Mouth
    if (mouthRef.current) {
      const mouthScaleY = 0.05 + ls.mouthOpen * 0.15;
      mouthRef.current.scale.y = mouthScaleY;
      mouthRef.current.scale.x = 0.25 + ls.mouthOpen * 0.1;
      const mat = mouthRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.secondary);
      mat.emissiveIntensity = ls.glowIntensity * 0.5;
    }

    // Orbiting rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * ls.orbitSpeed;
      ring1Ref.current.rotation.z = t * ls.orbitSpeed * 0.3;
      const mat = ring1Ref.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = 0.4;
    }
    if (ring2Ref.current && numRings >= 2) {
      ring2Ref.current.rotation.y = t * ls.orbitSpeed * 0.7;
      ring2Ref.current.rotation.x = t * ls.orbitSpeed * 0.4 + 1;
      const mat = ring2Ref.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.secondary);
      mat.emissiveIntensity = 0.3;
      ring2Ref.current.visible = true;
    }
    if (ring3Ref.current && numRings >= 3) {
      ring3Ref.current.rotation.z = t * ls.orbitSpeed * 0.5;
      ring3Ref.current.rotation.y = t * ls.orbitSpeed * 0.6 + 2;
      const mat = ring3Ref.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(ls.primary);
      mat.emissiveIntensity = 0.25;
      ring3Ref.current.visible = true;
    }
    if (ring2Ref.current && numRings < 2) ring2Ref.current.visible = false;
    if (ring3Ref.current && numRings < 3) ring3Ref.current.visible = false;

    // Glow sphere
    if (glowRef.current) {
      const glowPulse = 1.3 + Math.sin(t * ls.pulseSpeed * 0.5) * 0.2;
      glowRef.current.scale.setScalar(glowPulse);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(ls.primary);
      mat.opacity = 0.08 * ls.glowIntensity;
    }

    // Particles orbit
    if (pointsRef.current) {
      const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const x = posArr[idx];
        const y = posArr[idx + 1];
        const z = posArr[idx + 2];

        // Rotate around Y axis
        const speed = ls.particleSpeed * (0.5 + particlePositions.velocities[i * 3] * 50);
        const angle = speed * delta;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        posArr[idx] = x * cosA - z * sinA;
        posArr[idx + 2] = x * sinA + z * cosA;

        // Slight vertical oscillation
        posArr[idx + 1] += Math.sin(t * 2 + i) * 0.001;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;

      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.color.copy(ls.primary);
      mat.size = 0.04 + Math.sin(t * ls.pulseSpeed) * 0.01;
      mat.opacity = 0.6 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshBasicMaterial color={config.primary} transparent opacity={0.08} />
      </mesh>

      {/* Core sphere */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.65, 2]} />
        <meshStandardMaterial
          color={config.primary}
          emissive={config.primary}
          emissiveIntensity={config.glowIntensity}
          transparent
          opacity={0.85}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Inner rotating icosahedron */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial
          color={config.secondary}
          emissive={config.secondary}
          emissiveIntensity={config.glowIntensity * 0.7}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Face group */}
      <group position={[0, 0, 0.55]}>
        {/* Left eye white */}
        <mesh ref={leftEyeRef} position={[-0.22, 0.15, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        {/* Left pupil */}
        <mesh ref={leftPupilRef} position={[-0.22, 0.15, 0.08]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>

        {/* Right eye white */}
        <mesh ref={rightEyeRef} position={[0.22, 0.15, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        {/* Right pupil */}
        <mesh ref={rightPupilRef} position={[0.22, 0.15, 0.08]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>

        {/* Left eyebrow */}
        <mesh ref={leftBrowRef} position={[-0.22, 0.3, 0.02]}>
          <boxGeometry args={[0.18, 0.03, 0.02]} />
          <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.5} />
        </mesh>
        {/* Right eyebrow */}
        <mesh ref={rightBrowRef} position={[0.22, 0.3, 0.02]}>
          <boxGeometry args={[0.18, 0.03, 0.02]} />
          <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.5} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.1, 0.02]}>
          <sphereGeometry args={[0.12, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={config.secondary}
            emissive={config.secondary}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Orbiting rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.0, 0.015, 8, 64]} />
        <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.15, 0.012, 8, 64]} />
        <meshStandardMaterial color={config.secondary} emissive={config.secondary} emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[1.3, 0.01, 8, 64]} />
        <meshStandardMaterial color={config.primary} emissive={config.primary} emissiveIntensity={0.25} transparent opacity={0.3} />
      </mesh>

      {/* Orbiting particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions.positions.slice()}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={particleSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          color={config.primary}
          size={0.04}
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}