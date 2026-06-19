'use client';

import { useRef, useEffect, useState, useCallback, Suspense } from 'react';
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
  MonitorDot,
} from 'lucide-react';
import { HERMES_VERSION } from '@/lib/constants';

// Dynamic import for 3D components (avoid SSR issues with Three.js)
const Agent3DSandbox = dynamic(
  () => import('./agent-3d-sandbox').then(m => ({ default: m.Agent3DSandbox })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square max-w-[560px] mx-auto rounded-2xl border border-amber-500/[0.08] bg-[#0d0906] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          </div>
          <span className="text-xs text-amber-700/50 font-mono">Initializing 3D environment...</span>
        </div>
      </div>
    ),
  }
);

// ─── State Configuration ─────────────────────────────────────────────
const STATE_ICONS: Record<AgentVisualState, string> = {
  idle: '💤', thinking: '🧠', searching: '🔍', planning: '📋',
  executing: '⚡', verifying: '✅', celebrating: '🎉', error: '💥',
  evolving: '🧬', offline: '⚫',
};

const STATE_COLORS: Record<AgentVisualState, string> = {
  idle: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  thinking: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  searching: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  planning: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  executing: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  verifying: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  celebrating: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  error: 'bg-red-500/15 text-red-300 border-red-500/25',
  evolving: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25',
  offline: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
};

const STATE_DOT_COLORS: Record<AgentVisualState, string> = {
  idle: '#f59e0b', thinking: '#06b6d4', searching: '#fb923c',
  planning: '#c084fc', executing: '#f43f5e', verifying: '#34d399',
  celebrating: '#fde047', error: '#f87171', evolving: '#e879f9', offline: '#71717a',
};

const PHASE_STEPS = [
  { key: 'assess', label: 'ASSESS', color: 'text-cyan-400' },
  { key: 'plan', label: 'PLAN', color: 'text-violet-400' },
  { key: 'execute', label: 'EXECUTE', color: 'text-rose-400' },
  { key: 'verify', label: 'VERIFY', color: 'text-emerald-400' },
  { key: 'persist', label: 'PERSIST', color: 'text-amber-400' },
  { key: 'report', label: 'REPORT', color: 'text-sky-400' },
];

