'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import { useAgentLiveStore, type AgentVisualState, type SubAgent } from '@/store/agent-live-store';
import { STATIONS } from './agent-3d-chibi';
import * as THREE from 'three';

// ─── State-based ambient colors ────────────────────────────────────────
const AMBIENT: Record<AgentVisualState, { sky: string; ground: string; fog: string; intensity: number }> = {
  idle:       { sky: '#fef3c7', ground: '#92400e', fog: '#1c1917', intensity: 0.6 },
  thinking:   { sky: '#cffafe', ground: '#164e63', fog: '#0c1a25', intensity: 0.7 },
  searching:  { sky: '#ffedd5', ground: '#7c2d12', fog: '#1c1209', intensity: 0.65 },
  planning:   { sky: '#ede9fe', ground: '#581c87', fog: '#150d20', intensity: 0.6 },
  executing:  { sky: '#ffe4e6', ground: '#881337', fog: '#1c0a10', intensity: 0.8 },
  verifying:  { sky: '#d1fae5', ground: '#064e3b', fog: '#0a1c14', intensity: 0.65 },
  celebrating:{ sky: '#fef9c3', ground: '#854d0e', fog: '#1c1a0a', intensity: 1.0 },
  error:      { sky: '#fecaca', ground: '#991b1b', fog: '#1c0a0a', intensity: 0.9 },
  evolving:   { sky: '#fae8ff', ground: '#701a75', fog: '#1a0a1c', intensity: 0.75 },
  offline:    { sky: '#e4e4e7', ground: '#27272a', fog: '#0a0a0a', intensity: 0.2 },
};

// ─── Station Marker ────────────────────────────────────────────────────
function StationMarker({ state, position, label, isActive }: {
  state: AgentVisualState; position: [number, number, number]; label: string; isActive: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const colors = AMBIENT[state];

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.5;
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isActive ? 1.5 + Math.sin(t * 3) * 0.5 : 0.2;
      mat.opacity = isActive ? 0.6 : 0.12;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(isActive ? 1.3 + Math.sin(t * 2) * 0.1 : 0.8);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isActive ? 0.08 : 0.01;
    }
  });

  if (!label) return null;

  return (
    <group position={[position[0], 0.01, position[2]]}>
      {/* Ground glow */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 24]} />
        <meshBasicMaterial color={colors.sky} transparent opacity={0.02} depthWrite={false} />
      </mesh>
      {/* Ring marker */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.52, 32]} />
        <meshStandardMaterial
          color={colors.sky}
          emissive={colors.sky}
          emissiveIntensity={0.2}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.12}
        color={isActive ? colors.sky : '#52525b'}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
      {/* Active indicator pillar */}
      {isActive && (
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color={colors.sky} emissive={colors.sky} emissiveIntensity={1} transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

// ─── Decorative Tree ──────────────────────────────────────────────────
function Tree({ position, height = 1, color = '#22c55e' }: {
  position: [number, number, number]; height?: number; color?: string;
}) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, height * 0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.08, height * 0.5, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Foliage layers */}
      <mesh position={[0, height * 0.6, 0]}>
        <coneGeometry args={[0.3, height * 0.4, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, height * 0.45, 0]}>
        <coneGeometry args={[0.38, height * 0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, height * 0.85, 0]}>
        <coneGeometry args={[0.2, height * 0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Decorative Rock ──────────────────────────────────────────────────
function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} rotation={[0.2, Math.random() * 2, 0.1]}>
      <dodecahedronGeometry args={[0.12 * scale, 0]} />
      <meshStandardMaterial color="#78716c" roughness={0.9} metalness={0.05} />
    </mesh>
  );
}

