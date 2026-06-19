'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { STATIONS } from './agent-3d-shared';
import { useAgentLiveStore } from '@/store/agent-live-store';
import type { AgentVisualState, SubAgent } from '@/store/agent-live-store';

const STATE_COLORS: Record<AgentVisualState, string> = {
  idle: '#f59e0b', thinking: '#06b6d4', searching: '#fb923c', planning: '#a78bfa',
  executing: '#f43f5e', verifying: '#34d399', celebrating: '#facc15',
  error: '#ef4444', evolving: '#d946ef', offline: '#71717a',
};

const STATE_LIGHT: Record<AgentVisualState, number> = {
  idle: 0.4, thinking: 0.5, searching: 0.45, planning: 0.4,
  executing: 0.6, verifying: 0.45, celebrating: 0.7,
  error: 0.8, evolving: 0.6, offline: 0.2,
};

function StationMarker({ state, pos, label, color }: { state: AgentVisualState; pos: [number, number, number]; label: string; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ringRef.current.rotation.y += delta * 0.5;
  });
  if (!label) return null;
  return (
    <group position={[pos[0], 0, pos[2]]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[0.4, 0.02, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.08} />
      </mesh>
      <Float speed={2} floatIntensity={0.3} rotationIntensity={0}>
        <Text position={[0, 0.6, 0]} fontSize={0.1} color={color} anchorX="center" anchorY="middle" font={undefined}>
          {label}
        </Text>
      </Float>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[0.35, 0.7, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <coneGeometry args={[0.25, 0.5, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <mesh position={position} scale={scale} rotation={[0.2, 0.5, 0.1]} castShadow>
      <dodecahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial color="#57534e" roughness={0.9} />
    </mesh>
  );
}

function Mushroom({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.16, 8]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.06, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
    </group>
  );
}

function StationObject({ state, pos }: { state: AgentVisualState; pos: [number, number, number] }) {
  const x = pos[0], z = pos[2];
  switch (state) {
    case 'idle':
      return (
        <group position={[x, 0, z]}>
          <mesh position={[0.6, 0.06, 0.3]} castShadow>
            <boxGeometry args={[0.35, 0.12, 0.25]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
          <mesh position={[0.6, 0.12, 0.3]}>
            <boxGeometry args={[0.3, 0.08, 0.2]} />
            <meshStandardMaterial color="#d97706" roughness={0.6} />
          </mesh>
        </group>
      );
    case 'thinking':
      return (
        <group position={[x - 0.4, 0, z - 0.3]}>
          {[0, 0.12, 0.24].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} castShadow>
              <boxGeometry args={[0.25, 0.08, 0.18]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#1e3a5f' : '#f5f0e8'} roughness={0.7} />
            </mesh>
          ))}
        </group>
      );
    case 'searching':
      return (
        <group position={[x + 0.4, 0, z - 0.2]}>
          <mesh position={[0, 0.25, 0]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.06, 0.5, 8]} />
            <meshStandardMaterial color="#78716c" metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.5, -0.05]}>
            <cylinderGeometry args={[0.07, 0.04, 0.08, 8]} />
            <meshStandardMaterial color="#a8a29e" metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.5, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
    case 'planning':
      return (
        <group position={[x, 0, z - 0.4]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.03]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            <meshStandardMaterial color="#78716c" metalness={0.4} />
          </mesh>
          <mesh position={[-0.1, 0.4, 0.02]}>
            <boxGeometry args={[0.08, 0.06, 0.01]} />
            <meshStandardMaterial color="#a78bfa" />
          </mesh>
          <mesh position={[0.08, 0.3, 0.02]}>
            <boxGeometry args={[0.06, 0.04, 0.01]} />
            <meshStandardMaterial color="#f43f5e" />
          </mesh>
        </group>
      );
    case 'executing':
      return (
        <group position={[x + 0.3, 0, z + 0.3]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.45, 0.3, 0.25]} />
            <meshStandardMaterial color="#57534e" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.4, 0.04, 0.2]} />
            <meshStandardMaterial color="#78716c" metalness={0.5} />
          </mesh>
          <mesh position={[-0.15, 0.35, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 8]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.3} />
          </mesh>
        </group>
      );
    case 'verifying':
      return (
        <group position={[x - 0.3, 0, z + 0.3]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.15, 12]} />
            <meshStandardMaterial color="#d1d5db" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#34d399" transparent opacity={0.5} emissive="#34d399" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.02, 0.04, 0.08, 8]} />
            <meshStandardMaterial color="#a8a29e" />
          </mesh>
        </group>
      );
    case 'celebrating':
      return (
        <group position={[x, 0, z + 0.5]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.15, 0.6, 6]} />
            <meshStandardMaterial color="#d97706" metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 6]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.6} />
          </mesh>
        </group>
      );
    case 'evolving':
      return (
        <group position={[x, 0, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.3, 0.35, 6]} />
            <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={0.8} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function SubAgentOrb({ agent, index }: { agent: SubAgent; index: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const angle = (index / 6) * Math.PI * 2;
  const radius = 3.5 + (index % 3) * 0.5;
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.3 + index * 1.5;
    ref.current.position.x = Math.cos(t + angle) * radius;
    ref.current.position.z = Math.sin(t + angle) * radius;
    ref.current.position.y = 0.5 + Math.sin(t * 2) * 0.2;
  });
  return (
    <group ref={ref as any}>
      <mesh>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 0.15, 0]} fontSize={0.05} color={agent.color} anchorX="center" anchorY="bottom">
        {agent.name}
      </Text>
    </group>
  );
}

