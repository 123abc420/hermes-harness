'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import * as THREE from 'three';

// ─── Sub-Agent 3D Entity ────────────────────────────────────────────────
export function SubAgent3D({
  agent,
  index,
}: {
  agent: { id: string; state: AgentVisualState; color: string; spawnTime: number };
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const angle = (index / 5) * Math.PI * 2;
  const radius = 2.5 + (index % 3) * 0.5;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Orbit around the main character
    groupRef.current.position.x = Math.cos(t * 0.3 + angle) * radius;
    groupRef.current.position.z = Math.sin(t * 0.3 + angle) * radius;
    groupRef.current.position.y = Math.sin(t * 0.8 + index) * 0.3 + 0.5;

    // Look at center
    groupRef.current.lookAt(0, groupRef.current.position.y, 0);

    // Pulse
    if (coreRef.current) {
      const pulse = 0.15 + Math.sin(t * 3 + index * 2) * 0.03;
      coreRef.current.scale.setScalar(pulse / 0.15);
    }

    // Spin ring
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 2;
      ringRef.current.rotation.z = t * 1.5;
    }
  });

  return (
    <group ref={groupRef} position={[Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius]}>
      {/* Sub-agent core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.15, 1]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Sub-agent ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.25, 0.008, 6, 32]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
        />
      </mesh>
      {/* Sub-agent glow */}
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

// ─── Sandbox World ──────────────────────────────────────────────────────
export function Agent3DWorld() {
  const gridRef = useRef<THREE.GridHelper>(null);
  const starRef = useRef<THREE.Points>(null);
  const dataNodesRef = useRef<THREE.Group>(null);

  const { agentState, level, subAgents } = useAgentLiveStore();

  // Create star field
  const starPositions = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 15 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return positions;
  }, []);

  // Create floating data nodes
  const dataNodes = useMemo(() => {
    const nodes: { pos: THREE.Vector3; scale: number; speed: number; phase: number }[] = [];
    const count = Math.min(6 + level, 15);
    for (let i = 0; i < count; i++) {
      nodes.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          1 + Math.random() * 3,
          (Math.random() - 0.5) * 8,
        ),
        scale: 0.05 + Math.random() * 0.08,
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return nodes;
  }, [level]);

  const stateColor = {
    idle: '#10b981', thinking: '#06b6d4', searching: '#f59e0b',
    planning: '#8b5cf6', executing: '#f43f5e', verifying: '#34d399',
    celebrating: '#eab308', error: '#ef4444', evolving: '#a855f7', offline: '#71717a',
  }[agentState];

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Animate data nodes
    if (dataNodesRef.current) {
      dataNodesRef.current.children.forEach((child, i) => {
        const node = dataNodes[i];
        if (!node) return;
        child.position.y = node.pos.y + Math.sin(t * node.speed + node.phase) * 0.3;
        child.rotation.x += 0.01 * node.speed;
        child.rotation.y += 0.015 * node.speed;
      });
    }

    // Slowly rotate stars
    if (starRef.current) {
      starRef.current.rotation.y += 0.0001;
    }

    // Pulse grid color
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.Material & { color: THREE.Color; opacity: number };
      if (mat.color) {
        mat.color.lerp(new THREE.Color(stateColor), 0.02);
      }
    }
  });

  return (
    <>
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[3, 5, 3]} intensity={0.5} color={stateColor} distance={15} />
      <pointLight position={[-3, 3, -2]} intensity={0.3} color="#8b5cf6" distance={10} />

      {/* Grid floor */}
      <gridHelper
        ref={gridRef}
        args={[20, 40, stateColor, stateColor]}
        position={[0, -1.5, 0]}
        material-transparent
        material-opacity={0.08}
      />

      {/* Ground reflection disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshBasicMaterial color={stateColor} transparent opacity={0.04} />
      </mesh>

      {/* Star field */}
      <points ref={starRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.03} transparent opacity={0.4} sizeAttenuation />
      </points>

      {/* Floating data nodes */}
      <group ref={dataNodesRef}>
        {dataNodes.map((node, i) => (
          <mesh key={i} position={[node.pos.x, node.pos.y, node.pos.z]}>
            <octahedronGeometry args={[node.scale, 0]} />
            <meshStandardMaterial
              color={stateColor}
              emissive={stateColor}
              emissiveIntensity={0.3}
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        ))}
      </group>

      {/* Fog for depth */}
      <fog attach="fog" args={['#050a0e', 8, 25]} />

      {/* Sub-agents */}
      {subAgents.map((agent, i) => (
        <SubAgent3D key={agent.id} agent={agent} index={i} />
      ))}
    </>
  );
}