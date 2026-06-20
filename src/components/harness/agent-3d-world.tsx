'use client';

import React, { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STATION_COLORS as STATE_COLORS, STATION_ENTRIES } from './agent-3d-shared';

/* ═══════════════════════════════════════════════════════════════════════
   DYNAMIC LIGHTING — adjusts ambient light based on Argentina time
   ═══════════════════════════════════════════════════════════════════════ */
const DynamicLighting = memo(function DynamicLighting() {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const now = new Date();
    const arHour = (now.getUTCHours() - 3 + 24) % 24;
    const sunAngle = ((arHour - 6) / 12) * Math.PI;
    const dayFactor = Math.max(0, Math.cos(sunAngle));
    const brightness = 0.15 + dayFactor * 0.45;

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, brightness, 0.02);
      const warmth = 1 - Math.abs(dayFactor - 0.5) * 2;
      const r = 0.5 + warmth * 0.3;
      const g = 0.5 + dayFactor * 0.2;
      const b = 0.6 + dayFactor * 0.2;
      ambientRef.current.color.setRGB(r, g, b);
    }
    if (dirRef.current) {
      const dirIntensity = 0.3 + dayFactor * 0.7;
      dirRef.current.intensity = THREE.MathUtils.lerp(dirRef.current.intensity, dirIntensity, 0.02);
      const sunX = Math.sin(sunAngle) * 8;
      const sunY = Math.max(0.5, Math.cos(sunAngle) * 8);
      dirRef.current.position.set(sunX, sunY, 4);
      const sunWarmth = 1 - dayFactor;
      dirRef.current.color.setRGB(1, 0.9 - sunWarmth * 0.3, 0.8 - sunWarmth * 0.4);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.35} color="#b0c4de" />
      <directionalLight ref={dirRef} position={[5, 8, 4]} intensity={0.8} color="#ffe4c4" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={0.5} shadow-camera-far={30} shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={8} shadow-camera-bottom={-8} />
      <pointLight position={[-4, 3, -3]} intensity={0.4} color="#06b6d4" distance={10} />
      <pointLight position={[4, 3, 2]} intensity={0.3} color="#a855f7" distance={10} />
      <fog attach="fog" args={['#050a08', 8, 25]} />
    </>
  );
});

/* ═══════════════════════════════════════════════════════════════════════
   STARFIELD — pure Three.js instanced points (replaces drei Stars)
   ═══════════════════════════════════════════════════════════════════════ */
const StarField = memo(function StarField() {
  const count = 600;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const stars = useMemo(() =>
    Array.from({ length: count }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 15 + Math.random() * 15;
      return {
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 2,
          r * Math.cos(phi)
        ),
        twinkleSpeed: 0.5 + Math.random() * 2,
        offset: Math.random() * Math.PI * 2,
        baseScale: 0.02 + Math.random() * 0.03,
      };
    }), []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const s = stars[i];
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.offset);
      dummy.position.copy(s.pos);
      dummy.scale.setScalar(s.baseScale * twinkle);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
    </instancedMesh>
  );
});

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING GEM — pure useFrame bob (replaces drei Float)
   ═══════════════════════════════════════════════════════════════════════ */
