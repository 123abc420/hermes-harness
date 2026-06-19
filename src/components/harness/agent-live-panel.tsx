'use client';

import { useRef, useEffect, useState, useCallback, Suspense, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentLiveStore, type AgentVisualState, type LiveActivityEntry } from '@/store/agent-live-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Brain,
  TrendingUp,
  Waves,
  Shield,
  Sparkles,
  Circle,
  Users,
  RotateCcw,
  Play,
  Pause,
  Clock,
} from 'lucide-react';

// Dynamic import for 3D components (avoid SSR issues with Three.js)
const Agent3DSandbox = dynamic(
  () => import('./agent-3d-sandbox').then(m => ({ default: m.Agent3DSandbox })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square max-w-[560px] mx-auto rounded-2xl border border-white/[0.06] bg-[#050a0e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          </div>
          <span className="text-[10px] text-zinc-600 font-mono">Inicializando sandbox 3D...</span>
        </div>
      </div>
    ),
  }
);

// ─── State config for the activity feed ──────────────────────────────
const STATE_ICONS: Record<AgentVisualState, string> = {
  idle: '💤', thinking: '🧠', searching: '🔍', planning: '📋',
  executing: '⚡', verifying: '✅', celebrating: '🎉', error: '💥',
  evolving: '🧬', offline: '⚫',
};

