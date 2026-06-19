'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentAvatarCanvas, type AgentVisualState } from './agent-avatar-canvas';
import { useAgentLiveStore, type LiveActivityEntry } from '@/store/agent-live-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';

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

const PHASE_STEPS = [
  { key: 'assess', label: 'ASSESS', color: 'text-cyan-400' },
  { key: 'plan', label: 'PLAN', color: 'text-violet-400' },
  { key: 'execute', label: 'EXECUTE', color: 'text-rose-400' },
  { key: 'verify', label: 'VERIFY', color: 'text-emerald-400' },
  { key: 'persist', label: 'PERSIST', color: 'text-amber-400' },
  { key: 'report', label: 'REPORT', color: 'text-blue-400' },
];

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

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
        <span className="text-[9px] text-zinc-600 font-mono">{formatTime(entry.timestamp)}</span>
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

// ─── Main Panel ──────────────────────────────────────────────────────
export function AgentLivePanel() {
  const {
    agentState, message, phase, waveNumber, progress, isConnected,
    waveCount, totalImprovements, totalDecisions, level, levelName, xp, xpToNext,
    activities,
  } = useAgentLiveStore();

  const feedRef = useRef<HTMLDivElement>(null);
  const prevActivityCount = useRef(0);

  // Auto-scroll feed
  useEffect(() => {
    if (activities.length > prevActivityCount.current && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
    prevActivityCount.current = activities.length;
  }, [activities.length]);

  const xpPercent = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── Left Column: Avatar + Stats ─── */}
      <div className="flex flex-col gap-4">
        {/* Avatar Card */}
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            {/* Connection status */}
            <div className="flex items-center justify-between mb-4">
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

            {/* Avatar Canvas */}
            <div className="flex justify-center py-4">
              <div className="relative">
                <AgentAvatarCanvas size={280} interactive={true} showLabel={true} />
                {/* Pulse ring behind avatar */}
                <div className={`absolute inset-0 rounded-full animate-ping opacity-5 ${
                  agentState === 'executing' ? 'bg-rose-500' :
                  agentState === 'thinking' ? 'bg-cyan-500' :
                  agentState === 'celebrating' ? 'bg-yellow-500' :
                  'bg-emerald-500'
                }`} style={{ animationDuration: '3s' }} />
              </div>
            </div>

            {/* Current message */}
            <div className="mt-2 text-center">
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
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Level Card */}
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-[10px] font-mono text-zinc-500">NIVEL</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white">{level}</span>
                <span className="text-[10px] text-zinc-500">{levelName}</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] text-zinc-600">XP</span>
                  <span className="text-[9px] text-zinc-600">{xp}/{xpToNext}</span>
                </div>
                <Progress value={xpPercent} className="h-1 bg-white/[0.05]" />
              </div>
            </CardContent>
          </Card>

          {/* Waves Card */}
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Waves className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[10px] font-mono text-zinc-500">OLAS</span>
              </div>
              <span className="text-2xl font-bold text-white">{waveCount}</span>
              <p className="text-[9px] text-zinc-600 mt-1">Ciclos completados</p>
            </CardContent>
          </Card>

          {/* Improvements Card */}
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono text-zinc-500">MEJORAS</span>
              </div>
              <span className="text-2xl font-bold text-white">{totalImprovements}</span>
              <p className="text-[9px] text-zinc-600 mt-1">Mejoras aplicadas</p>
            </CardContent>
          </Card>

          {/* Decisions Card */}
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[10px] font-mono text-zinc-500">DECISIONES</span>
              </div>
              <span className="text-2xl font-bold text-white">{totalDecisions}</span>
              <p className="text-[9px] text-zinc-600 mt-1">Decisiones tomadas</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Right Column: Live Activity Feed ─── */}
      <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex flex-col">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-zinc-300">ACTIVIDAD EN VIVO</span>
          </div>
          <div className="flex items-center gap-1.5">
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
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Circle className="h-8 w-8 text-zinc-800 mb-3" />
                  <p className="text-xs text-zinc-600">Esperando actividad del agente...</p>
                  <p className="text-[10px] text-zinc-700 mt-1">
                    Las actualizaciones aparecerán aquí cuando el cron ejecute una ola
                  </p>
                </div>
              ) : (
                activities.map((entry, i) => (
                  <ActivityEntry key={entry.id} entry={entry} isNew={i === 0} />
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer bar */}
        <div className="px-4 py-2.5 border-t border-white/[0.06] shrink-0 flex items-center justify-between">
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
          <span className="text-[9px] text-zinc-700 font-mono">HERMES v0.2.0</span>
        </div>
      </Card>
    </div>
  );
}