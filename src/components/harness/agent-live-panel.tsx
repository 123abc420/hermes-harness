'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAgentLiveStore, type LiveActivityEntry, type AgentVisualState } from '@/store/agent-live-store';
import { useWaves, useDecisions } from '@/hooks/use-harness-data';
import { useWaveReplay } from '@/hooks/use-wave-replay';
import { useNextWaveCountdown } from '@/hooks/use-next-wave-countdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  WifiOff, Zap, Brain, TrendingUp, Waves, Shield, Sparkles,
  CheckCircle2, Play, Pause, Activity, Terminal,
  Radio, Clock, Cpu, GitBranch, BarChart3, Heart,
  Search, Image, Volume2, Eye, Code2, PenTool, Globe,
  FileText, ListTree, Mic, Check,
} from 'lucide-react';
import { HERMES_VERSION, getStateHex, STATE_RGB } from '@/lib/constants';
import { AgentNetworkCanvas } from './agent-network-canvas';
import { STATE_COLORS, STATE_ICONS, PHASE_STEPS } from './agent-live-subcomponents';

// ─── State Visual Config ──────────────────────────────────────
// Maps each agent state to rich visual properties for the entire panel
const STATE_VISUALS: Record<string, {
  bgTint: string;        // subtle background tint for the whole panel
  glowColor: string;     // color for glow effects
  accentGradient: string; // gradient for subtitle bar accent
  particleColor: string;  // ambient particle color
}> = {
  idle: {
    bgTint: 'rgba(245,158,11,0.04)',
    glowColor: '#f59e0b',
    accentGradient: 'from-amber-500/20 via-amber-600/5 to-transparent',
    particleColor: 'rgba(245,158,11,0.15)',
  },
  thinking: {
    bgTint: 'rgba(6,182,212,0.06)',
    glowColor: '#06b6d4',
    accentGradient: 'from-cyan-500/25 via-teal-600/10 to-transparent',
    particleColor: 'rgba(6,182,212,0.2)',
  },
  searching: {
    bgTint: 'rgba(249,115,22,0.05)',
    glowColor: '#f97316',
    accentGradient: 'from-orange-500/20 via-orange-600/5 to-transparent',
    particleColor: 'rgba(249,115,22,0.15)',
  },
  planning: {
    bgTint: 'rgba(168,85,247,0.06)',
    glowColor: '#a855f7',
    accentGradient: 'from-violet-500/25 via-purple-600/10 to-transparent',
    particleColor: 'rgba(168,85,247,0.2)',
  },
  executing: {
    bgTint: 'rgba(244,63,94,0.06)',
    glowColor: '#f43f5e',
    accentGradient: 'from-rose-500/25 via-orange-500/10 to-transparent',
    particleColor: 'rgba(244,63,94,0.2)',
  },
  verifying: {
    bgTint: 'rgba(34,197,94,0.05)',
    glowColor: '#22c55e',
    accentGradient: 'from-emerald-500/20 via-green-600/5 to-transparent',
    particleColor: 'rgba(34,197,94,0.15)',
  },
  celebrating: {
    bgTint: 'rgba(234,179,8,0.06)',
    glowColor: '#eab308',
    accentGradient: 'from-yellow-400/30 via-amber-500/15 to-transparent',
    particleColor: 'rgba(234,179,8,0.25)',
  },
  error: {
    bgTint: 'rgba(220,38,38,0.07)',
    glowColor: '#dc2626',
    accentGradient: 'from-red-500/25 via-red-700/10 to-transparent',
    particleColor: 'rgba(220,38,38,0.2)',
  },
  evolving: {
    bgTint: 'rgba(217,70,239,0.05)',
    glowColor: '#d946ef',
    accentGradient: 'from-fuchsia-500/20 via-purple-500/10 to-transparent',
    particleColor: 'rgba(217,70,239,0.18)',
  },
  offline: {
    bgTint: 'rgba(113,113,122,0.03)',
    glowColor: '#71717a',
    accentGradient: 'from-zinc-500/10 via-zinc-600/5 to-transparent',
    particleColor: 'rgba(113,113,122,0.08)',
  },
};