function FloatingGem({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.55 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WORLD ENVIRONMENT — ground, trees, rocks, mushrooms, station markers
   ═══════════════════════════════════════════════════════════════════════ */
export const World = memo(function World() {
  const gridRef = useMemo(() => new THREE.GridHelper(24, 36, '#1a3a2a', '#0d1f15'), []);
  return (
    <group>
      <DynamicLighting />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[12, 48]} />
        <meshStandardMaterial color="#0a1a0f" roughness={0.9} metalness={0.1} />
      </mesh>
      <primitive object={gridRef} position={[0, 0.005, 0]} />

      {/* Stars — pure Three.js */}
      <StarField />

      {/* Trees */}
      {[
        [-4, 0, -4], [-2, 0, -5], [4.5, 0, -4], [5, 0, -2],
        [-5, 0, 1], [-4.5, 0, 3], [5.5, 0, 0], [2, 0, 5],
        [-3, 0, 4.5], [6, 0, 3], [-6, 0, -2], [1, 0, -6],
      ].map((pos, i) => (
        <group key={`tree-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.8, 6]} />
            <meshStandardMaterial color="#5D4037" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <sphereGeometry args={[0.3 + (i % 3) * 0.1, 7, 7]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#2E7D32' : '#388E3C'} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Rocks */}
      {[
        [-1.5, 0, -3], [2, 0, -1], [-3, 0, 0.5], [1.5, 0, 3.5],
        [4, 0, -3.5], [-5.5, 0, -0.5], [0.5, 0, -5.5],
      ].map((pos, i) => (
        <mesh key={`rock-${i}`} position={pos as [number, number, number]} castShadow
          scale={[0.6 + (i % 3) * 0.3, 0.5 + (i % 2) * 0.2, 0.6 + (i % 3) * 0.3]}>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.85} metalness={0.05} />
        </mesh>
      ))}

      {/* Glowing mushrooms */}
      {[
        { pos: [-2, 0, 1] as [number, number, number], color: '#ff6b6b' },
        { pos: [1, 0, -2] as [number, number, number], color: '#7c4dff' },
        { pos: [-1, 0, 3] as [number, number, number], color: '#00e5ff' },
        { pos: [3, 0, 2] as [number, number, number], color: '#76ff03' },
        { pos: [-4, 0, -1] as [number, number, number], color: '#ffab40' },
        { pos: [2, 0, -4] as [number, number, number], color: '#e040fb' },
      ].map((m, i) => (
        <group key={`mush-${i}`} position={m.pos}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.015, 0.025, 0.12, 6]} />
            <meshStandardMaterial color="#f5f5dc" />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.05, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.5} transparent opacity={0.85} />
          </mesh>
          <pointLight position={[0, 0.15, 0]} color={m.color} intensity={0.15} distance={1.5} />
        </group>
      ))}

      {/* Station markers — no Html (pure 3D) */}
      {STATION_ENTRIES.map(([key, s]) => {
        const color = STATE_COLORS[key];
        return (
          <group key={`station-${key}`} position={[s.pos[0], s.pos[1], s.pos[2]]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.7} />
            </mesh>
            <FloatingGem color={color} />
            <pointLight position={[0, 0.5, 0]} color={color} intensity={0.2} distance={2} />
          </group>
        );
      })}

      {/* LIBRARY — bookshelf */}
      <group position={[-3, 0, -2]}>
        <mesh position={[-0.3, 0.2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.1]} />
          <meshStandardMaterial color="#5D4037" roughness={0.8} />
        </mesh>
        {[0, 0.1, 0.2].map((y, i) => (
          <mesh key={`book-${i}`} position={[-0.3, 0.12 + y, 0.06]}>
            <boxGeometry args={[0.3, 0.06, 0.08]} />
            <meshStandardMaterial color={['#e53935', '#1e88e5', '#43a047'][i]} />
          </mesh>
        ))}
      </group>

      {/* OBSERVATORY — telescope */}
      <group position={[3, 0, -2]}>
        <mesh position={[0.2, 0.3, 0]} rotation={[0.3, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.03, 0.06, 0.5, 8]} />
          <meshStandardMaterial color="#78909C" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.2, 0.1, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.2, 8]} />
          <meshStandardMaterial color="#546E7A" metalness={0.4} />
        </mesh>
      </group>

      {/* PLAZA — small stage */}
      <group position={[0, 0, 3]}>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <cylinderGeometry args={[0.6, 0.7, 0.08, 12]} />
          <meshStandardMaterial color="#37474F" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.08, 0.5, 4]} />
          <meshStandardMaterial color="#FFD54F" emissive="#FFD54F" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
});