// ─── Activity Entry Component ────────────────────────────────────────
function ActivityEntry({ entry, isNew }: { entry: LiveActivityEntry; isNew: boolean }) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -16 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.02] transition-colors"
    >
      <span className="text-sm mt-0.5 shrink-0">
        {STATE_ICONS[entry.state] || '•'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-zinc-200 leading-relaxed break-all">
          {entry.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="h-2.5 w-2.5 text-zinc-600" />
          <span className="text-[10px] text-zinc-500 font-mono">{entry.timestampAR || '—'}</span>
          {entry.phase && (
            <span className="text-[9px] text-zinc-600 font-mono uppercase bg-white/[0.03] px-1.5 py-0.5 rounded">
              {entry.phase}
            </span>
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
    <div className="flex items-center gap-1 mt-2.5">
      {PHASE_STEPS.map((p, i) => {
        const isCompleted = currentIndex > i || (currentIndex === i && progress > 0.8);
        const isCurrent = currentIndex === i;
        return (
          <div key={p.key} className="flex items-center gap-1">
            <div
              className={`
                flex items-center justify-center w-7 h-7 rounded-md text-[9px] font-bold transition-all duration-500
                ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40' :
                  isCurrent ? `${p.color} bg-white/5 ring-1 ring-white/20 animate-pulse` :
                  'bg-white/[0.02] text-zinc-600 ring-1 ring-white/[0.05]'}
              `}
            >
              {isCompleted ? '✓' : p.label[0]}
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <div className={`w-4 h-px ${currentIndex > i ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`} />
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
    >
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-[10px] text-zinc-300 font-mono truncate max-w-[90px]">{name}</span>
      <span className="text-[10px]">{STATE_ICONS[state]}</span>
    </motion.div>
  );
}

// ─── Stat Card (with guaranteed min-height) ──────────────────────────
function StatCard({ icon: Icon, label, value, subtitle, iconColor }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle: string;
  iconColor: string;
}) {
  return (
    <Card className="border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors min-h-[80px]">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <span className="text-[11px] font-mono text-zinc-400 tracking-wider">{label}</span>
        </div>
        <div className="mt-2">
          <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
          <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
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
      setIsReplaying(false);
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
        replayTimerRef.current = undefined;
      }
    } else if (lastTurnActivities.length > 0) {
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
      <div className="flex flex-col gap-5">
        {/* 3D Sandbox Card */}
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          <CardContent className="p-4">
            {/* Connection status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/15">
                    <MonitorDot className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-mono text-amber-300 font-medium">LIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <WifiOff className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="text-xs font-mono text-zinc-600">OFFLINE</span>
                  </div>
                )}
              </div>
              <Badge variant="outline" className={`${STATE_COLORS[agentState]} text-xs px-3 py-1 font-medium`}>
                {STATE_ICONS[agentState]} {agentState.toUpperCase()}
              </Badge>
            </div>

            {/* 3D Sandbox */}
            <Agent3DSandbox />

            {/* Current message — more visible */}
            <div className="mt-4 text-center min-h-[2.5rem] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={message}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-zinc-300 italic leading-relaxed"
                >
                  &quot;{message}&quot;
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Wave phase tracker */}
            {waveNumber > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-amber-400 font-medium">WAVE {waveNumber}</span>
                  <span className="text-xs font-mono text-zinc-400 font-medium">{Math.round(progress * 100)}%</span>
                </div>
                <Progress value={progress * 100} className="h-2 bg-white/[0.05]" />
                <PhaseTracker phase={phase} progress={progress} />
              </div>
            )}

            {/* Sub-agents display */}
            {subAgents.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Users className="h-4 w-4 text-fuchsia-400" />
                  <span className="text-xs font-mono text-zinc-400 font-medium">SUB-AGENTS ({subAgents.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
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

        {/* Stats Grid — guaranteed height */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Sparkles}
            label="LEVEL"
            value={level}
            subtitle={levelName}
            iconColor="text-amber-400"
          />
          <StatCard
            icon={Waves}
            label="WAVES"
            value={waveCount}
            subtitle="Cycles completed"
            iconColor="text-cyan-400"
          />
          <StatCard
            icon={TrendingUp}
            label="IMPROVEMENTS"
            value={totalImprovements}
            subtitle="Improvements applied"
            iconColor="text-emerald-400"
          />
          <StatCard
            icon={Brain}
            label="DECISIONS"
            value={totalDecisions}
            subtitle="Decisions made"
            iconColor="text-violet-400"
          />
        </div>

        {/* XP Bar */}
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-mono text-zinc-400 font-medium tracking-wider">EXPERIENCE</span>
              </div>
              <span className="text-xs font-mono text-zinc-500 tabular-nums">{xp} / {xpToNext} XP</span>
            </div>
            <Progress value={xpPercent} className="h-2.5 bg-white/[0.05]" />
            <p className="text-[10px] text-zinc-600 mt-1.5 font-mono">Next: {levelName} → {getLevelName(level + 1)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Right Column: Live Activity Feed ─── */}
      <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex flex-col">
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-zinc-200">LIVE ACTIVITY</span>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            )}
            <span className="text-xs text-zinc-500 font-mono">{activities.length} events</span>
          </div>
        </div>

        <ScrollArea className="flex-1 h-[420px] lg:h-[540px]" ref={feedRef}>
          <div className="p-2 space-y-1" aria-live="polite" aria-label="Agent activity feed">
            <AnimatePresence initial={false}>
              {displayActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Circle className="h-10 w-10 text-zinc-800 mb-4" />
                  <p className="text-sm text-zinc-500">Waiting for agent activity...</p>
                  <p className="text-xs text-zinc-600 mt-2 max-w-[260px]">
                    Updates will appear here when the cron executes an evolution wave
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
        <div className="px-5 py-3 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-500/40" />
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider">SPEC-DRIVEN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500/40" />
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider">AUTO-EVOLUTION</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastTurnActivities.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleReplay}
                  aria-label={isReplaying ? 'Pause replay' : 'Replay last wave'}
                  className={`h-7 px-3 text-xs gap-1.5 ${
                    isReplaying
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  {isReplaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span className="font-mono">⟳ REPLAY</span>
                </Button>
              )}
              <span className="text-[10px] text-zinc-700 font-mono">HERMES {HERMES_VERSION}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────
const LEVEL_NAMES: Record<number, string> = {
  1: 'Nascent',
  2: 'Apprentice',
  3: 'Operational',
  5: 'Specialist',
  8: 'Architect',
  12: 'Master',
  20: 'Transcendent',
};

function getLevelName(level: number): string {
  let name = 'Nascent';
  for (const [lvl, n] of Object.entries(LEVEL_NAMES).map(([k, v]) => [Number(k), v])) {
    if (level >= lvl) name = n;
  }
  return name;
}