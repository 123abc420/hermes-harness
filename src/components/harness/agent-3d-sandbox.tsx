'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { ChibiCharacter } from './agent-3d-character';
import { Agent3DWorld } from './agent-3d-world';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { mousePosition, STATIONS } from './agent-3d-shared';
import * as THREE from 'three';

function CameraFollow() {
  const { camera } = useThree();
  const { agentState } = useAgentLiveStore();
  const targetPos = useRef(new THREE.Vector3(0, 3, 6));
  const currentPos = useRef(new THREE.Vector3(0, 3, 6));
  useEffect(() => {
    const s = STATIONS[agentState];
    targetPos.current.set(s.pos[0] * 0.5, 3.5, s.pos[2] + 5.5);
  }, [agentState]);
  useFrame((_, delta) => {
    currentPos.current.lerp(targetPos.current, delta * 1.5);
    camera.position.lerp(currentPos.current, delta * 2);
    const s = STATIONS[agentState];
    camera.lookAt(s.pos[0] * 0.3, 0.3, s.pos[2] * 0.3);
  });
  return null;
}

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
  const bi = { idle: 0.3, thinking: 0.4, searching: 0.35, planning: 0.35, executing: 0.6, verifying: 0.3, celebrating: 0.8, error: 0.7, evolving: 0.5, offline: 0.05 }[agentState] ?? 0.3;
  const vo = { idle: 0.4, thinking: 0.45, searching: 0.42, planning: 0.4, executing: 0.55, verifying: 0.4, celebrating: 0.3, error: 0.65, evolving: 0.5, offline: 0.6 }[agentState] ?? 0.4;
  return (
    <EffectComposer>
      <Bloom intensity={bi} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur />
      <Vignette eskil={false} offset={0.3} darkness={vo} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] rounded-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-b-orange-400/50 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
        <span className="text-[11px] text-amber-700/60 font-mono tracking-wider">CARGANDO MUNDO...</span>
      </div>
    </div>
  );
}

export function Agent3DSandbox() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { agentState, isConnected, message, waveNumber, phase, progress } = useAgentLiveStore();
  const sc = { idle: '#f59e0b', thinking: '#06b6d4', searching: '#fb923c', planning: '#a78bfa', executing: '#f43f5e', verifying: '#34d399', celebrating: '#facc15', error: '#ef4444', evolving: '#d946ef', offline: '#71717a' }[agentState] ?? '#f59e0b';
  const sl = { idle: 'EN ESPERA', thinking: 'PENSANDO', searching: 'BUSCANDO', planning: 'PLANIFICANDO', executing: 'EJECUTANDO', verifying: 'VERIFICANDO', celebrating: 'CELEBRANDO', error: 'ERROR', evolving: 'EVOLUCIONANDO', offline: 'OFFLINE' }[agentState] ?? '';
  const stl = STATIONS[agentState]?.label ?? '';

  return (
    <div className="relative w-full aspect-[16/10] max-w-[640px] mx-auto rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0f0f0f]">
      {!isLoaded && <LoadingScreen />}
      <Canvas camera={{ position: [0, 3.5, 6], fov: 45 }} onCreated={() => setIsLoaded(true)} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} dpr={[1, 1.5]} style={{ background: '#0f0f0f' }} shadows>
        <Suspense fallback={null}>
          <MouseTracker />
          <CameraFollow />
          <Agent3DWorld />
          <ChibiCharacter />
          <PostFX />
          <Stars radius={20} depth={20} count={300} factor={1} saturation={0.05} fade speed={0.15} />
          <OrbitControls enablePan={false} enableZoom={true} minDistance={3} maxDistance={10} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.3} maxTargetRadius={4} enableDamping dampingFactor={0.08} />
        </Suspense>
      </Canvas>
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08]">
              <div className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></div>
              <span className="text-[9px] font-mono text-emerald-300 font-medium">LIVE</span>
            </div>
          )}
          {stl && <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08]"><span className="text-[9px] font-mono text-zinc-400">{stl}</span></div>}
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08]">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: sc, boxShadow: `0 0 6px ${sc}` }} />
          <span className="text-[10px] font-mono font-bold" style={{ color: sc }}>{sl}</span>
        </div>
      </div>
      {waveNumber > 0 && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/[0.06]">
            <span className="text-[9px] font-mono text-zinc-300 font-medium shrink-0">OLA {waveNumber}</span>
            <div className="w-24 h-[3px] bg-white/[0.08] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress * 100}%`, backgroundColor: sc, boxShadow: `0 0 6px ${sc}` }} /></div>
            <span className="text-[9px] font-mono text-zinc-400 font-medium">{Math.round(progress * 100)}%</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
        {phase && <div className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/[0.06]"><span className="text-[9px] font-mono text-zinc-500 uppercase">{phase}</span></div>}
        {message && message !== 'Esperando actividad...' && <div className="max-w-[60%]"><div className="bg-black/60 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-lg"><p className="text-[11px] text-zinc-200 italic leading-relaxed truncate">&quot;{message}&quot;</p></div></div>}
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
    </div>
  );
}