// ─── Agent Capability Palette ─────────────────────────────────
// Defines all skills the agent can use. `matchState` determines which state activates it.
const AGENT_SKILLS = [
  { id: 'web-search', label: 'Web Search', icon: Search, matchStates: ['searching'] as AgentVisualState[] },
  { id: 'image-gen', label: 'Image Gen', icon: Image, matchStates: ['executing'] as AgentVisualState[] },
  { id: 'tts', label: 'Voice', icon: Volume2, matchStates: [] as AgentVisualState[] },
  { id: 'vlm', label: 'Vision', icon: Eye, matchStates: ['thinking'] as AgentVisualState[] },
  { id: 'code-edit', label: 'Code Edit', icon: Code2, matchStates: ['executing'] as AgentVisualState[] },
  { id: 'git-push', label: 'Git Push', icon: GitBranch, matchStates: ['executing'] as AgentVisualState[] },
  { id: 'file-read', label: 'File Read', icon: FileText, matchStates: ['thinking', 'searching'] as AgentVisualState[] },
  { id: 'file-write', label: 'File Write', icon: PenTool, matchStates: ['executing'] as AgentVisualState[] },
  { id: 'terminal', label: 'Terminal', icon: Terminal, matchStates: ['executing'] as AgentVisualState[] },
  { id: 'browser', label: 'Browser', icon: Globe, matchStates: ['searching'] as AgentVisualState[] },
  { id: 'data-analysis', label: 'Analytics', icon: BarChart3, matchStates: ['thinking', 'verifying'] as AgentVisualState[] },
  { id: 'planning', label: 'Planning', icon: ListTree, matchStates: ['planning'] as AgentVisualState[] },
] as const;

