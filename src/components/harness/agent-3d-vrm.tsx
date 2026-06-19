'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';
import { useAgentLiveStore, type AgentVisualState } from '@/store/agent-live-store';
import { mousePosition, vrmLoadingState } from './agent-3d-shared';
import * as THREE from 'three';

const STATE_TO_WEIGHTS: Record<AgentVisualState, Record<string, number>> = {
  idle:       { neutral: 1.0, blink: 0 },
  thinking:   { neutral: 0.5, blink: 0 },
  searching:  { neutral: 0.6, blink: 0 },
  planning:   { neutral: 0.7, blink: 0 },
  executing:  { neutral: 0.3, blink: 0 },
  verifying:  { happy: 0.8, neutral: 0.2, blink: 0 },
  celebrating:{ happy: 1.0, blink: 0 },
  error:      { angry: 1.0, blink: 0 },
  evolving:   { surprised: 0.7, neutral: 0.3, blink: 0 },
  offline:    { neutral: 1.0, blink: 0 },
};

export function Agent3DVRM() {
  const groupRef = useRef<THREE.Group>(null);
  const vrmRef = useRef<VRM | null>(null);
  const { agentState } = useAgentLiveStore();
  const { scene } = useThree();
  const blinkTimer = useRef(3);
  const isBlinking = useRef(false);
  const currentWeights = useRef<Record<string, number>>({});

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      '/models/avatar.vrm',
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;
        if (!vrm) {
          console.warn('[VRM] No VRM data in file, using fallback');
          vrmLoadingState.setLoaded(true);
          return;
        }

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        vrm.scene.rotation.y = Math.PI;
        vrm.scene.scale.setScalar(1.0);
        vrm.scene.position.y = -1.2;

        if (groupRef.current) {
          groupRef.current.add(vrm.scene);
        }

        vrmRef.current = vrm;

        if (vrm.expressionManager) {
          vrm.expressionManager.expressions.forEach((expr) => {
            currentWeights.current[expr.expressionName] = 0;
          });
        }

        vrmLoadingState.setLoaded(true);
        console.log('[VRM] Avatar loaded successfully');
      },
      undefined,
      (err) => {
        console.warn('[VRM] Load failed, using fallback:', err);
        vrmLoadingState.setLoaded(true);
      },
    );

    return () => {
      if (vrmRef.current) {
        vrmRef.current.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            const mat = mesh.material;
            if (Array.isArray(mat)) {
              mat.forEach((m) => m.dispose());
            } else if (mat) {
              mat.dispose();
            }
          }
        });
      }
    };
  }, [scene]);

  useFrame((_state, delta) => {
    const vrm = vrmRef.current;
    if (!vrm) return;

    const t = _state.clock.elapsedTime;

    if (vrm.expressionManager) {
      const targetWeights = STATE_TO_WEIGHTS[agentState] || { neutral: 1.0 };

      blinkTimer.current -= delta;
      if (blinkTimer.current <= 0 && !isBlinking.current) {
        if (Math.random() < 0.015) {
          isBlinking.current = true;
          blinkTimer.current = 0.12;
        }
      }
      if (isBlinking.current && blinkTimer.current <= 0) {
        isBlinking.current = false;
        blinkTimer.current = 2.5 + Math.random() * 3.5;
      }
      targetWeights.blink = isBlinking.current ? 1.0 : 0;

      for (const expr of vrm.expressionManager.expressions) {
        const name = expr.expressionName;
        const target = targetWeights[name] ?? 0;
        const current = currentWeights.current[name] ?? 0;
        const newWeight = current + (target - current) * Math.min(delta * 4, 1);
        currentWeights.current[name] = newWeight;
        if (Math.abs(newWeight - (expr.currentWeight ?? 0)) > 0.001) {
          expr.weight = newWeight;
        }
      }
    }

    if (vrm.lookAt) {
      const idleX = Math.sin(t * 0.3) * 0.15;
      const idleY = Math.sin(t * 0.5 + 1) * 0.1;
      vrm.lookAt.target.position.set(
        mousePosition.x * 0.8 + idleX,
        mousePosition.y * 0.6 + idleY + 1.0,
        3,
      );
      vrm.lookAt.update(delta);
    }

    if (vrm.springBoneManager) {
      vrm.springBoneManager.update(delta);
    }

    vrm.update(delta);
  });

  return <group ref={groupRef} />;
}