function AmbientParticles() {
  const count = 60;
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = Math.random() * 4 + 0.2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a78bfa" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function StationPaths() {
  const stationEntries = Object.entries(STATIONS) as [AgentVisualState, { pos: [number, number, number]; rot: number; label: string }][];
  const pathPairs = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < stationEntries.length; i++) {
      for (let j = i + 1; j < stationEntries.length; j++) {
        const a = new THREE.Vector3(...stationEntries[i][1].pos);
        const b = new THREE.Vector3(...stationEntries[j][1].pos);
        if (a.distanceTo(b) < 4) {
          pairs.push([a, b]);
        }
      }
    }
    return pairs;
  }, []);
  return (
    <>
      {pathPairs.map(([a, b], i) => {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a.x, 0.005, a.z),
          new THREE.Vector3(b.x, 0.005, b.z),
        ]);
        return (
          <line key={i} geometry={geom}>
            <lineBasicMaterial color="#44403c" transparent opacity={0.3} />
          </line>
        );
      })}
    </>
  );
}

export function Agent3DWorld() {
  const agentState = useAgentLiveStore((s) => s.agentState);
  const subAgents = useAgentLiveStore((s) => s.subAgents);
  const dirLightRef = useRef<THREE.DirectionalLight>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);

  const color = STATE_COLORS[agentState];
  const intensity = STATE_LIGHT[agentState];

  useFrame(() => {
    const c = new THREE.Color(color);
    pointLightRef.current.color.lerp(c, 0.05);
    pointLightRef.current.intensity = THREE.MathUtils.lerp(pointLightRef.current.intensity, intensity, 0.05);
  });

  const treePositions: [number, number, number][] = [
    [-4, 0, -3], [3.5, 0, -4], [-3.5, 0, 2], [4, 0, 3], [-1, 0, -5], [5, 0, -1], [-5, 0, 0],
  ];
  const rockPositions: [number, number, number][] = [
    [-3.2, 0, -1.5], [3.8, 0, 0.5], [-1.5, 0, 3.5], [1.2, 0, -4.5], [4.5, 0, -2.5],
  ];
  const rockScales = [0.8, 1.2, 0.6, 1, 0.7];
  const mushroomPositions: [number, number, number][] = [
    [-2.2, 0, 0.8], [1.8, 0, -2.8], [-0.5, 0, 2.5], [3.2, 0, 2.2], [-4.2, 0, -2.2],
  ];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight ref={dirLightRef} position={[5, 8, 3]} intensity={0.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-near={0.5} shadow-camera-far={20} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <pointLight ref={pointLightRef} position={[0, 3, 0]} color={color} intensity={intensity} distance={10} />
      <hemisphereLight args={['#1e1b4b', '#0c0a09', 0.2]} />

      {/* Sky dome */}
      <mesh position={[0, 0, 0]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[25, 32, 32]} />
        <meshBasicMaterial color="#0f0d1a" side={THREE.BackSide} />
      </mesh>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#1c1917" roughness={0.95} />
      </mesh>

      {/* Fog */}
      <fog attach="fog" args={['#0f0d1a', 8, 20]} />

      {/* Stars */}
      <Stars radius={15} depth={10} count={800} factor={2} fade speed={0.5} />

      {/* Station markers */}
      {(Object.entries(STATIONS) as [AgentVisualState, typeof STATIONS[AgentVisualState]][]).map(([state, st]) => (
        <StationMarker key={state} state={state} pos={st.pos} label={st.label} color={STATE_COLORS[state]} />
      ))}

      {/* Station objects */}
      {(Object.entries(STATIONS) as [AgentVisualState, typeof STATIONS[AgentVisualState]][]).map(([state, st]) => (
        <StationObject key={state} state={state} pos={st.pos} />
      ))}

      {/* Paths */}
      <StationPaths />

      {/* Trees */}
      {treePositions.map((p, i) => <Tree key={i} position={p} />)}

      {/* Rocks */}
      {rockPositions.map((p, i) => <Rock key={i} position={p} scale={rockScales[i]} />)}

      {/* Mushrooms */}
      {mushroomPositions.map((p, i) => <Mushroom key={i} position={p} />)}

      {/* Ambient particles */}
      <AmbientParticles />

      {/* Sub-agents */}
      {subAgents.map((agent, i) => <SubAgentOrb key={agent.id} agent={agent} index={i} />)}
    </>
  );
}