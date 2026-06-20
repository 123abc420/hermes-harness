'use client';

import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAgentLiveStore } from '@/store/agent-live-store';
import {
  STATION_COLORS as STATE_COLORS, vrmState,
  characterWorldPos, arrivalFlash,
} from './agent-3d-shared';
import { ChibiCharacter } from './agent-3d-chibi';
import { VRMCharacter, loadVRM } from './agent-3d-vrm';

/* ═══════════════════════════════════════════════════════════════════════
   ARRIVAL FLASH — brief glow when character arrives at station
   ═══════════════════════════════════════════════════════════════════════ */
export const ArrivalFlashLight = memo(function ArrivalFlashLight() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.intensity = arrivalFlash.intensity;
      lightRef.current.color.set(arrivalFlash.color);
      lightRef.current.position.set(characterWorldPos.x, 0.5, characterWorldPos.z);
    }
  });

  return <pointLight ref={lightRef} intensity={0} distance={3} color="#6366f1" />;
});

/* ═══════════════════════════════════════════════════════════════════════
   CHARACTER BRIDGE — shows VRM or Chibi, handles switching
   ═══════════════════════════════════════════════════════════════════════ */
/* Character group — subscribes to agentState only (NOT message) */
export function CharacterGroup() {
  const [vrmReady, setVrmReady] = useState(false);
  const agentState = useAgentLiveStore(s => s.agentState);
  const stateColor = STATE_COLORS[agentState];

  // Start VRM loading in background (non-blocking: Chibi shows immediately)
  useEffect(() => {
    // Use setTimeout(0) to ensure loadVRM starts AFTER the first render
    // so the Chibi character is visible immediately
    const startTimer = setTimeout(() => {
      loadVRM(
        () => { /* vrmState.loadSuccess is set by loadVRM */ },
        () => { /* vrmState.loadError is set by loadVRM */ }
      );
    }, 100);

    return () => clearTimeout(startTimer);
  }, []);

  // Poll for VRM load completion (switch from Chibi to VRM when ready)
  useEffect(() => {
    const interval = setInterval(() => {
      if (vrmState.loadSuccess && !vrmState.loadError) {
        setVrmReady(true);
        clearInterval(interval);
      }
      if (vrmState.loadError) {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {vrmReady ? <VRMCharacter /> : <ChibiCharacter />}
      <ArrivalFlashLight />
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

/* Chat bubble — subscribes to message only, isolated from character re-renders */
export const ChatBubble = memo(function ChatBubble() {
  const message = useAgentLiveStore(s => s.message);
  const agentState = useAgentLiveStore(s => s.agentState);
  const stateColor = STATE_COLORS[agentState];
  const showChat = message && message !== 'Waiting for activity...';

  if (!showChat) return null;

  return (
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
  );
});

/* Bridge — renders both as siblings so message changes don't cascade into character */
export function CharacterBridge() {
  return (
    <group>
      <CharacterGroup />
      <ChatBubble />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CAMERA CONTROLLER — smooth third-person follow
   ═══════════════════════════════════════════════════════════════════════ */
export const CameraController = memo(function CameraController() {
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
});

/* ═══════════════════════════════════════════════════════════════════════
   STATE-REACTIVE LIGHT — color changes with agent state
   ═══════════════════════════════════════════════════════════════════════ */
export function StateLight() {
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
export const FloatingParticles = memo(function FloatingParticles() {
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
});

/* ═══════════════════════════════════════════════════════════════════════
   LOADING INDICATOR — shown while VRM loads
   ═══════════════════════════════════════════════════════════════════════ */
export function LoadingIndicator() {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const e = Math.floor((Date.now() - start) / 1000);
      setElapsed(e);
      if (vrmState.loadSuccess || vrmState.loadError) {
        clearInterval(tick);
        setDone(true);
      }
    }, 500);
    return () => clearInterval(tick);
  }, []);

  if (done || vrmState.loadSuccess || vrmState.loadError) return null;

  const hint = elapsed > 15
    ? 'VRM is taking long, falling back soon...'
    : elapsed > 5
      ? 'Loading character model...'
      : 'Loading VRM character...';

  return (
    <Html center position={[0, 0.1, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{ color: '#6ee7b7', fontSize: '10px', fontFamily: 'monospace', textAlign: 'center' }}>
        <div style={{
          width: 24, height: 24, margin: '0 auto 6px', borderRadius: '50%',
          border: '2px solid #065f4644', borderTopColor: '#6ee7b7', animation: 'spin 1s linear infinite',
        }} />
        {hint}
        <div style={{ color: '#4a5568', fontSize: '8px', marginTop: '2px' }}>{elapsed}s</div>
      </div>
    </Html>
  );
}