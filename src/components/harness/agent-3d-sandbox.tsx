'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback, Suspense, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import type { VRM } from '@pixiv/three-vrm';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import {
  STATIONS, STATION_COLORS as STATE_COLORS, mousePosition,
  vrmState, vrmLookAtTarget, characterWorldPos, arrivalFlash,
} from './agent-3d-shared';
import { World } from './agent-3d-world';
import { ChibiCharacter } from './agent-3d-chibi';

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */
const STATE_VRM_EXPRESSION: Record<AgentVisualState, string> = {
  idle: 'relaxed', thinking: 'neutral', searching: 'surprised',
  planning: 'neutral', executing: 'angry', verifying: 'neutral',
  celebrating: 'happy', error: 'angry', evolving: 'surprised', offline: 'neutral',
};

/* ═══════════════════════════════════════════════════════════════════════
   VRM LOADER — runs once, sets shared vrmState.activeVRM
   ═══════════════════════════════════════════════════════════════════════ */
function loadVRM(onLoad: () => void, onError: () => void) {
  if (vrmState.loadAttempted) return;
  vrmState.loadAttempted = true;
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
        vrmState.activeVRM = vrm;
        vrmState.loadSuccess = true;
        onLoad();
      } catch { onError(); }
    },
    undefined,
    () => { vrmState.loadError = true; onError(); }
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
      () => { /* vrmState.loadSuccess is set by loadVRM */ },
      () => { /* vrmState.loadError is set by loadVRM */ }
    );
  }, []);

  const isMovingVrm = useRef(false);

  useFrame((state, delta) => {
    const vrm = vrmState.activeVRM;
    if (!vrm) return;
    const t = state.clock.elapsedTime;

    // Update VRM systems
    vrm.update(delta);

    // Move towards target
    const vrmScene = vrm.scene;
    const dist = vrmScene.position.distanceTo(targetPos);
    isMovingVrm.current = dist > 0.05;
    if (isMovingVrm.current) {
      vrmScene.position.lerp(targetPos, delta * 2.5);
    }

    // Face movement direction while walking
    if (isMovingVrm.current) {
      const dir = new THREE.Vector3().subVectors(targetPos, vrmScene.position);
      if (dir.length() > 0.01) {
        const angle = Math.atan2(dir.x, dir.z) + Math.PI;
        vrmScene.rotation.y = THREE.MathUtils.lerp(vrmScene.rotation.y, angle, delta * 5);
      }
    } else {
      // At station — face the target rotation
      const stationAngle = targetRot.current + Math.PI;
      vrmScene.rotation.y = THREE.MathUtils.lerp(vrmScene.rotation.y, stationAngle, delta * 2);
    }

    // Walk animation via VRM bones
    const humanoid = vrm.humanoid;
    if (humanoid) {
      const walkSpeed = 6;
      const walkAmp = isMovingVrm.current ? 0.5 : 0;

      // Legs swing
      const leftLeg = humanoid.getNormalizedBoneNode('leftLowerLeg');
      const rightLeg = humanoid.getNormalizedBoneNode('rightLowerLeg');
      const leftUpperLeg = humanoid.getNormalizedBoneNode('leftUpperLeg');
      const rightUpperLeg = humanoid.getNormalizedBoneNode('rightUpperLeg');
      if (leftLeg) leftLeg.rotation.x = Math.sin(t * walkSpeed) * walkAmp * 0.6;
      if (rightLeg) rightLeg.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp * 0.6;
      if (leftUpperLeg) leftUpperLeg.rotation.x = Math.sin(t * walkSpeed) * walkAmp * 0.4;
      if (rightUpperLeg) rightUpperLeg.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp * 0.4;

      // Arms swing opposite to legs
      const leftArm = humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightArm = humanoid.getNormalizedBoneNode('rightUpperArm');
      if (leftArm) leftArm.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp * 0.35;
      if (rightArm) rightArm.rotation.x = Math.sin(t * walkSpeed) * walkAmp * 0.35;

      // Idle breathing when not moving
      if (!isMovingVrm.current) {
        const spine = humanoid.getNormalizedBoneNode('spine');
        if (spine) spine.rotation.x = Math.sin(t * 1.5) * 0.01;
      }
    }

    // Expressions
    const exprName = STATE_VRM_EXPRESSION[stateRef.current] || 'neutral';
    const mainExprs = ['happy', 'angry', 'surprised', 'relaxed', 'sad', 'neutral'];
    for (const name of mainExprs) {
      const w = name === exprName ? 1.0 : 0.0;
      vrm.expressionManager?.setValue(name as never, w);
    }

    // Auto blink
    blinkTimer.current += delta;
    if (blinkTimer.current > nextBlink.current) {
      vrm.expressionManager?.setValue('blink' as never, 1.0);
      setTimeout(() => {
        vrm?.expressionManager?.setValue('blink' as never, 0.0);
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
    if (vrm.lookAt) {
      vrm.lookAt.target = vrmLookAtTarget;
    }

    // Update shared world position
    characterWorldPos.copy(vrmScene.position);
  });

  if (!vrmState.loadSuccess || vrmState.loadError || !vrmState.activeVRM) return null;

  return <primitive ref={vrmRef} object={vrmState.activeVRM.scene} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   ARRIVAL FLASH — brief glow when character arrives at station
   ═══════════════════════════════════════════════════════════════════════ */
const ArrivalFlashLight = memo(function ArrivalFlashLight() {
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
function CharacterGroup() {
  const [vrmReady, setVrmReady] = useState(false);
  const agentState = useAgentLiveStore(s => s.agentState);
  const stateColor = STATE_COLORS[agentState];

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
const ChatBubble = memo(function ChatBubble() {
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
function CharacterBridge() {
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
const CameraController = memo(function CameraController() {
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
const FloatingParticles = memo(function FloatingParticles() {
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
function LoadingIndicator() {
  if (vrmState.loadSuccess || vrmState.loadError) return null;
  return (
    <Html center position={[0, 0.1, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{ color: '#6ee7b7', fontSize: '10px', fontFamily: 'monospace', textAlign: 'center' }}>
        <div style={{
          width: 24, height: 24, margin: '0 auto 6px', borderRadius: '50%',
          border: '2px solid #065f4644', borderTopColor: '#6ee7b7', animation: 'spin 1s linear infinite',
        }} />
        Loading VRM character...
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