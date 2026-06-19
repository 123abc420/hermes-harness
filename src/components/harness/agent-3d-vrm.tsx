'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import { mousePosition, vrmLoadingState, activeVRM } from './agent-3d-shared';
import { STATIONS } from './agent-3d-chibi';
import * as THREE from 'three';

const STATE_EXPRESSIONS: Record<AgentVisualState, Record<string, number>> = {
  idle: { neutral: 1.0, blink: 0 }, thinking: { neutral: 0.4, blink: 0 },
  searching: { neutral: 0.5, blink: 0 }, planning: { neutral: 0.5, blink: 0 },
  executing: { neutral: 0.2, blink: 0 }, verifying: { happy: 0.8, neutral: 0.2, blink: 0 },
  celebrating: { happy: 1.0, blink: 0 }, error: { angry: 1.0, blink: 0 },
  evolving: { surprised: 0.7, neutral: 0.3, blink: 0 }, offline: { neutral: 1.0, blink: 0 },
};

export function VRMCharacter({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { agentState, message } = useAgentLiveStore();
  const { scene } = useThree();
  const move = useRef({ currentPos: new THREE.Vector3(0, 0, 0), targetPos: new THREE.Vector3(0, 0, 0), currentRot: 0, targetRot: 0, isWalking: false, walkCycle: 0 });
  const blinkTimer = useRef(2 + Math.random() * 3);
  const isBlinking = useRef(false);
  const bubbleRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load('/models/avatar.vrm', (gltf) => {
      const vrm = gltf.userData.vrm;
      if (!vrm) { vrmLoadingState.setLoaded(true); return; }
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.removeUnnecessaryJoints(gltf.scene);
      vrm.scene.rotation.y = Math.PI;
      if (groupRef.current) groupRef.current.add(vrm.scene);
      if (vrm.expressionManager) vrm.expressionManager.expressions.forEach((e) => { activeVRM.exprWeights[e.expressionName] = 0; });
      activeVRM.vrm = vrm;
      vrmLoadingState.setLoaded(true);
    }, undefined, () => { vrmLoadingState.setLoaded(true); });
    return () => {
      if (activeVRM.vrm) { activeVRM.vrm.scene.traverse((c) => { if ((c as THREE.Mesh).isMesh) { const m = c as THREE.Mesh; m.geometry.dispose(); const mt = m.material; if (Array.isArray(mt)) mt.forEach(x => x.dispose()); else if (mt) mt.dispose(); } }); activeVRM.vrm = null; }
    };
  }, [scene]);

  useFrame((state, delta) => {
    const vrm = activeVRM.vrm as any;
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);
    const ms = move.current;
    const station = STATIONS[agentState];
    ms.targetPos.set(station.pos[0], 0, station.pos[2]);
    ms.targetRot = station.rot;
    ms.isWalking = ms.currentPos.distanceTo(ms.targetPos) > 0.08;
    if (ms.isWalking) { const dir = new THREE.Vector3().subVectors(ms.targetPos, ms.currentPos); dir.y = 0; if (dir.length() > 0.01) { dir.normalize(); ms.currentPos.add(dir.multiplyScalar(1.8 * d)); } ms.currentRot += (ms.targetRot - ms.currentRot) * d * 4; ms.walkCycle += d * 8; } else { ms.walkCycle *= 0.9; }
    if (groupRef.current) { groupRef.current.position.set(ms.currentPos.x, ms.isWalking ? Math.abs(Math.sin(ms.walkCycle)) * 0.04 : Math.sin(t * 2) * 0.015, ms.currentPos.z); groupRef.current.rotation.y = ms.currentRot; }
    if (!vrm) return;
    if (vrm.expressionManager) {
      const targets = { ...STATE_EXPRESSIONS[agentState] };
      blinkTimer.current -= d;
      if (blinkTimer.current <= 0 && !isBlinking.current) { if (Math.random() < 0.015) { isBlinking.current = true; blinkTimer.current = 0.12; } }
      if (isBlinking.current && blinkTimer.current <= 0) { isBlinking.current = false; blinkTimer.current = 2.5 + Math.random() * 3.5; }
      targets.blink = isBlinking.current ? 1.0 : 0;
      for (const expr of vrm.expressionManager.expressions) { const n = expr.expressionName; const tgt = targets[n] ?? 0; const cur = activeVRM.exprWeights[n] ?? 0; const w = cur + (tgt - cur) * Math.min(d * 4, 1); activeVRM.exprWeights[n] = w; if (Math.abs(w - (expr.currentWeight ?? 0)) > 0.001) expr.weight = w; }
    }
    if (vrm.lookAt) { vrm.lookAt.target.position.set(mousePosition.x * 0.6 + Math.sin(t * 0.3) * 0.15, mousePosition.y * 0.4 + Math.sin(t * 0.5 + 1) * 0.1 + 1.2, 3); vrm.lookAt.update(d); }
    if (vrm.springBoneManager) vrm.springBoneManager.update(d);
    vrm.update(d);
    if (bubbleRef.current) { const s = (message && message !== 'Esperando actividad...' && message.length > 0) ? 1 : 0; bubbleRef.current.scale.lerp(new THREE.Vector3(s, s, s), d * 5); bubbleRef.current.position.y = 1.6 + Math.sin(t * 1.5) * 0.03; bubbleRef.current.quaternion.copy(state.camera.quaternion); }
  });

  if (!visible) return null;
  return (
    <group ref={groupRef}>
      <group ref={bubbleRef} position={[0, 1.6, 1]} scale={[0, 0, 0]}>
        <mesh><planeGeometry args={[2, 0.55]} /><meshBasicMaterial color="#1c1917" transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, -0.01]}><planeGeometry args={[2.05, 0.6]} /><meshBasicMaterial color="#f59e0b" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 4]}><planeGeometry args={[0.2, 0.2]} /><meshBasicMaterial color="#1c1917" transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.1} color="#fef3c7" anchorX="center" anchorY="middle" maxWidth={1.8} font={undefined}>{message && message !== 'Esperando actividad...' ? message.slice(0, 45) : ''}</Text>
      </group>
    </group>
  );
}