// ─── Decorative Mushroom ──────────────────────────────────────────────
function Mushroom({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.12, 6]} />
        <meshStandardMaterial color="#fefce8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.06, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} emissive="#ef4444" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.04, 0.16, 0.02]}>
        <sphereGeometry args={[0.012, 4, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.02, 0.17, -0.01]}>
        <sphereGeometry args={[0.008, 4, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ─── Floating Particle ────────────────────────────────────────────────
function AmbientParticles({ color, count = 25 }: { color: string; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = 0.2 + Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.001;
      arr[i * 3] += Math.cos(t * 0.3 + i * 0.7) * 0.0005;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={data} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.04}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Path between two points ──────────────────────────────────────────
function Path({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = useMemo(() => {
    const p = [new THREE.Vector3(from[0], 0.005, from[2]), new THREE.Vector3(to[0], 0.005, to[2])];
    return p;
  }, [from, to]);
  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={lineGeo}>
      <lineBasicMaterial color="#44403c" transparent opacity={0.3} linewidth={1} />
    </line>
  );
}

// ─── Work Station Props (objects at each station) ─────────────────────
function StationObject({ state, position }: { state: AgentVisualState; position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.position.y = 0.01 + Math.sin(s.clock.elapsedTime + position[0]) * 0.005;
  });

  const items: Record<string, React.ReactNode> = {
    thinking: (
      <group ref={ref} position={[position[0], 0.01, position[2]]}>
        {/* Bookshelf */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.15]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {[0, 1, 2].map(i => (
          <mesh key={i} position={[-0.15 + i * 0.15, 0.3 + i * 0.04, 0.04]}>
            <boxGeometry args={[0.1, 0.14, 0.08]} />
            <meshStandardMaterial color={['#3b82f6', '#ef4444', '#22c55e'][i]} roughness={0.7} />
          </mesh>
        ))}
      </group>
    ),
    searching: (
      <group ref={ref} position={[position[0], 0.01, position[2]]}>
        {/* Telescope / magnifying glass */}
        <mesh position={[0, 0.3, 0]} rotation={[0.3, 0, 0.2]}>
          <cylinderGeometry args={[0.04, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#a8a29e" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.15, 0.45, 0.1]} rotation={[0, 0, -0.5]}>
          <torusGeometry args={[0.08, 0.02, 8, 16]} />
          <meshStandardMaterial color="#d6d3d1" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    ),
    planning: (
      <group ref={ref} position={[position[0], 0.01, position[2]]}>
        {/* Map board / easel */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.04]} />
          <meshStandardMaterial color="#fefce8" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {/* Grid lines on map */}
        <mesh position={[0, 0.35, 0.025]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      </group>
    ),
    executing: (
      <group ref={ref} position={[position[0], 0.01, position[2]]}>
        {/* Workbench / anvil */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.3]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {/* Hammer */}
        <mesh position={[0.2, 0.38, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.2, 0.06, 0.06]} />
          <meshStandardMaterial color="#71717a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.38, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
      </group>
    ),
    verifying: (
      <group ref={ref} position={[position[0], 0.01, position[2]]}>
        {/* Lab equipment / flask */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.1, 0.25, 8]} />
          <meshStandardMaterial color="#a5f3fc" transparent opacity={0.4} roughness={0.1} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.02, 0.06, 0.1, 8]} />
          <meshStandardMaterial color="#a5f3fc" transparent opacity={0.3} roughness={0.1} metalness={0.2} />
        </mesh>
        {/* Bubbles */}
        <Float speed={2} floatIntensity={0.3}>
          <mesh position={[0.03, 0.3, 0.05]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.4} />
          </mesh>
        </Float>
      </group>
    ),
    celebrating: (
      <group ref={ref} position={[position[0], 0.01, position[2]]}>
        {/* Stage / podium */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.16, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.5} metalness={0.2} emissive="#fbbf24" emissiveIntensity={0.1} />
        </mesh>
        {/* Star topper */}
        <Float speed={3} floatIntensity={0.2}>
          <mesh position={[0, 0.45, 0]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={1} />
          </mesh>
        </Float>
      </group>
    ),
    idle: (
      <group ref={ref} position={[position[0], 0.01, position[2]]}>
        {/* Home / cushion */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 0.1, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.7} />
        </mesh>
      </group>
    ),
  };

  return <>{items[state]}</>;
}

// ─── Sub-Agent 3D Entity ──────────────────────────────────────────────
function SubAgent3D({ agent, index }: { agent: SubAgent; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const baseAngle = (index / 5) * Math.PI * 2;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const angle = t * 0.15 + baseAngle;
    const r = 3.5 + (index % 3) * 0.8;
    groupRef.current.position.x = Math.cos(angle) * r;
    groupRef.current.position.z = Math.sin(angle) * r;
    groupRef.current.position.y = 0.3 + Math.sin(t * 0.8 + index) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh>
          <dodecahedronGeometry args={[0.1, 1]} />
          <meshStandardMaterial
            color={agent.color}
            emissive={agent.color}
            emissiveIntensity={1.5}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      </Float>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.06}
        color={agent.color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {agent.name}
      </Text>
    </group>
  );
}

// ─── Main World ───────────────────────────────────────────────────────
export function Agent3DWorld() {
  const { agentState, subAgents } = useAgentLiveStore();
  const ambient = AMBIENT[agentState];
  const lightColor = useRef(new THREE.Color(ambient.sky));
  const fogColor = useRef(new THREE.Color(ambient.fog));
  const lightIntensity = useRef(ambient.intensity);

  useFrame((_, delta) => {
    const target = AMBIENT[agentState];
    lightColor.current.lerp(new THREE.Color(target.sky), delta * 2);
    fogColor.current.lerp(new THREE.Color(target.fog), delta * 2);
    lightIntensity.current += (target.intensity - lightIntensity.current) * delta * 2;
  });

  const activeStates = useMemo(() => {
    const active = new Set<AgentVisualState>([agentState, 'idle']);
    return active;
  }, [agentState]);

  // Paths connecting stations
  const pathPairs = useMemo(() => {
    const pairs: Array<{ from: [number, number, number]; to: [number, number, number] }> = [];
    const states: AgentVisualState[] = ['idle', 'thinking', 'searching', 'planning', 'executing', 'verifying', 'celebrating'];
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const a = STATIONS[states[i]];
        const b = STATIONS[states[j]];
        const dist = Math.hypot(a.pos[0] - b.pos[0], a.pos[2] - b.pos[2]);
        if (dist < 4) {
          pairs.push({ from: a.pos, to: b.pos });
        }
      }
    }
    return pairs;
  }, []);

  return (
    <>
      {/* ─── Sky dome ─── */}
      <mesh>
        <sphereGeometry args={[30, 32, 32]} />
        <meshBasicMaterial color="#0f0f0f" side={THREE.BackSide} />
      </mesh>

      {/* ─── Lighting ─── */}
      <ambientLight intensity={0.35} color={ambient.sky} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color={ambient.sky}
        castShadow
      />
      <pointLight position={[0, 4, 0]} intensity={0.5} color={ambient.sky} distance={12} />

      {/* ─── Fog ─── */}
      <fog attach="fog" args={['#0f0f0f', 8, 22]} />

      {/* ─── Ground ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial
          color="#1c1917"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Ground accent ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[5.8, 6, 64]} />
        <meshBasicMaterial color="#44403c" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* ─── Paths ─── */}
      {pathPairs.map((p, i) => (
        <Path key={i} from={p.from} to={p.to} />
      ))}

      {/* ─── Station markers ─── */}
      {(Object.keys(STATIONS) as AgentVisualState[]).map((s) => {
        const st = STATIONS[s];
        return (
          <StationMarker
            key={s}
            state={s}
            position={st.pos}
            label={st.label}
            isActive={agentState === s}
          />
        );
      })}

      {/* ─── Station objects ─── */}
      <StationObject state="thinking" position={STATIONS.thinking.pos} />
      <StationObject state="searching" position={STATIONS.searching.pos} />
      <StationObject state="planning" position={STATIONS.planning.pos} />
      <StationObject state="executing" position={STATIONS.executing.pos} />
      <StationObject state="verifying" position={STATIONS.verifying.pos} />
      <StationObject state="celebrating" position={STATIONS.celebrating.pos} />
      <StationObject state="idle" position={STATIONS.idle.pos} />

      {/* ─── Trees ─── */}
      <Tree position={[-4, 0, -4]} height={1.2} />
      <Tree position={[4.2, 0, -3.5]} height={0.9} />
      <Tree position={[-3.5, 0, 3]} height={1.0} />
      <Tree position={[3.8, 0, 3.5]} height={1.1} />
      <Tree position={[0, 0, -5]} height={0.8} />
      <Tree position={[-5, 0, 0]} height={0.7} />
      <Tree position={[5, 0, 1]} height={0.85} color="#16a34a" />

      {/* ─── Rocks ─── */}
      <Rock position={[-3, 0, -1.5]} scale={1.2} />
      <Rock position={[4.5, 0, 0.5]} scale={0.8} />
      <Rock position={[-1, 0, 4]} scale={1} />
      <Rock position={[2, 0, -4]} scale={0.6} />
      <Rock position={[-4.5, 0, 2]} scale={0.9} />

      {/* ─── Mushrooms ─── */}
      <Mushroom position={[-2.8, 0, 2.5]} />
      <Mushroom position={[3.2, 0, -2.8]} />
      <Mushroom position={[1.5, 0, 4.2]} />
      <Mushroom position={[-4.2, 0, -2]} />
      <Mushroom position={[0.5, 0, -4.5]} />

      {/* ─── Ambient particles ─── */}
      <AmbientParticles color={ambient.sky} count={20} />

      {/* ─── Sub-agents ─── */}
      {subAgents.map((agent, i) => (
        <SubAgent3D key={agent.id} agent={agent} index={i} />
      ))}
    </>
  );
}