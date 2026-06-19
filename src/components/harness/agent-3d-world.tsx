'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshReflectorMaterial } from '@react-three/drei';
import { useAgentLiveStore, type AgentVisualState, type SubAgent } from '@/store/agent-live-store';
import * as THREE from 'three';

// ─── Warm Cozy State Colors ──────────────────────────────────────────
const WARM_COLORS: Record<AgentVisualState, { primary: string; secondary: string; ambient: string }> = {
  idle:       { primary: '#f59e0b', secondary: '#d97706', ambient: '#92400e' },
  thinking:   { primary: '#06b6d4', secondary: '#0891b2', ambient: '#164e63' },
  searching:  { primary: '#fb923c', secondary: '#ea580c', ambient: '#7c2d12' },
  planning:   { primary: '#c084fc', secondary: '#a855f7', ambient: '#581c87' },
  executing:  { primary: '#f43f5e', secondary: '#e11d48', ambient: '#881337' },
  verifying:  { primary: '#34d399', secondary: '#10b981', ambient: '#064e3b' },
  celebrating:{ primary: '#fde047', secondary: '#facc15', ambient: '#854d0e' },
  error:      { primary: '#f87171', secondary: '#ef4444', ambient: '#991b1b' },
  evolving:   { primary: '#e879f9', secondary: '#d946ef', ambient: '#701a75' },
  offline:    { primary: '#71717a', secondary: '#52525b', ambient: '#27272a' },
};

