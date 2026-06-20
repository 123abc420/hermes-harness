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
const VRM_LOAD_TIMEOUT_MS = 15_000;

export function loadVRM(onLoad: () => void, onError: () => void) {
  if (vrmState.loadAttempted) return;
  vrmState.loadAttempted = true;

  // Timeout: if VRM doesn't load within 15s, force fallback to Chibi
  const timeoutId = setTimeout(() => {
    if (!vrmState.loadSuccess && !vrmState.loadError) {
      vrmState.loadError = true;
      onError();
    }
  }, VRM_LOAD_TIMEOUT_MS);

  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  loader.load(
    '/models/avatar.vrm',
    (gltf) => {
      if (vrmState.loadSuccess || vrmState.loadError) return; // already resolved by timeout
      clearTimeout(timeoutId);

      try {
        const vrm = gltf.userData.vrm as VRM;
        if (!vrm) {
          vrmState.loadError = true;
          onError();
          return;
        }

        // Defer heavy VRM processing off the main thread via microtask
        // This prevents blocking the UI while processing the 10MB model
        queueMicrotask(() => {
          try {
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.removeUnnecessaryJoints(gltf.scene);
          } catch {
            // Non-critical optimization — continue even if it fails
          }

          // VRM models face -Z by default. Camera is at +Z.
          // Rotate PI so the face points toward the camera.
          vrm.scene.rotation.y = Math.PI;
          // Immediately set arm bones to relaxed pose (avoid T-pose flash)
          const h = vrm.humanoid;
          if (h) {
            const lu = h.getNormalizedBoneNode('leftUpperArm');
            const ru = h.getNormalizedBoneNode('rightUpperArm');
            const ll = h.getNormalizedBoneNode('leftLowerArm');
            const rl = h.getNormalizedBoneNode('rightLowerArm');
            if (lu) { lu.rotation.z = 0.15; lu.rotation.x = 0.3; }
            if (ru) { ru.rotation.z = -0.15; ru.rotation.x = 0.3; }
            if (ll) ll.rotation.x = -0.4;
            if (rl) rl.rotation.x = -0.4;
          }
          vrm.scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });
          vrmState.activeVRM = vrm;
          vrmState.loadSuccess = true;
          onLoad();
        });
      } catch {
        vrmState.loadError = true;
        onError();
      }
    },
    undefined,
    () => {
      clearTimeout(timeoutId);
      vrmState.loadError = true;
      onError();
    }
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
  const initialized = useRef(false);

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

  const isMovingVrm = useRef(false);

  useFrame((state, delta) => {
    const vrm = vrmState.activeVRM;
    if (!vrm) return;
    const t = state.clock.elapsedTime;

    // Move towards target FIRST (before vrm.update so position is correct)
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
      // Snap rotation on first frame to avoid gradual turn from wrong direction
      if (!initialized.current) {
        vrmScene.rotation.y = stationAngle;
        initialized.current = true;
      } else {
        vrmScene.rotation.y = THREE.MathUtils.lerp(vrmScene.rotation.y, stationAngle, delta * 2);
      }
    }

    // Apply manual bone poses BEFORE vrm.update so VRM systems layer on top
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

      // Arms: swing when walking, relax at sides when idle
      const leftArm = humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightArm = humanoid.getNormalizedBoneNode('rightUpperArm');
      const leftLowerArm = humanoid.getNormalizedBoneNode('leftLowerArm');
      const rightLowerArm = humanoid.getNormalizedBoneNode('rightLowerArm');
      if (isMovingVrm.current) {
        // Walk: arms swing opposite to legs
        if (leftArm) leftArm.rotation.x = Math.sin(t * walkSpeed + Math.PI) * walkAmp * 0.35;
        if (rightArm) rightArm.rotation.x = Math.sin(t * walkSpeed) * walkAmp * 0.35;
        if (leftLowerArm) leftLowerArm.rotation.x = 0;
        if (rightLowerArm) rightLowerArm.rotation.x = 0;
      } else {
        // Idle: relax arms at sides (exit T-pose) — fast lerp to avoid visible T-pose
        const armLerp = Math.min(delta * 10, 0.5);
        // Upper arms hang down slightly forward
        if (leftArm) leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0.15, armLerp);
        if (rightArm) rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.15, armLerp);
        if (leftArm) leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0.3, armLerp);
        if (rightArm) rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.3, armLerp);
        // Lower arms bend slightly (natural resting position)
        if (leftLowerArm) leftLowerArm.rotation.x = THREE.MathUtils.lerp(leftLowerArm.rotation.x, -0.4, armLerp);
        if (rightLowerArm) rightLowerArm.rotation.x = THREE.MathUtils.lerp(rightLowerArm.rotation.x, -0.4, armLerp);
        // Subtle idle sway
        if (leftArm) leftArm.rotation.z += Math.sin(t * 0.8) * 0.02;
        if (rightArm) rightArm.rotation.z += Math.sin(t * 0.8 + 1) * 0.02;
      }

      // Idle breathing when not moving
      if (!isMovingVrm.current) {
        const spine = humanoid.getNormalizedBoneNode('spine');
        if (spine) spine.rotation.x = Math.sin(t * 1.5) * 0.01;
      }
    }

    // Update VRM systems (expressions, lookAt, spring bones) AFTER manual bone poses
    vrm.update(delta);

    // Re-apply idle arm poses AFTER vrm.update to override spring bone T-pose reset
    if (humanoid && !isMovingVrm.current) {
      const la = humanoid.getNormalizedBoneNode('leftUpperArm');
      const ra = humanoid.getNormalizedBoneNode('rightUpperArm');
      const ll = humanoid.getNormalizedBoneNode('leftLowerArm');
      const rl = humanoid.getNormalizedBoneNode('rightLowerArm');
      if (la) { la.rotation.z = 0.15; la.rotation.x = 0.3; }
      if (ra) { ra.rotation.z = -0.15; ra.rotation.x = 0.3; }
      if (ll) ll.rotation.x = -0.4;
      if (rl) rl.rotation.x = -0.4;
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