// ─── Ambient Floating Particles ──────────────────────────────
function AmbientParticles({ color }: { color: string }) {
  const particles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, // percentage
      size: 2 + Math.random() * 4,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 4,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: color,
          }}
          animate={{
            y: [0, -200, -400],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Compact Phase Progress Bar ──────────────────────────────
function CompactPhaseBar({ phase, progress, glowColor }: {
  phase: string; progress: number; glowColor: string;
}) {
  const currentIndex = PHASE_STEPS.findIndex(p => p.key === phase);

  return (
    <div className="relative">
      {/* Background bar */}
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        {/* Filled progress */}
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: glowColor }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* Phase labels with markers */}
      <div className="flex items-center justify-between mt-1 px-0.5">
        {PHASE_STEPS.map((p, i) => {
          const isCompleted = currentIndex > i || (currentIndex === i && progress > 0.8);
          const isCurrent = currentIndex === i;
          return (
            <div key={p.key} className="flex items-center gap-0.5">
              {/* Check or dot */}
              <motion.div
                className={cn(
                  'w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors',
                  isCompleted
                    ? 'bg-emerald-500/30'
                    : isCurrent
                      ? 'ring-1 ring-white/30'
                      : 'bg-white/[0.04]',
                )}
                style={
                  isCurrent
                    ? { backgroundColor: `${glowColor}30`, boxShadow: `0 0 8px ${glowColor}40` }
                    : undefined
                }
                animate={
                  isCurrent
                    ? { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }
                    : {}
                }
                transition={isCurrent ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.5 }}
              >
                {isCompleted ? (
                  <Check className="w-2 h-2 text-emerald-400" strokeWidth={3} />
                ) : (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isCurrent ? glowColor : 'rgba(255,255,255,0.15)',
                    }}
                  />
                )}
              </motion.div>
              {/* Label — hidden on very small screens */}
              <span
                className={cn(
                  'text-[8px] font-bold tracking-wider uppercase hidden sm:block transition-colors',
                  isCompleted
                    ? 'text-emerald-400/70'
                    : isCurrent
                      ? 'text-white/90'
                      : 'text-zinc-600',
                )}
              >
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Action Palette ──────────────────────────────────────────
function ActionPalette({ agentState }: { agentState: AgentVisualState }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
      {AGENT_SKILLS.map(skill => {
        const isActive = skill.matchStates.includes(agentState);
        const Icon = skill.icon;
        const stateHex = getStateHex(agentState);

        return (
          <motion.div
            key={skill.id}
            className={cn(
              'relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors',
              isActive
                ? 'border-white/20 bg-white/[0.06]'
                : 'border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03]',
            )}
            animate={
              isActive
                ? {
                    boxShadow: [
                      `0 0 4px ${stateHex}20`,
                      `0 0 16px ${stateHex}40`,
                      `0 0 4px ${stateHex}20`,
                    ],
                  }
                : {}
            }
            transition={
              isActive
                ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.5 }
            }
          >
            {/* Glow ring for active skill */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{ border: `1px solid ${stateHex}50` }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <Icon
              className={cn(
                'w-3.5 h-3.5 shrink-0',
                isActive ? 'text-white' : 'text-zinc-500',
              )}
              style={isActive ? { color: stateHex } : undefined}
            />
            <span
              className={cn(
                'text-[7px] sm:text-[8px] font-semibold text-center leading-tight truncate w-full',
                isActive ? 'text-white/90' : 'text-zinc-600',
              )}
            >
              {skill.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Live Subtitle Bar ──────────────────────────────────────
function LiveSubtitleBar({ message, agentState, glowColor }: {
  message: string; agentState: AgentVisualState; glowColor: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/60 backdrop-blur-xl">
      {/* State-colored accent gradient on the left */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${glowColor}15 0%, transparent 50%)`,
        }}
      />
      {/* Animated accent line on the left edge */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
        style={{ backgroundColor: glowColor }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative flex items-center gap-3 px-4 py-3 sm:py-4">
        {/* State icon with glow */}
        <motion.div
          className="shrink-0 text-xl sm:text-2xl"
          animate={
            agentState === 'error'
              ? { x: [0, -2, 2, -2, 0] }
              : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }
          }
          transition={
            agentState === 'error'
              ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {STATE_ICONS[agentState]}
        </motion.div>
        {/* Message text */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-sm sm:text-base font-medium text-zinc-100 leading-snug truncate"
            >
              {message || 'Waiting for activity...'}
            </motion.p>
          </AnimatePresence>
        </div>
        {/* Mic icon (voice/subtitle indicator) */}
        <motion.div
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08]"
          animate={{
            boxShadow: message ? [
              `0 0 0px ${glowColor}00`,
              `0 0 12px ${glowColor}30`,
              `0 0 0px ${glowColor}00`,
            ] : {},
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Mic className="w-3.5 h-3.5 text-zinc-400" />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Stat Card Mini Component ──────────────────────────────
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/[0.05]">
      <div className={cn(color, 'opacity-70')}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">{label}</div>
        <div className={cn('text-sm font-bold tabular-nums', color)}>{value}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── MAIN: Agent Live Panel ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════
export function AgentLivePanel() {
  const [activityFilter, setActivityFilter] = useState<AgentVisualState | 'all'>('all');

  // Store state
  const {
    agentState, message, phase, progress, waveNumber,
    isConnected, waveCount, totalImprovements, totalDecisions,
    decisionCountThisWave, recentSuccessRate, healthScore,
    level, levelName, xp, xpToNext,
    activities, networkNodes, selectedNodeId,
  } = useAgentLiveStore();

  // Data hooks
  const { data: wavesData } = useWaves(1, 1);
  const { data: decisionsData } = useDecisions(1, 3);
  const { toggleReplay, isReplaying } = useWaveReplay();

  const latestWave = wavesData?.waves?.[0];
  const countdown = useNextWaveCountdown(latestWave?.waveNumber ?? 0, latestWave ?? null);
  const stateHex = getStateHex(agentState);
  const visuals = STATE_VISUALS[agentState] || STATE_VISUALS.idle;

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return activities;
    return activities.filter(a => a.state === activityFilter);
  }, [activities, activityFilter]);

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <motion.div
      className="relative flex flex-col gap-3 h-full overflow-hidden rounded-2xl"
      animate={{
        backgroundColor: visuals.bgTint,
      }}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* ─── Ambient Particles (state-colored, very subtle) ─── */}
      <AmbientParticles color={visuals.particleColor} />

      {/* ═══ LAYER 1: LIVE SUBTITLE BAR ═══ */}
      <LiveSubtitleBar message={message} agentState={agentState} glowColor={visuals.glowColor} />

      {/* ═══ LAYER 2: STATUS CHIPS + COMPACT PHASE BAR ═══ */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Status chips row */}
        <div className="flex items-center justify-between px-1 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* LIVE indicator */}
            <div className="flex items-center gap-1.5">
              <div className={cn('relative w-2 h-2 rounded-full', isConnected ? 'bg-emerald-400' : 'bg-zinc-600')}>
                {isConnected && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-emerald-400"
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.8, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>
              <span className={cn('text-[9px] font-bold tracking-widest', isConnected ? 'text-emerald-400' : 'text-zinc-500')}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            {/* State badge */}
            <motion.div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md border"
              style={{ backgroundColor: `${stateHex}15`, borderColor: `${stateHex}30` }}
              animate={
                agentState === 'error'
                  ? { x: [0, -1.5, 1.5, -1, 0] }
                  : { boxShadow: [`0 0 0px ${stateHex}00`, `0 0 8px ${stateHex}30`, `0 0 0px ${stateHex}00`] }
              }
              transition={
                agentState === 'error'
                  ? { duration: 0.4, repeat: 3, ease: 'easeInOut' }
                  : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <span className="text-[10px]">{STATE_ICONS[agentState]}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: stateHex }}>
                {agentState}
              </span>
            </motion.div>

            {/* Level badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold text-amber-300">LV {level}</span>
              <span className="text-[8px] text-amber-400/50">{levelName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Wave number */}
            {waveNumber > 0 && (
              <div className="flex items-center gap-1">
                <Waves className="w-3 h-3 text-sky-400" />
                <span className="text-[10px] font-semibold text-sky-300">W{waveNumber}</span>
              </div>
            )}
            {/* Countdown */}
            {(countdown != null && countdown > 0 && countdown < 600) && !isReplaying && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                <Clock className="w-2.5 h-2.5 text-zinc-500" />
                <span className="text-[9px] font-mono text-zinc-400">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            <span className="text-[8px] font-mono text-zinc-600">{HERMES_VERSION}</span>
          </div>
        </div>

        {/* Compact Phase Bar */}
        <div className="px-2">
          <CompactPhaseBar phase={phase} progress={progress} glowColor={visuals.glowColor} />
        </div>
      </div>

      {/* ═══ LAYER 3: AGENT NETWORK CANVAS (main area) ═══ */}
      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/[0.06] bg-[#060a14]">
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />
        {/* State-colored edge glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            boxShadow: `inset 0 0 60px -20px ${visuals.glowColor}25, inset 0 0 120px -40px ${visuals.glowColor}10`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Corner labels */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: visuals.glowColor, opacity: 0.6 }} />
          <span className="text-[8px] font-mono text-zinc-600 tracking-wider">AGENT NETWORK</span>
        </div>
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <span className="text-[8px] font-mono text-zinc-600 tracking-wider">
            {networkNodes.length} NODE{networkNodes.length !== 1 ? 'S' : ''} ACTIVE
          </span>
        </div>

        <AgentNetworkCanvas />

        {/* Node Popup */}
        <AnimatePresence>
          {selectedNodeId &&
            (() => {
              const node = networkNodes.find(n => n.id === selectedNodeId);
              if (!node) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute bottom-3 left-3 z-20 max-w-xs p-3 rounded-xl bg-black/80 backdrop-blur-xl border border-white/[0.08]"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color }} />
                    <span className="text-xs font-bold text-white">{node.name}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/10 text-zinc-400">
                      {node.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px]">{STATE_ICONS[node.state]}</span>
                    <span className="text-[10px] font-medium" style={{ color: getStateHex(node.state) }}>
                      {node.state}
                    </span>
                  </div>
                  {node.message && (
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{node.message}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-white/[0.06]">
                    <span className="text-[9px] text-zinc-500">
                      {node.connections.length} connection{node.connections.length !== 1 ? 's' : ''}
                    </span>
                    {node.connections.length > 0 && (
                      <span className="text-[9px] text-zinc-600">
                        → {node.connections.slice(0, 3).map(id => {
                          const cn = networkNodes.find(n => n.id === id);
                          return cn ? cn.name : id;
                        }).join(', ')}
                        {node.connections.length > 3 ? '...' : ''}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })()}
        </AnimatePresence>
      </div>

      {/* ═══ LAYER 4: ACTION PALETTE + STATS (compact bottom) ═══ */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Action Palette */}
        <div className="p-2.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/[0.06]">
          <div className="flex items-center gap-1.5 mb-2">
            <Cpu className="w-3 h-3 text-zinc-500" />
            <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">Agent Capabilities</span>
          </div>
          <ActionPalette agentState={agentState} />
        </div>

        {/* Stats row + activity feed toggle */}
        <div className="flex items-center gap-2">
          {/* Compact stats */}
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            <StatCard icon={<Waves className="w-3 h-3" />} label="Waves" value={waveCount} color="text-sky-400" />
            <StatCard icon={<Zap className="w-3 h-3" />} label="Decisions" value={totalDecisions} color="text-amber-400" />
            <StatCard
              icon={<Shield className="w-3 h-3" />}
              label="Health"
              value={`${healthScore}%`}
              color={healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400'}
            />
          </div>

          {/* Replay button */}
          {latestWave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleReplay}
              disabled={isReplaying}
              className="h-auto py-2 px-3 text-[10px] gap-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.06] rounded-lg shrink-0"
            >
              {isReplaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="hidden sm:inline">{isReplaying ? 'Replaying...' : 'Replay'}</span>
            </Button>
          )}
        </div>

        {/* XP Bar (compact) */}
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
              animate={{ width: `${(xp / xpToNext) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <span className="text-[8px] font-mono text-zinc-500 shrink-0">{xp}/{xpToNext} XP</span>
        </div>
      </div>

      {/* ═══ LAYER 5: COLLAPSIBLE ACTIVITY FEED ═══ */}
      <div className="flex flex-col rounded-xl bg-black/50 border border-white/[0.06] overflow-hidden max-h-48">
        {/* Feed header with filter pills inline */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-zinc-400" />
            <span className="text-[9px] font-bold text-zinc-300 tracking-wider uppercase">Activity</span>
            <span className="text-[8px] font-mono text-zinc-600">({activities.length})</span>
          </div>
          {/* Compact filter pills */}
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {(['all', 'thinking', 'executing', 'planning', 'error', 'celebrating'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActivityFilter(f)}
                className={cn(
                  'px-1.5 py-0.5 rounded text-[8px] font-semibold tracking-wide shrink-0 transition-all',
                  activityFilter === f
                    ? 'bg-white/10 text-white border border-white/[0.15]'
                    : 'text-zinc-600 hover:text-zinc-300 border border-transparent',
                )}
              >
                {f === 'all' ? 'All' : STATE_ICONS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Feed entries */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-px p-1">
            <AnimatePresence initial={false}>
              {filteredActivities.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-zinc-600 text-[10px]">
                  {isConnected ? 'Waiting for activity...' : 'Disconnected — reconnecting...'}
                </div>
              ) : (
                filteredActivities.slice(0, 30).map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className={cn(
                      'flex items-start gap-2 px-2 py-1 rounded-lg',
                      Date.now() - entry.timestamp < 5000 ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]',
                    )}
                  >
                    <div
                      className="w-1 h-full min-h-[16px] rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: getStateHex(entry.state) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]">{STATE_ICONS[entry.state]}</span>
                        <span className="text-[10px] text-zinc-300 truncate">{entry.message}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-mono text-zinc-600">{entry.timestampAR}</span>
                        {entry.phase && (
                          <span className="text-[7px] font-bold tracking-wider text-zinc-500 uppercase">
                            {entry.phase}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}