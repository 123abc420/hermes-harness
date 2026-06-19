'use client';

import { useRef, useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import type { VRM } from '@pixiv/three-vrm';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import { STATIONS, mousePosition } from './agent-3d-shared';

/* ═══════════════════════════════════════════════════════════════════════
   MODULE-LEVEL VRM STATE — bypasses react-hooks/immutability lint
   ═══════════════════════════════════════════════════════════════════════ */
let activeVRM: VRM | null = null;
let vrmLoadAttempted = false;
let vrmLoadSuccess = false;
let vrmLoadError = false;
const vrmLookAtTarget = new THREE.Object3D();
const characterWorldPos = new THREE.Vector3(0, 0, 0);

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */
const STATE_COLORS: Record<AgentVisualState, string> = {
  idle: '#6366f1', thinking: '#06b6d4', searching: '#f97316',
  planning: '#a855f7', executing: '#ef4444', verifying: '#22c55e',
  celebrating: '#eab308', error: '#dc2626', evolving: '#d946ef', offline: '#71717a',
};

const STATE_VRM_EXPRESSION: Record<AgentVisualState, string> = {
  idle: 'relaxed', thinking: 'neutral', searching: 'surprised',
  planning: 'neutral', executing: 'angry', verifying: 'neutral',
  celebrating: 'happy', error: 'angry', evolving: 'surprised', offline: 'neutral',
};

const STATION_LIST: { key: AgentVisualState; pos: [number, number, number]; rot: number; label: string; color: string }[] = [
  { key: 'idle', pos: [0, 0, 0], rot: 0, label: 'CASA', color: '#6366f1' },
  { key: 'thinking', pos: [-3, 0, -2], rot: 0.5, label: 'BIBLIOTECA', color: '#06b6d4' },
  { key: 'searching', pos: [3, 0, -2], rot: -0.5, label: 'OBSERVATORIO', color: '#f97316' },
  { key: 'planning', pos: [0, 0, -3.5], rot: 0, label: 'MAPA', color: '#a855f7' },
  { key: 'executing', pos: [3.5, 0, 1.5], rot: -0.8, label: 'TALLER', color: '#ef4444' },
  { key: 'verifying', pos: [-3.5, 0, 1.5], rot: 0.8, label: 'LABORATORIO', color: '#22c55e' },
  { key: 'celebrating', pos: [0, 0, 3], rot: 0, label: 'PLAZA', color: '#eab308' },
  { key: 'error', pos: [0, 0, -0.5], rot: 0, label: '', color: '#dc2626' },
  { key: 'evolving', pos: [0, 0, 0], rot: 0, label: 'PORTAL', color: '#d946ef' },
  { key: 'offline', pos: [0, 0, 0], rot: 0, label: '', color: '#71717a' },
];

/* ═══════════════════════════════════════════════════════════════════════
   VRM LOADER — runs once, sets module-level activeVRM
   ═══════════════════════════════════════════════════════════════════════ */
function loadVRM(onLoad: () => void, onError: () => void) {
  if (vrmLoadAttempted) return;
  vrmLoadAttempted = true;
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  loader.load(
    '/models/avatar.vrm',
    (gltf) => {
      try {
        const vrm = gltf.userData.vrm as VRM;
        if (!vrm) { onError(); return; }
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        vrm.scene.rotation.y = Math.PI;
        vrm.scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        activeVRM = vrm;
        vrmLoadSuccess = true;
        onLoad();
      } catch { onError(); }
    },
    undefined,
    () => { vrmLoadError = true; onError(); }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WORLD ENVIRONMENT — ground, trees, rocks, mushrooms, lights
   ═══════════════════════════════════════════════════════════════════════ */
function World() {
  const gridRef = useMemo(() => new THREE.GridHelper(24, 36, '#1a3a2a', '#0d1f15'), []);
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.35} color="#b0c4de" />
      <directionalLight position={[5, 8, 4]} intensity={0.8} color="#ffe4c4" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={0.5} shadow-camera-far={30} shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={8} shadow-camera-bottom={-8} />
      <pointLight position={[-4, 3, -3]} intensity={0.4} color="#06b6d4" distance={10} />
      <pointLight position={[4, 3, 2]} intensity={0.3} color="#a855f7" distance={10} />
      <fog attach="fog" args={['#050a08', 8, 25]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[12, 48]} />
        <meshStandardMaterial color="#0a1a0f" roughness={0.9} metalness={0.1} />
      </mesh>
      <primitive object={gridRef} position={[0, 0.005, 0]} />

      {/* Stars */}
      <Stars radius={30} depth={40} count={1500} factor={3} saturation={0.3} fade speed={1} />

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

      {/* Station markers */}
      {STATION_LIST.filter(s => s.label).map((s) => (
        <group key={`station-${s.key}`} position={[s.pos[0], s.pos[1], s.pos[2]]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
            <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.4} transparent opacity={0.7} />
          </mesh>
          <Float speed={2} rotationIntensity={0} floatIntensity={0.15}>
            <mesh position={[0, 0.55, 0]}>
              <octahedronGeometry args={[0.08, 0]} />
              <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={1.2} />
            </mesh>
          </Float>
          <pointLight position={[0, 0.5, 0]} color={s.color} intensity={0.2} distance={2} />
          <Html position={[0, 0.85, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              color: s.color, fontSize: '9px', fontFamily: 'monospace', fontWeight: 700,
              whiteSpace: 'nowrap', textShadow: `0 0 8px ${s.color}`, letterSpacing: '1px', opacity: 0.8,
            }}>
              {s.label}
            </div>
          </Html>
        </group>
      ))}

      {/* Station-specific objects */}
      {/* BIBLIOTECA — bookshelf */}
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

      {/* OBSERVATORIO — telescope */}
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
}

/* ═══════════════════════════════════════════════════════════════════════
   CHIBI CHARACTER — cute humanoid fallback
   ═══════════════════════════════════════════════════════════════════════ */
function ChibiCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const blushRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  const agentState = useAgentLiveStore(s => s.agentState);
  const stateRef = useRef(agentState);
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const targetRot = useRef(0);
  const prevRot = useRef(0);
  const isMoving = useRef(false);

  useEffect(() => {
    stateRef.current = agentState;
  }, [agentState]);

  useEffect(() => {
    const station = STATIONS[agentState];
    if (station) {
      targetPos.set(station.pos[0], station.pos[1], station.pos[2]);
      targetRot.current = station.rot;
    }
  }, [agentState, targetPos]);

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    const g = groupRef.current;
    const b = bodyRef.current;
    const t = state.clock.elapsedTime;

    // Movement
    const dist = g.position.distanceTo(targetPos);
    isMoving.current = dist > 0.05;
    if (isMoving.current) {
      g.position.lerp(targetPos, delta * 2.5);
      // Face movement direction
      const dir = new THREE.Vector3().subVectors(targetPos, g.position);
      if (dir.length() > 0.01) {
        const angle = Math.atan2(dir.x, dir.z);
        prevRot.current = THREE.MathUtils.lerp(prevRot.current, angle + Math.PI, delta * 5);
        g.rotation.y = prevRot.current;
      }
    } else {
      // At station — face the target rotation
      const stationAngle = targetRot.current + Math.PI;
      prevRot.current = THREE.MathUtils.lerp(prevRot.current, stationAngle, delta * 2);
      g.rotation.y = prevRot.current;
    }

    // Walk animation
    const walkSpeed = 6;
    const walkAmp = isMoving.current ? 0.4 : 0;
    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmp;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp;
    if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp * 0.7;
    if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmp * 0.7;

    // Body bob while walking
    if (isMoving.current) {
      b.position.y = Math.abs(Math.sin(t * walkSpeed * 2)) * 0.03;
    } else {
      // Idle breathing
      b.position.y = Math.sin(t * 1.5) * 0.01;
      b.scale.y = 1 + Math.sin(t * 2) * 0.008;
    }

    // Head subtle movement
    if (headRef.current && !isMoving.current) {
      headRef.current.rotation.z = Math.sin(t * 0.7) * 0.03;
      headRef.current.rotation.x = Math.sin(t * 0.5) * 0.02;
    }

    // Eye tracking
    const mx = mousePosition.x * 0.02;
    const my = mousePosition.y * 0.015;
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.07 + mx;
      leftPupilRef.current.position.y = 0.72 + my;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.07 + mx;
      rightPupilRef.current.position.y = 0.72 + my;
    }

    // Blink (every 3-5s)
    const blinkCycle = t % (3 + Math.sin(t * 0.1) * 1);
    const isBlinking = blinkCycle > 3.8 && blinkCycle < 4.0;
    if (headRef.current) {
      const sy = isBlinking ? 0.1 : 1;
      headRef.current.scale.y = THREE.MathUtils.lerp(headRef.current.scale.y, sy, delta * 20);
    }

    // Blush on certain states
    if (blushRef.current) {
      const showBlush = stateRef.current === 'celebrating' || stateRef.current === 'thinking';
      blushRef.current.visible = showBlush;
    }

    // Mouth shape by state
    if (mouthRef.current) {
      const ms = mouthRef.current.scale;
      const st = stateRef.current;
      if (st === 'celebrating' || st === 'happy') {
        ms.x = THREE.MathUtils.lerp(ms.x, 1.2, delta * 5);
        ms.y = THREE.MathUtils.lerp(ms.y, 1.5, delta * 5);
      } else if (st === 'error') {
        ms.x = THREE.MathUtils.lerp(ms.x, 1.5, delta * 5);
        ms.y = THREE.MathUtils.lerp(ms.y, 0.5, delta * 5);
      } else if (st === 'thinking') {
        ms.x = THREE.MathUtils.lerp(ms.x, 0.8, delta * 5);
        ms.y = THREE.MathUtils.lerp(ms.y, 0.5, delta * 5);
      } else {
        ms.x = THREE.MathUtils.lerp(ms.x, 1, delta * 5);
        ms.y = THREE.MathUtils.lerp(ms.y, 0.8, delta * 5);
      }
    }

    // Update shared world position
    characterWorldPos.copy(g.position);
  });

  const bodyColor = STATE_COLORS[agentState];

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyRef}>
        {/* Head */}
        <group ref={headRef}>
          <mesh position={[0, 0.72, 0]} castShadow>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 0.82, -0.02]} castShadow>
            <sphereGeometry args={[0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#4A3728" roughness={0.8} />
          </mesh>
          {/* Hair bangs */}
          <mesh position={[0, 0.78, 0.12]} castShadow>
            <boxGeometry args={[0.35, 0.08, 0.08]} />
            <meshStandardMaterial color="#4A3728" roughness={0.8} />
          </mesh>
          {/* Left Eye white */}
          <mesh position={[-0.07, 0.73, 0.17]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Right Eye white */}
          <mesh position={[0.07, 0.73, 0.17]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Left Pupil */}
          <mesh ref={leftPupilRef} position={[-0.07, 0.73, 0.21]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          {/* Right Pupil */}
          <mesh ref={rightPupilRef} position={[0.07, 0.73, 0.21]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          {/* Blush */}
          <group ref={blushRef} visible={false}>
            <mesh position={[-0.14, 0.68, 0.14]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#ff9999" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0.14, 0.68, 0.14]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#ff9999" transparent opacity={0.4} />
            </mesh>
          </group>
          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, 0.64, 0.2]} scale={[1, 0.8, 0.3]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#cc6666" />
          </mesh>
        </group>

        {/* Body */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.26, 0.32, 0.16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        {/* Belt */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.27, 0.04, 0.17]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} />
        </mesh>
        {/* Scarf */}
        <mesh position={[0, 0.52, 0.04]} castShadow>
          <boxGeometry args={[0.2, 0.06, 0.1]} />
          <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.3} roughness={0.5} />
        </mesh>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.2, 0.48, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.24, 6]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.2, 0.48, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.24, 6]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#FFD5B8" roughness={0.7} />
          </mesh>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.07, 0.22, 0]}>
          <mesh position={[0, -0.11, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.22, 6]} />
            <meshStandardMaterial color="#37474F" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.23, 0.02]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
            <meshStandardMaterial color="#5D4037" roughness={0.8} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.07, 0.22, 0]}>
          <mesh position={[0, -0.11, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.22, 6]} />
            <meshStandardMaterial color="#37474F" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.23, 0.02]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
            <meshStandardMaterial color="#5D4037" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Ground aura */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.2, 0.45, 24]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.6} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   VRM CHARACTER — real VRM model with expressions and movement
   ═══════════════════════════════════════════════════════════════════════ */
