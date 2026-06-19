'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Agent3DCharacter } from './agent-3d-character';
import { Agent3DWorld } from './agent-3d-world';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { mousePosition } from './agent-3d-shared';
import * as THREE from 'three';

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

function PostFX() {
  const { agentState } = useAgentLiveStore();
  const bloomIntensity = { idle: 0.4, thinking: 0.6, searching: 0.5, planning: 0.5, executing: 0.8, verifying: 0.4, celebrating: 1.0, error: 0.9, evolving: 0.7, offline: 0.1 }[agentState] ?? 0.4;
  const vignetteOpacity = { idle: 0.35, thinking: 0.4, searching: 0.38, planning: 0.35, executing: 0.5, verifying: 0.35, celebrating: 0.25, error: 0.6, evolving: 0.45, offline: 0.5 }[agentState] ?? 0.35;
  const chromaticOffset = { idle: 0, thinking: 0.001, searching: 0.0005, planning: 0.0005, executing: 0.002, verifying: 0, celebrating: 0.001, error: 0.004, evolving: 0.0015, offline: 0 }[agentState] ?? 0;

  return (
    <EffectComposer>
      <Bloom intensity={bloomIntensity} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
      <Vignette eskil={false} offset={0.2} darkness={vignetteOpacity} blendFunction={BlendFunction.NORMAL} />
      {chromaticOffset > 0 && (
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(chromaticOffset, chromaticOffset)} radialModulation={false} modulationOffset={0.5} />
      )}
    </EffectComposer>
  );
}

function SceneContent() {
  return (
    <>
      <MouseTracker />
      <Agent3DWorld />
      <Agent3DCharacter />
      <PostFX />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0d0906] rounded-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-b-orange-400/50 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
        <span className="text-[11px] text-amber-700/60 font-mono tracking-wider">CARGANDO MUNDITO...</span>
      </div>
    </div>
  );
}

export function Agent3DSandbox() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { agentState, isConnected, message, waveNumber, phase, progress } = useAgentLiveStore();

  const stateColor = { idle: '#f59e0b', thinking: '#06b6d4', searching: '#fb923c', planning: '#c084fc', executing: '#f43f5e', verifying: '#34d399', celebrating: '#fde047', error: '#f87171', evolving: '#e879f9', offline: '#71717a' }[agentState] ?? '#f59e0b';
  const stateLabel = { idle: 'EN ESPERA', thinking: 'PENSANDO', searching: 'BUSCANDO', planning: 'PLANIFICANDO', executing: 'EJECUTANDO', verifying: 'VERIFICANDO', celebrating: 'CELEBRANDO', error: 'ERROR', evolving: 'EVOLUCIONANDO', offline: 'OFFLINE' }[agentState] ?? agentState.toUpperCase();
  const stateEmoji = { idle: '💤', thinking: '🧠', searching: '🔍', planning: '📋', executing: '⚡', verifying: '✅', celebrating: '🎉', error: '💥', evolving: '🧬', offline: '⚫' }[agentState] ?? '•';

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto rounded-2xl overflow-hidden border border-amber-500/[0.08] bg-[#0d0906]">
      {!isLoaded && <LoadingFallback />}
      <Canvas camera={{ position: [0, 1.2, 5], fov: 42 }} onCreated={() => setIsLoaded(true)} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} dpr={1} style={{ background: '#0d0906' }}>
        <Suspense fallback={null}>
          <SceneContent />
          <Stars radius={35} depth={35} count={400} factor={1.5} saturation={0.1} fade speed={0.2} />
          <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={8} minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 2.1} autoRotate autoRotateSpeed={0.2} target={[0, -0.2, 0]} enableDamping dampingFactor={0.05} />
        </Suspense>
      </Canvas>

      {/* State label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: stateColor, boxShadow: `0 0 8px ${stateColor}, 0 0 20px ${stateColor}50` }} />
        <div className="flex flex-col">
          <span className="text-xs font-mono uppercase tracking-[0.15em] font-bold drop-shadow-lg" style={{ color: stateColor }}>{stateEmoji} {stateLabel}</span>
          {phase && <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{phase} — ola {waveNumber}</span>}
        </div>
      </div>

      {/* Top right badges */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {isConnected && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
            </div>
            <span className="text-[9px] font-mono text-amber-400 font-medium">LIVE</span>
          </div>
        )}
        <span className="text-[9px] font-mono text-amber-800/40 bg-amber-900/10 border border-amber-800/15 rounded-md px-2 py-1">MUNDITO 3D</span>
      </div>

      {/* Message bubble */}
      {message && message !== 'Esperando actividad...' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[75%]">
          <div className="bg-black/70 backdrop-blur-md border border-amber-500/[0.1] rounded-xl px-4 py-2 text-center shadow-lg shadow-black/30">
            <p className="text-xs text-amber-100/90 italic leading-relaxed truncate">&quot;{message}&quot;</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {waveNumber > 0 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[45%]">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/[0.05]">
            <span className="text-[9px] font-mono text-amber-400 font-medium shrink-0">OLA {waveNumber}</span>
            <div className="flex-1 h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress * 100}%`, backgroundColor: stateColor, boxShadow: `0 0 8px ${stateColor}` }} />
            </div>
            <span className="text-[9px] font-mono text-amber-400/70 shrink-0 font-medium">{Math.round(progress * 100)}%</span>
          </div>
        </div>
      )}

      {/* Warm vignette overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(13,9,6,0.5) 100%)' }} />
    </div>
  );
}