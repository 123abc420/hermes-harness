'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Agent3DCharacter } from './agent-3d-character';
import { Agent3DWorld } from './agent-3d-world';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { mousePosition, vrmLoadingState } from './agent-3d-shared';
export { mousePosition, vrmLoadingState };
import * as THREE from 'three';

// ─── Mouse Tracker ──────────────────────────────────────────────────
function MouseTracker() {
  const { gl } = useThree();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosition.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const canvas = gl.domElement;
    canvas.addEventListener('mousemove', handler);
    return () => canvas.removeEventListener('mousemove', handler);
  }, [gl]);

  return null;
}

// ─── State-dependent post-processing ────────────────────────────────
function PostEffects() {
  const { agentState } = useAgentLiveStore();

  const bloomIntensity = {
    idle: 0.8, thinking: 1.2, searching: 1.0, planning: 1.4,
    executing: 1.8, verifying: 1.0, celebrating: 2.5, error: 2.8,
    evolving: 1.6, offline: 0.2,
  }[agentState] ?? 0.8;

  const bloomLuminanceThreshold = {
    idle: 0.2, thinking: 0.15, searching: 0.18, planning: 0.12,
    executing: 0.1, verifying: 0.18, celebrating: 0.05, error: 0.08,
    evolving: 0.1, offline: 0.5,
  }[agentState] ?? 0.2;

  const vignetteOpacity = {
    idle: 0.3, thinking: 0.4, searching: 0.35, planning: 0.45,
    executing: 0.5, verifying: 0.3, celebrating: 0.2, error: 0.6,
    evolving: 0.4, offline: 0.5,
  }[agentState] ?? 0.3;

  const chromaticOffset = {
    idle: 0, thinking: 0.0005, searching: 0.0003, planning: 0,
    executing: 0.001, verifying: 0, celebrating: 0.0002, error: 0.003,
    evolving: 0.0008, offline: 0,
  }[agentState] ?? 0;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomLuminanceThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.85}
      />
      <Vignette
        offset={0.3}
        darkness={vignetteOpacity}
        blendFunction={BlendFunction.NORMAL}
      />
      {chromaticOffset > 0 && (
        <ChromaticAberration
          offset={[chromaticOffset, chromaticOffset]}
          blendFunction={BlendFunction.NORMAL}
          radialModulation
          modulationOffset={0.5}
        />
      )}
    </EffectComposer>
  );
}

// ─── Scene Content ───────────────────────────────────────────────────
function SceneContent() {
  return (
    <>
      <MouseTracker />
      <Agent3DWorld />
      <Agent3DCharacter />
      <PostEffects />
    </>
  );
}

// ─── Loading Fallback ────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#050a0e] rounded-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div
            className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-b-cyan-400/50 animate-spin"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          />
        </div>
        <span className="text-[11px] text-zinc-600 font-mono tracking-wider">
          CARGANDO MUNDITO...
        </span>
      </div>
    </div>
  );
}

// ─── Main 3D Sandbox Component ───────────────────────────────────────
export function Agent3DSandbox() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { agentState, isConnected, message, waveNumber, phase, progress } = useAgentLiveStore();

  const stateColor = {
    idle: '#10b981', thinking: '#06b6d4', searching: '#f59e0b',
    planning: '#8b5cf6', executing: '#f43f5e', verifying: '#34d399',
    celebrating: '#eab308', error: '#ef4444', evolving: '#a855f7', offline: '#52525b',
  }[agentState] ?? '#10b981';

  const stateLabel = {
    idle: 'EN ESPERA', thinking: 'PENSANDO', searching: 'BUSCANDO',
    planning: 'PLANIFICANDO', executing: 'EJECUTANDO', verifying: 'VERIFICANDO',
    celebrating: 'CELEBRANDO', error: 'ERROR', evolving: 'EVOLUCIONANDO', offline: 'OFFLINE',
  }[agentState] ?? agentState.toUpperCase();

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto rounded-2xl overflow-hidden border border-white/[0.06] bg-[#050a0e]">
      {!isLoaded && <LoadingFallback />}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 5], fov: 45 }}
        onCreated={() => setIsLoaded(true)}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 1.5]}
        style={{ background: '#050a0e' }}
      >
        <Suspense fallback={null}>
          <PerformanceMonitor>
            <SceneContent />
          </PerformanceMonitor>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Stars
            radius={60}
            depth={60}
            count={1500}
            factor={2.5}
            saturation={0}
            fade
            speed={0.3}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={9}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate
            autoRotateSpeed={0.25}
            target={[0, -0.2, 0]}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* ─── Cinematic Overlays ─── */}

      {/* State label — bottom left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
        <div
          className="w-2.5 h-2.5 rounded-full animate-pulse"
          style={{
            backgroundColor: stateColor,
            boxShadow: `0 0 8px ${stateColor}, 0 0 16px ${stateColor}40`,
          }}
        />
        <div className="flex flex-col">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold"
            style={{ color: stateColor }}
          >
            {stateLabel}
          </span>
          {phase && (
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">
              {phase} — ola {waveNumber}
            </span>
          )}
        </div>
      </div>

      {/* 3D badge — top right */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {isConnected && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </div>
            <span className="text-[8px] font-mono text-emerald-400">LIVE</span>
          </div>
        )}
        <span className="text-[8px] font-mono text-zinc-700 bg-white/[0.03] border border-white/[0.06] rounded-md px-2 py-0.5">
          3D SANDBOX
        </span>
      </div>

      {/* Character message — bottom center */}
      {message && message !== 'Esperando actividad...' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[70%]">
          <div className="bg-black/60 backdrop-blur-md border border-white/[0.08] rounded-lg px-3 py-1.5 text-center">
            <p className="text-[10px] text-zinc-300 italic leading-relaxed truncate">
              &quot;{message}&quot;
            </p>
          </div>
        </div>
      )}

      {/* Progress bar — top center (during waves) */}
      {waveNumber > 0 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[40%]">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-zinc-600 shrink-0">OLA {waveNumber}</span>
            <div className="flex-1 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress * 100}%`,
                  backgroundColor: stateColor,
                  boxShadow: `0 0 6px ${stateColor}`,
                }}
              />
            </div>
            <span className="text-[8px] font-mono text-zinc-600 shrink-0">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Vignette overlay for cinematic feel */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,10,14,0.4) 100%)',
        }}
      />
    </div>
  );
}