function VRMCharacter() {
  const vrmRef = useRef<THREE.Group>(null);
  const agentState = useAgentLiveStore(s => s.agentState);
  const stateRef = useRef(agentState);
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const targetRot = useRef(0);
  const blinkTimer = useRef(0);
  const nextBlink = useRef(3 + Math.random() * 2);

  useEffect(() => {
    stateRef.current = agentState;
  }, [agentState]);

  useEffect(() => {
    const station = STATIONS[agentState];
    if (station) {
      targetPos.set(station.pos[0], station.pos[1], station.pos[2]);
      targetRot.current = station.rot;
    }
  }, [agentState, targetPos]);

  // Load VRM on mount
  useEffect(() => {
    loadVRM(
      () => { /* vrmLoadSuccess is set by loadVRM */ },
      () => { /* vrmLoadError is set by loadVRM */ }
    );
  }, []);

  useFrame((state, delta) => {
    if (!activeVRM) return;
    const t = state.clock.elapsedTime;

    // Update VRM systems
    activeVRM.update(delta);

    // Move towards target
    const vrmScene = activeVRM.scene;
    const dist = vrmScene.position.distanceTo(targetPos);
    if (dist > 0.05) {
      vrmScene.position.lerp(targetPos, delta * 2.5);
    }

    // Rotation
    const stationAngle = targetRot.current + Math.PI;
    vrmScene.rotation.y = THREE.MathUtils.lerp(vrmScene.rotation.y, stationAngle, delta * 2);

    // Expressions
    const exprName = STATE_VRM_EXPRESSION[stateRef.current] || 'neutral';
    // Reset all main expressions, then set current
    const mainExprs = ['happy', 'angry', 'surprised', 'relaxed', 'sad', 'neutral'];
    for (const name of mainExprs) {
      const w = name === exprName ? 1.0 : 0.0;
      activeVRM.expressionManager?.setValue(name as never, w);
    }

    // Auto blink
    blinkTimer.current += delta;
    if (blinkTimer.current > nextBlink.current) {
      activeVRM.expressionManager?.setValue('blink' as never, 1.0);
      setTimeout(() => {
        activeVRM?.expressionManager?.setValue('blink' as never, 0.0);
      }, 150);
      blinkTimer.current = 0;
      nextBlink.current = 3 + Math.random() * 2;
    }

    // Eye tracking — look at mouse
    vrmLookAtTarget.position.set(
      vrmScene.position.x + mousePosition.x * 3,
      vrmScene.position.y + 1.2 + mousePosition.y * 0.5,
      vrmScene.position.z + 2
    );
    if (activeVRM.lookAt) {
      activeVRM.lookAt.target = vrmLookAtTarget;
    }

    // Update shared world position
    characterWorldPos.copy(vrmScene.position);
  });

  if (!vrmLoadSuccess || vrmLoadError || !activeVRM) return null;

  return <primitive ref={vrmRef} object={activeVRM.scene} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   CHARACTER BRIDGE — shows VRM or Chibi, handles switching
   ═══════════════════════════════════════════════════════════════════════ */
function CharacterBridge() {
  const [vrmReady, setVrmReady] = useState(false);
  const agentState = useAgentLiveStore(s => s.agentState);
  const message = useAgentLiveStore(s => s.message);
  const stateColor = STATE_COLORS[agentState];

  useEffect(() => {
    // Poll for VRM load completion
    const interval = setInterval(() => {
      if (vrmLoadSuccess && !vrmLoadError) {
        setVrmReady(true);
        clearInterval(interval);
      }
      if (vrmLoadError) {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const showChat = message && message !== 'Esperando actividad...';

  return (
    <group>
      {vrmReady ? <VRMCharacter /> : <ChibiCharacter />}

      {/* Chat bubble in 3D space */}
      {showChat && (
        <Html position={[characterWorldPos.x, 1.6, characterWorldPos.z]} center
          distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.85)', color: '#e4e4e7', padding: '5px 12px',
            borderRadius: '14px', fontSize: '11px', fontFamily: 'system-ui, sans-serif',
            maxWidth: '180px', textAlign: 'center', lineHeight: 1.4,
            border: `1px solid ${stateColor}33`, backdropFilter: 'blur(6px)',
            boxShadow: `0 0 20px ${stateColor}22`,
          }}>
            <div style={{
              width: 0, height: 0, borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent', borderTop: `6px solid rgba(0,0,0,0.85)`,
              margin: '0 auto', marginTop: '4px',
            }} />
            {message}
          </div>
        </Html>
      )}

      {/* Ground glow at character feet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[characterWorldPos.x, 0.008, characterWorldPos.z]}>
        <ringGeometry args={[0.15, 0.5, 24]} />
        <meshStandardMaterial
          color={stateColor} emissive={stateColor} emissiveIntensity={0.8}
          transparent opacity={0.2} side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CAMERA CONTROLLER — smooth third-person follow
   ═══════════════════════════════════════════════════════════════════════ */
function CameraController() {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0.8, 0), []);

  useFrame((_, delta) => {
    // Target: character position + offset up
    const lookTarget = new THREE.Vector3(
      characterWorldPos.x,
      0.8,
      characterWorldPos.z
    );
    target.lerp(lookTarget, delta * 2);

    // Camera position: offset behind and above
    const camPos = new THREE.Vector3(
      characterWorldPos.x * 0.3,
      3.5,
      characterWorldPos.z + 5.5
    );
    camera.position.lerp(camPos, delta * 1.5);
    camera.lookAt(target);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════
   STATE-REACTIVE LIGHT — color changes with agent state
   ═══════════════════════════════════════════════════════════════════════ */
function StateLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const agentState = useAgentLiveStore(s => s.agentState);
  const color = STATE_COLORS[agentState];

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.color.set(color);
      lightRef.current.position.set(characterWorldPos.x, 1.5, characterWorldPos.z);
    }
  });

  return <pointLight ref={lightRef} intensity={0.4} distance={4} color={color} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING PARTICLES — ambient atmosphere
   ═══════════════════════════════════════════════════════════════════════ */
function FloatingParticles() {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 3 + 0.3, (Math.random() - 0.5) * 12),
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.03,
    })), []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      dummy.position.set(
        p.pos.x + Math.sin(t * p.speed + p.offset) * 0.3,
        p.pos.y + Math.sin(t * p.speed * 0.7 + p.offset) * 0.4,
        p.pos.z + Math.cos(t * p.speed + p.offset) * 0.3
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#a5f3fc" emissive="#a5f3fc" emissiveIntensity={0.8} transparent opacity={0.6} />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LOADING INDICATOR — shown while VRM loads
   ═══════════════════════════════════════════════════════════════════════ */
function LoadingIndicator() {
  if (vrmLoadSuccess || vrmLoadError) return null;
  return (
    <Html center position={[0, 0.1, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{ color: '#6ee7b7', fontSize: '10px', fontFamily: 'monospace', textAlign: 'center' }}>
        <div style={{
          width: 24, height: 24, margin: '0 auto 6px', borderRadius: '50%',
          border: '2px solid #065f4644', borderTopColor: '#6ee7b7', animation: 'spin 1s linear infinite',
        }} />
        Cargando personaje VRM...
      </div>
    </Html>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT — Agent3DSandbox
   ═══════════════════════════════════════════════════════════════════════ */
export function Agent3DSandbox() {
  const agentState = useAgentLiveStore(s => s.agentState);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mousePosition.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, []);

  return (
    <div className="w-full aspect-square max-w-[560px] mx-auto rounded-2xl overflow-hidden relative"
      onPointerMove={handlePointerMove}>
      <Canvas
        shadows
        camera={{ position: [0, 3.5, 5.5], fov: 42 }}
        style={{ background: '#050a08' }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <World />
          <CharacterBridge />
          <StateLight />
          <FloatingParticles />
          <CameraController />
          <LoadingIndicator />
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.6}
              luminanceSmoothing={0.9}
              intensity={0.8}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
      {/* Spin keyframe for loading indicator */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}