// ─── Firefly Particle ───────────────────────────────────────────────
function Fireflies({ count = 40, color }: { count?: number; color: string }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 5;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = -0.5 + Math.random() * 5;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      spd[i] = 0.3 + Math.random() * 0.7;
      phs[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, speeds: spd, phases: phs };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const sizeArr = pointsRef.current.geometry.attributes.size?.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const s = speeds[i];
      const p = phases[i];
      // Gentle figure-8 drift
      posArr[idx] += Math.sin(t * s * 0.3 + p) * 0.002;
      posArr[idx + 1] += Math.sin(t * s * 0.5 + p * 2) * 0.001;
      posArr[idx + 2] += Math.cos(t * s * 0.25 + p * 1.5) * 0.002;
      // Pulse size for glow effect
      if (sizeArr) {
        sizeArr[i] = 2.5 + Math.sin(t * s * 2 + p) * 1.5;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    if (sizeArr) pointsRef.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions.slice()} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={new Float32Array(count).fill(3)} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={3}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Warm Lantern Light ─────────────────────────────────────────────
function WarmLantern({ position, color, intensity = 0.8, speed = 0.5 }: {
  position: [number, number, number]; color: string; intensity?: number; speed?: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * speed * 8) * 0.05 + Math.sin(t * speed * 13) * 0.03;
    if (lightRef.current) {
      lightRef.current.intensity = intensity * flicker;
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(0.8 + Math.sin(t * speed * 3) * 0.1);
    }
  });

  return (
    <group position={position}>
      <pointLight ref={lightRef} color={color} intensity={intensity} distance={8} decay={2} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

// ─── Cozy Ground Platform ───────────────────────────────────────────
function CozyGround({ color }: { color: string }) {
  return (
    <group position={[0, -1.5, 0]}>
      {/* Main reflective surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[5, 64]} />
        <MeshReflectorMaterial
          blur={[400, 150]}
          resolution={512}
          mixBlur={0.9}
          mixStrength={0.4}
          roughness={0.6}
          depthScale={0.4}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#1a1008"
          metalness={0.3}
          mirror={0.3}
        />
      </mesh>
      {/* Warm glow rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[2.8, 2.85, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[1.5, 1.55, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Center warm pool */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} />
      </mesh>
      {/* Outer subtle grid */}
      <gridHelper
        args={[20, 40, color, color]}
        position={[0, -1.47, 0]}
        material-transparent
        material-opacity={0.025}
      />
    </group>
  );
}

// ─── Floating Warm Crystal ──────────────────────────────────────────
function WarmCrystal({ position, speed, phase, size, color }: {
  position: [number, number, number]; speed: number; phase: number; size: number; color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const y = position[1] + Math.sin(t * speed + phase) * 0.25;
    const rot = t * speed * 0.3;
    if (meshRef.current) {
      meshRef.current.position.y = y;
      meshRef.current.rotation.x = rot;
      meshRef.current.rotation.y = rot * 1.3;
    }
    if (glowRef.current) {
      glowRef.current.position.y = y;
      glowRef.current.scale.setScalar(1 + Math.sin(t * speed * 2 + phase) * 0.15);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[size * 2, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

// ─── Sub-Agent 3D Entity ────────────────────────────────────────────
function SubAgent3D({ agent, index }: { agent: SubAgent; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const baseAngle = (index / 5) * Math.PI * 2;
  const orbitRadius = 2.5 + (index % 3) * 0.5;
  const orbitSpeed = 0.15 + index * 0.04;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const angle = t * orbitSpeed + baseAngle;
    groupRef.current.position.x = Math.cos(angle) * orbitRadius;
    groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    groupRef.current.position.y = Math.sin(t * 0.6 + index * 1.5) * 0.3 + 0.5;
    groupRef.current.lookAt(0, groupRef.current.position.y, 0);

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2 + index * 2) * 0.12);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 1.5 + index;
      ringRef.current.rotation.z = t * 1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.15, 1]} />
          <meshStandardMaterial
            color={agent.color}
            emissive={agent.color}
            emissiveIntensity={2}
            transparent
            opacity={0.9}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.25, 0.006, 6, 32]} />
        <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={1} transparent opacity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

// ─── Main Cozy World ────────────────────────────────────────────────
export function Agent3DWorld() {
  const { agentState, level, subAgents } = useAgentLiveStore();
  const colors = WARM_COLORS[agentState];

  const crystals = useMemo(() => {
    const frags: { pos: [number, number, number]; speed: number; phase: number; size: number }[] = [];
    const count = Math.min(5 + level, 12);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 2 + Math.random() * 4;
      frags.push({
        pos: [Math.cos(angle) * r + (Math.random() - 0.5), 0.3 + Math.random() * 3, Math.sin(angle) * r + (Math.random() - 0.5)],
        speed: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        size: 0.03 + Math.random() * 0.05,
      });
    }
    return frags;
  }, [level]);

  return (
    <>
      {/* Warm ambient fill */}
      <ambientLight intensity={0.15} color="#fef3c7" />

      {/* Main key light — warm overhead */}
      <pointLight position={[0, 7, 0]} intensity={1.5} color={colors.primary} distance={18} decay={2} />
      
      {/* Fill lights — warm sides */}
      <pointLight position={[4, 4, 3]} intensity={0.7} color={colors.secondary} distance={14} decay={2} />
      <pointLight position={[-4, 3, -2]} intensity={0.5} color={colors.ambient} distance={12} decay={2} />
      
      {/* Soft white backlight for rim */}
      <pointLight position={[0, 2, -6]} intensity={0.3} color="#fffbeb" distance={10} decay={2} />

      {/* Cozy lantern lights around the scene */}
      <WarmLantern position={[2.5, 0.8, 2]} color="#f59e0b" intensity={0.6} speed={0.7} />
      <WarmLantern position={[-2.2, 1.2, 1.8]} color="#fb923c" intensity={0.5} speed={0.9} />
      <WarmLantern position={[0.5, 0.5, -2.8]} color="#fbbf24" intensity={0.4} speed={0.6} />
      <WarmLantern position={[-1.8, 1.5, -1.5]} color="#fde047" intensity={0.3} speed={1.1} />

      {/* Cozy ground */}
      <CozyGround color={colors.primary} />

      {/* Fireflies */}
      <Fireflies count={35} color={colors.primary} />
      <Fireflies count={15} color={colors.secondary} />

      {/* Warm sparkles near character */}
      <Sparkles count={40} scale={6} size={2} speed={0.3} opacity={0.3} color={colors.primary} />

      {/* Floating crystals */}
      {crystals.map((frag, i) => (
        <WarmCrystal
          key={i}
          position={frag.pos}
          speed={frag.speed}
          phase={frag.phase}
          size={frag.size}
          color={i % 2 === 0 ? colors.primary : colors.secondary}
        />
      ))}

      {/* Warm fog */}
      <fog attach="fog" args={['#0d0906', 8, 25]} />

      {/* Sub-agents */}
      {subAgents.map((agent, i) => (
        <SubAgent3D key={agent.id} agent={agent} index={i} />
      ))}
    </>
  );
}