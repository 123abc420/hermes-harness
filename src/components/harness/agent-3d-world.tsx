'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { useAgentLiveStore, type AgentVisualState, type SubAgent } from '@/store/agent-live-store';
import * as THREE from 'three';

// ─── State Colors ────────────────────────────────────────────────────
const STATE_COLORS: Record<AgentVisualState, string> = {
  idle: '#10b981', thinking: '#06b6d4', searching: '#f59e0b',
  planning: '#8b5cf6', executing: '#f43f5e', verifying: '#34d399',
  celebrating: '#eab308', error: '#ef4444', evolving: '#a855f7', offline: '#52525b',
};

const STATE_COLORS_ALT: Record<AgentVisualState, string> = {
  idle: '#059669', thinking: '#0891b2', searching: '#d97706',
  planning: '#7c3aed', executing: '#e11d48', verifying: '#059669',
  celebrating: '#facc15', error: '#dc2626', evolving: '#9333ea', offline: '#3f3f46',
};

// ─── Sub-Agent 3D Entity ──────────────────────────────────────────────
function SubAgent3D({ agent, index }: { agent: SubAgent; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  const baseAngle = (index / 5) * Math.PI * 2;
  const orbitRadius = 2.8 + (index % 3) * 0.6;
  const orbitSpeed = 0.2 + index * 0.05;

  const trailPositions = useMemo(() => {
    const pos = new Float32Array(20 * 3);
    for (let i = 0; i < 20; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const angle = t * orbitSpeed + baseAngle;
    groupRef.current.position.x = Math.cos(angle) * orbitRadius;
    groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    groupRef.current.position.y = Math.sin(t * 0.8 + index * 1.5) * 0.4 + 0.3;
    groupRef.current.lookAt(0, groupRef.current.position.y, 0);

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 3 + index * 2) * 0.15);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 2 + index;
      ringRef.current.rotation.z = t * 1.5;
    }
    if (trailRef.current) {
      const arr = trailRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 20; i++) {
        arr[i * 3 + 1] += Math.sin(t * 5 + i * 0.5) * 0.001;
      }
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={2} transparent opacity={0.9} roughness={0.2} metalness={0.8} />
        </mesh>
      </Float>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.3, 0.008, 6, 32]} />
        <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={1} transparent opacity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.04} />
      </mesh>
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={20} array={trailPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={agent.color} size={0.025} transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
}

// ─── Floating Data Fragment ──────────────────────────────────────────
function DataFragment({ position, speed, phase, size, color }: {
  position: [number, number, number]; speed: number; phase: number; size: number; color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const y = position[1] + Math.sin(t * speed + phase) * 0.3;
    if (meshRef.current) {
      meshRef.current.position.y = y;
      meshRef.current.rotation.x += 0.008 * speed;
      meshRef.current.rotation.y += 0.012 * speed;
    }
    if (wireRef.current) {
      wireRef.current.position.y = y;
      wireRef.current.rotation.x += 0.008 * speed;
      wireRef.current.rotation.y += 0.012 * speed;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.15} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh ref={wireRef} position={position}>
        <octahedronGeometry args={[size * 1.4, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

// ─── Ground Platform ──────────────────────────────────────────────────
function GroundPlatform({ color }: { color: string }) {
  return (
    <group position={[0, -1.5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[4, 64]} />
        <MeshReflectorMaterial
          blur={[300, 100]} resolution={512} mixBlur={0.8}
          mixStrength={0.3} roughness={0.8} depthScale={0.5}
          minDepthThreshold={0.4} maxDepthThreshold={1}
          color="#0a0a0a" metalness={0.5} mirror={0.4}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.9, 4.0, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.8, 1.85, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

// ─── Main World ───────────────────────────────────────────────────────
export function Agent3DWorld() {
  const { agentState, level, subAgents } = useAgentLiveStore();
  const stateColor = STATE_COLORS[agentState];
  const stateColorAlt = STATE_COLORS_ALT[agentState];

  const dataFragments = useMemo(() => {
    const frags: { pos: [number, number, number]; speed: number; phase: number; size: number }[] = [];
    const count = Math.min(6 + level, 16);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 2.5 + Math.random() * 3;
      frags.push({
        pos: [Math.cos(angle) * r + (Math.random() - 0.5), 0.5 + Math.random() * 3.5, Math.sin(angle) * r + (Math.random() - 0.5)],
        speed: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        size: 0.04 + Math.random() * 0.06,
      });
    }
    return frags;
  }, [level]);

  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[3, 6, 3]} intensity={1.2} color={stateColor} distance={20} decay={2} />
      <pointLight position={[-4, 4, -3]} intensity={0.6} color={stateColorAlt} distance={15} decay={2} />
      <pointLight position={[0, 3, -5]} intensity={0.4} color="#ffffff" distance={12} decay={2} />
      <spotLight position={[0, 8, 0]} angle={0.4} penumbra={0.8} intensity={0.5} color={stateColor} castShadow={false} />

      <GroundPlatform color={stateColor} />

      <gridHelper args={[24, 48, stateColor, stateColor]} position={[0, -1.48, 0]} material-transparent material-opacity={0.04} />

      <Sparkles count={80} scale={20} size={1.5} speed={0.2} opacity={0.4} color="#ffffff" />
      <Sparkles count={15} scale={4} size={3} speed={0.5} opacity={0.5} color={stateColor} />

      {dataFragments.map((frag, i) => (
        <DataFragment key={i} position={frag.pos} speed={frag.speed} phase={frag.phase} size={frag.size} color={stateColor} />
      ))}

      <fog attach="fog" args={['#050a0e', 10, 30]} />

      {subAgents.map((agent, i) => (
        <SubAgent3D key={agent.id} agent={agent} index={i} />
      ))}
    </>
  );
}