const STATE_COLORS: Record<AgentVisualState, string> = {
  idle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  thinking: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  searching: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  planning: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  executing: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  verifying: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  celebrating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  evolving: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  offline: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const STATE_DOT_COLORS: Record<AgentVisualState, string> = {
  idle: '#10b981', thinking: '#06b6d4', searching: '#f59e0b',
  planning: '#8b5cf6', executing: '#f43f5e', verifying: '#34d399',
  celebrating: '#eab308', error: '#ef4444', evolving: '#a855f7', offline: '#71717a',
};

const PHASE_STEPS = [
  { key: 'assess', label: 'ASSESS', color: 'text-cyan-400' },
  { key: 'plan', label: 'PLAN', color: 'text-violet-400' },
  { key: 'execute', label: 'EXECUTE', color: 'text-rose-400' },
  { key: 'verify', label: 'VERIFY', color: 'text-emerald-400' },
  { key: 'persist', label: 'PERSIST', color: 'text-amber-400' },
  { key: 'report', label: 'REPORT', color: 'text-blue-400' },
];

// ─── Activity Entry Component ────────────────────────────────────────
function ActivityEntry({ entry, isNew }: { entry: LiveActivityEntry; isNew: boolean }) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.02] transition-colors"
    >
      <span className="text-xs mt-0.5 shrink-0">
        {STATE_ICONS[entry.state] || '•'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-zinc-300 leading-relaxed break-all">
          {entry.message}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock className="h-2.5 w-2.5 text-zinc-700" />
          <span className="text-[9px] text-zinc-600 font-mono">{entry.timestampAR || '—'}</span>
          {entry.phase && (
            <span className="text-[8px] text-zinc-700 font-mono uppercase">{entry.phase}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Wave Phase Tracker ──────────────────────────────────────────────
function PhaseTracker({ phase, progress }: { phase: string; progress: number }) {
  const currentIndex = PHASE_STEPS.findIndex(p => p.key === phase);
  return (
    <div className="flex items-center gap-1 mt-2">
      {PHASE_STEPS.map((p, i) => {
        const isCompleted = currentIndex > i || (currentIndex === i && progress > 0.8);
        const isCurrent = currentIndex === i;
        return (
          <div key={p.key} className="flex items-center gap-1">
            <div
              className={`
                flex items-center justify-center w-6 h-6 rounded-md text-[8px] font-bold transition-all duration-500
                ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40' :
                  isCurrent ? `${p.color} bg-white/5 ring-1 ring-white/20 animate-pulse` :
                  'bg-white/[0.02] text-zinc-600 ring-1 ring-white/[0.05]'}
              `}
            >
              {isCompleted ? '✓' : p.label[0]}
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <div className={`w-3 h-px ${currentIndex > i ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-Agent Badge ─────────────────────────────────────────────────
function SubAgentBadge({ name, color, state }: { name: string; color: string; state: AgentVisualState }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]"
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="text-[9px] text-zinc-400 font-mono truncate max-w-[80px]">{name}</span>
      <span className="text-[8px] text-zinc-600">{STATE_ICONS[state]}</span>
    </motion.div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtitle, iconColor }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle: string;
  iconColor: string;
}) {
  return (
    <Card className="border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          <span className="text-[10px] font-mono text-zinc-500">{label}</span>
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
        <p className="text-[9px] text-zinc-600 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────
export function AgentLivePanel() {
  const {
    agentState, message, phase, waveNumber, progress, isConnected,
    waveCount, totalImprovements, totalDecisions, level, levelName, xp, xpToNext,
    activities, subAgents, lastTurnActivities, isReplaying,
    setIsReplaying, setLastTurn, addActivity,
  } = useAgentLiveStore();

  const feedRef = useRef<HTMLDivElement>(null);
  const prevActivityCount = useRef(0);
  const replayIndexRef = useRef(0);
  const replayTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Auto-scroll feed
  useEffect(() => {
    if (activities.length > prevActivityCount.current && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
    prevActivityCount.current = activities.length;
  }, [activities.length]);

  // Track wave completion for "last turn" replay
  const prevWaveRef = useRef(waveNumber);
  useEffect(() => {
    if (waveNumber > prevWaveRef.current && waveNumber > 0) {
      // Wave just completed — save activities as "last turn"
      const waveActivities = activities.filter(
        a => a.phase || a.state !== 'idle'
      ).slice(0, 20);
      if (waveActivities.length > 0) {
        setLastTurn(waveActivities);
      }
    }
    prevWaveRef.current = waveNumber;
  }, [waveNumber, activities, setLastTurn]);

  // Loop replay of last turn
  const toggleReplay = useCallback(() => {
    if (isReplaying) {
      // Stop replay
      setIsReplaying(false);
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
        replayTimerRef.current = undefined;
      }
    } else if (lastTurnActivities.length > 0) {
      // Start replay
      setIsReplaying(true);
      replayIndexRef.current = 0;
      replayTimerRef.current = setInterval(() => {
        const idx = replayIndexRef.current % lastTurnActivities.length;
        const entry = lastTurnActivities[lastTurnActivities.length - 1 - idx];
        if (entry) {
          addActivity({
            state: entry.state,
            message: `⟳ ${entry.message}`,
            phase: entry.phase,
          });
        }
        replayIndexRef.current++;
        if (replayIndexRef.current >= lastTurnActivities.length) {
          replayIndexRef.current = 0;
        }
      }, 2000);
    }
  }, [isReplaying, lastTurnActivities, setIsReplaying, addActivity]);

  // Clean up replay on unmount
  useEffect(() => {
    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, []);

  const xpPercent = Math.min((xp / xpToNext) * 100, 100);
  const displayActivities = isReplaying
    ? activities.slice(0, 30)
    : activities;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── Left Column: 3D Avatar + Stats ─── */}
      <div className="flex flex-col gap-4">
        {/* 3D Sandbox Card */}
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Connection status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <WifiOff className="h-3 w-3 text-zinc-600" />
                    <span className="text-[10px] font-mono text-zinc-600">OFFLINE</span>
                  </div>
                )}
              </div>
              <Badge variant="outline" className={STATE_COLORS[agentState] + ' text-[10px] px-2 py-0'}>
                {STATE_ICONS[agentState]} {agentState.toUpperCase()}
              </Badge>
            </div>

            {/* 3D Sandbox */}
            <Agent3DSandbox />

            {/* Current message */}
            <div className="mt-3 text-center min-h-[2rem]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={message}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-zinc-400 italic"
                >
                  &quot;{message}&quot;
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Wave phase tracker */}
            {waveNumber > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-zinc-500">WAVE {waveNumber}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{Math.round(progress * 100)}%</span>
                </div>
                <Progress value={progress * 100} className="h-1.5 bg-white/[0.05]" />
                <PhaseTracker phase={phase} progress={progress} />
              </div>
            )}

            {/* Sub-agents display */}
            {subAgents.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Users className="h-3 w-3 text-violet-400" />
                  <span className="text-[10px] font-mono text-zinc-500">SUB-AGENTES ({subAgents.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {subAgents.map(sa => (
                      <SubAgentBadge
                        key={sa.id}
                        name={sa.name}
                        color={sa.color}
                        state={sa.state}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Sparkles}
            label="NIVEL"
            value={level}
            subtitle={levelName}
            iconColor="text-yellow-400"
          />
          <StatCard
            icon={Waves}
            label="OLAS"
            value={waveCount}
            subtitle="Ciclos completados"
            iconColor="text-cyan-400"
          />
          <StatCard
            icon={TrendingUp}
            label="MEJORAS"
            value={totalImprovements}
            subtitle="Mejoras aplicadas"
            iconColor="text-emerald-400"
          />
          <StatCard
            icon={Brain}
            label="DECISIONES"
            value={totalDecisions}
            subtitle="Decisiones tomadas"
            iconColor="text-violet-400"
          />
        </div>

        {/* XP Bar */}
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span className="text-[10px] font-mono text-zinc-500">EXPERIENCIA</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600">{xp} / {xpToNext} XP</span>
            </div>
            <Progress value={xpPercent} className="h-2 bg-white/[0.05]" />
          </CardContent>
        </Card>
      </div>

      {/* ─── Right Column: Live Activity Feed ─── */}
      <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex flex-col">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-zinc-300">ACTIVIDAD EN VIVO</span>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
            <span className="text-[10px] text-zinc-600">{activities.length} eventos</span>
          </div>
        </div>

        <ScrollArea className="flex-1 h-[420px] lg:h-[520px]" ref={feedRef}>
          <div className="p-2 space-y-0.5">
            <AnimatePresence initial={false}>
              {displayActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Circle className="h-8 w-8 text-zinc-800 mb-3" />
                  <p className="text-xs text-zinc-600">Esperando actividad del agente...</p>
                  <p className="text-[10px] text-zinc-700 mt-1">
                    Las actualizaciones aparecerán aquí cuando el cron ejecute una ola
                  </p>
                </div>
              ) : (
                displayActivities.map((entry, i) => (
                  <ActivityEntry key={entry.id} entry={entry} isNew={i === 0} />
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Bottom bar with replay controls */}
        <div className="px-4 py-2.5 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-zinc-600" />
                <span className="text-[9px] text-zinc-600 font-mono">SPEC-DRIVEN</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-zinc-600" />
                <span className="text-[9px] text-zinc-600 font-mono">AUTO-EVOLUCIÓN</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Replay last turn */}
              {lastTurnActivities.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleReplay}
                  className={`h-6 px-2 text-[9px] gap-1 ${
                    isReplaying
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                      : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.03]'
                  }`}
                >
                  {isReplaying ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                  <span>⟳ REPLAY TURNO</span>
                </Button>
              )}
              <span className="text-[9px] text-zinc-700 font-mono">HERMES v0.3.0</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}