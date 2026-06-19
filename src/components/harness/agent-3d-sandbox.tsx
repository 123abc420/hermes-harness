'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Agent3DCharacter } from './agent-3d-character';
import { Agent3DWorld } from './agent-3d-world';
import { useAgentLiveStore } from '@/store/agent-live-store';
import * as THREE from 'three';

// ─── Shared mouse position (mutable, read inside useFrame only) ──────
export const mousePosition = { x: 0, y: 0 };

// ─── Mouse position tracker for eye tracking ───────────────────────────
function MouseTracker() {
  const { gl } = useThree();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosition.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    gl.domElement.addEventListener('mousemove', handler);
    return () => gl.domElement.removeEventListener('mousemove', handler);
  }, [gl]);

  return null;
}

// ─── Loading fallback ──────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#050a0e]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-b-emerald-400/50 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">Cargando sandbox 3D...</span>
      </div>
    </div>
  );
}

// ─── Main 3D Sandbox Component ─────────────────────────────────────────
export function Agent3DSandbox() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { agentState } = useAgentLiveStore();

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto rounded-2xl overflow-hidden border border-white/[0.06] bg-[#050a0e]">
      {!isLoaded && <LoadingFallback />}

      <Canvas
        camera={{ position: [0, 1, 5.5], fov: 50 }}
        onCreated={() => setIsLoaded(true)}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
        style={{ background: '#050a0e' }}
      >
        <Suspense fallback={null}>
          <MouseTracker />

          {/* World environment */}
          <Agent3DWorld />

          {/* Main character */}
          <Agent3DCharacter />

          {/* Subtle stars background */}
          <Stars
            radius={50}
            depth={50}
            count={1000}
            factor={2}
            saturation={0}
            fade
            speed={0.5}
          />

          {/* Camera controls - limited orbit */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={9}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.3}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* State label overlay */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: {
            idle: '#10b981', thinking: '#06b6d4', searching: '#f59e0b',
            planning: '#8b5cf6', executing: '#f43f5e', verifying: '#34d399',
            celebrating: '#eab308', error: '#ef4444', evolving: '#a855f7', offline: '#71717a',
          }[agentState] || '#10b981' }}
        />
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          {agentState}
        </span>
      </div>

      {/* 3D badge */}
      <div className="absolute top-3 right-3">
        <span className="text-[9px] font-mono text-zinc-700 bg-white/[0.03] border border-white/[0.06] rounded-md px-2 py-0.5">
          3D SANDBOX
        </span>
      </div>
    </div>
  );
}