'use client';

import React, { useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { mousePosition } from './agent-3d-shared';
import { World } from './agent-3d-world';
import { CharacterBridge, StateLight, FloatingParticles, CameraController } from './agent-3d-scene';

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT — Agent3DSandbox
   Thin orchestrator: composes scene modules inside a Canvas.
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
    </div>
  );
}