'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import type { VRM } from '@pixiv/three-vrm';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import {
  STATIONS, mousePosition, vrmState, vrmLookAtTarget, characterWorldPos,
} from './agent-3d-shared';

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */
export const STATE_VRM_EXPRESSION: Record<AgentVisualState, string> = {
  idle: 'relaxed', thinking: 'neutral', searching: 'surprised',
  planning: 'neutral', executing: 'angry', verifying: 'neutral',
  celebrating: 'happy', error: 'angry', evolving: 'surprised', offline: 'neutral',
};

/* ═══════════════════════════════════════════════════════════════════════
   VRM LOADER — runs once, sets shared vrmState.activeVRM
   ═══════════════════════════════════════════════════════════════════════ */
export function loadVRM(onLoad: () => void, onError: () => void) {
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
export function VRMCharacter() {
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