'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { useWaves, useDecisions } from '@/hooks/use-harness-data';
import { useWaveReplay } from '@/hooks/use-wave-replay';
import { useNextWaveCountdown } from '@/hooks/use-next-wave-countdown';
import { Card, CardContent } from '@/components/ui/card';
import { HarnessErrorBoundary } from './error-boundary';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  WifiOff, Zap, Brain, TrendingUp, Waves, Shield, Sparkles, MonitorDot, CheckCircle2, FileCode2, Users,
} from 'lucide-react';
import { getLevelName } from '@/lib/constants';
import { CATEGORY_TW } from '@/lib/category-colors';
import {
  ActivityFeedColumn, StatCard, PhaseTracker, SubAgentBadge, STATE_COLORS, STATE_ICONS,
} from './agent-live-subcomponents';

import { AgentAvatarCanvas } from './agent-avatar-canvas';

// ─── Main Panel ──────────────────────────────────────────────────────
export function AgentLivePanel() {
  const {
    agentState, message, phase, waveNumber, progress, isConnected,
    waveCount, totalImprovements, totalDecisions, recentSuccessRate, healthScore, healthScoreTrend,
    level, levelName, xp, xpToNext, activities, subAgents,
  } = useAgentLiveStore();

  // Extracted hooks
  const { isReplaying, lastTurnActivities, toggleReplay } = useWaveReplay();

  // Data fetching
  const { data: latestWavesData, isError: wavesError } = useWaves(1, 1);
  const latestWave = latestWavesData?.waves?.[0] ?? null;
  const { data: recentDecisionsData, isError: decisionsError } = useDecisions(1, 3);
  const recentDecisions = recentDecisionsData?.decisions ?? [];

  // Countdown
  const countdownMin = useNextWaveCountdown(waveNumber, latestWave);

  // Show skeleton until data arrives from SSE/store
  const hasData = isConnected || activities.length > 0 || waveCount > 0;

  const xpPercent = Math.min((xp / xpToNext) * 100, 100);

  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] h-[400px]" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] h-[80px]" />
            ))}
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] h-[60px]" />
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] h-[620px] flex flex-col">
          <div className="h-12 border-b border-white/[0.06] bg-white/[0.01]" />
          <div className="flex-1 p-2 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/[0.02]" />
            ))}
          </div>
          <div className="h-10 border-t border-white/[0.06] bg-white/[0.01]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── Left Column: 3D Avatar + Stats ─── */}
      <div className="flex flex-col gap-5">
        {/* 3D Sandbox Card — with animated state-color glow border */}
        <Card className={`relative border-0 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-700`}>
          {/* Animated glow border — color matches agent state */}
          <div
            className="pointer-events-none absolute inset-0 rounded-xl transition-all duration-700"
            style={{
              boxShadow: `inset 0 0 0 1px ${STATE_COLORS[agentState]}15, 0 0 20px -5px ${STATE_COLORS[agentState]}20`,
            }}
          />
          {/* Pulsing corner glow */}
          <div className="pointer-events-none absolute -top-px -left-px h-16 w-16 rounded-tl-xl opacity-40" style={{ background: `radial-gradient(circle at 0% 0%, ${STATE_COLORS[agentState]}30, transparent 70%)` }} />
          <div className="pointer-events-none absolute -bottom-px -right-px h-16 w-16 rounded-br-xl opacity-40" style={{ background: `radial-gradient(circle at 100% 100%, ${STATE_COLORS[agentState]}30, transparent 70%)` }} />
          <CardContent className="p-4 relative">
            {/* Connection status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/15">
                    <MonitorDot className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-mono text-amber-300 font-medium">LIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/15">
                    <WifiOff className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="text-xs font-mono text-zinc-600 font-medium">OFFLINE</span>
                  </div>
                )}
              </div>
              <Badge variant="outline" className={`${STATE_COLORS[agentState]} text-xs px-3 py-1 font-medium`}>
                {STATE_ICONS[agentState]} {agentState.toUpperCase()}
              </Badge>
            </div>

            {/* Avatar Canvas (2D — no heavy 3D deps) */}
            <AgentAvatarCanvas />

            {/* Current message */}
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

            {/* Wave phase tracker — active wave */}
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

            {/* Standby indicator */}
            {waveNumber === 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-500/30 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500/50" />
                </div>
                <span className="min-w-0 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">System Standby</span>
                <span className="text-[10px] font-mono text-zinc-700 ml-auto">
                  {countdownMin !== null ? `Next wave in ~${countdownMin}m` : 'Awaiting next wave'}
                </span>
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
                      <SubAgentBadge key={sa.id} name={sa.name} color={sa.color} state={sa.state} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Score Bar */}
        {healthScore >= 0 && (
          <div className="flex items-center gap-3 px-1">
            <Shield className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <span className="text-[10px] font-mono text-zinc-500 tracking-wider shrink-0">HEALTH</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  healthScore >= 90 ? 'bg-emerald-500/70' :
                  healthScore >= 70 ? 'bg-amber-500/70' :
                  'bg-red-500/70'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className={`text-[11px] font-mono font-bold tabular-nums shrink-0 ${
              healthScore >= 90 ? 'text-emerald-400' :
              healthScore >= 70 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {healthScoreTrend === 'up' && <span className="text-[8px] mr-0.5">&#9650;</span>}
              {healthScoreTrend === 'down' && <span className="text-[8px] opacity-70 mr-0.5">&#9660;</span>}
              {healthScoreTrend === 'stable' && <span className="text-[6px] opacity-50 mr-0.5">&#9679;</span>}
              {healthScore}
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={Sparkles} label="LEVEL" value={level} subtitle={levelName} iconColor="text-amber-400" />
          <StatCard icon={Waves} label="WAVES" value={waveCount} subtitle={recentSuccessRate > 0 ? `${recentSuccessRate}% success rate` : 'Cycles completed'} iconColor="text-cyan-400" />
          <StatCard icon={TrendingUp} label="IMPROVEMENTS" value={totalImprovements} subtitle="Improvements applied" iconColor="text-emerald-400" />
          <StatCard icon={Brain} label="DECISIONS" value={totalDecisions} subtitle="Decisions made" iconColor="text-violet-400" />
        </div>

        {/* Last Wave Summary */}
        {wavesError ? (
          <Card className="border-red-500/10 bg-red-500/[0.03]">
            <CardContent className="p-4 flex items-center gap-2">
              <WifiOff className="h-3.5 w-3.5 text-red-400/70 shrink-0" />
              <span className="text-[11px] text-red-400/70 font-mono">Unable to load wave data</span>
            </CardContent>
          </Card>
        ) : latestWave && (
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono text-zinc-400 tracking-wider">LAST WAVE</span>
                <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0 text-emerald-400/70 border-emerald-500/20">
                  #{latestWave.waveNumber}
                </Badge>
              </div>
              {latestWave.summary && (
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{latestWave.summary}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-zinc-500 font-mono">
                <span>{latestWave.decisionsCount} decisions</span>
                <span className="text-zinc-700">|</span>
                <span>{latestWave.improvementsCount} improvements</span>
                {latestWave.errorsCount > 0 && (
                  <>
                    <span className="text-zinc-700">|</span>
                    <span className="text-red-400/70">{latestWave.errorsCount} errors</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Decisions */}
        {decisionsError ? (
          <Card className="border-red-500/10 bg-red-500/[0.03]">
            <CardContent className="p-4 flex items-center gap-2">
              <WifiOff className="h-3.5 w-3.5 text-red-400/70 shrink-0" />
              <span className="text-[11px] text-red-400/70 font-mono">Unable to load decisions</span>
            </CardContent>
          </Card>
        ) : recentDecisions.length > 0 && (
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[11px] font-mono text-zinc-400 tracking-wider">RECENT DECISIONS</span>
              </div>
              <div className="space-y-2">
                {recentDecisions.map((d) => (
                  <div key={d.id} className="flex items-start gap-2">
                    <span className={`mt-0.5 shrink-0 inline-flex rounded px-1 py-0.5 text-[8px] font-mono font-medium ${
                      CATEGORY_TW[d.category] ?? 'bg-violet-500/10 text-violet-400'
                    }`}>
                      {d.category.replace('_', ' ')}
                    </span>
                    <p className="min-w-0 text-[11px] text-zinc-400 leading-relaxed line-clamp-1 flex-1">{d.description}</p>
                    {d.targetFile && (
                      <FileCode2 className="h-3 w-3 shrink-0 text-zinc-600 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* XP Bar */}
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-mono text-zinc-400 font-medium tracking-wider">EXPERIENCE</span>
              </div>
              <span className="text-xs font-mono text-zinc-500 tabular-nums">{xp} / {xpToNext} waves</span>
            </div>
            <Progress value={xpPercent} className="h-2.5 bg-white/[0.05]" />
            <p className="text-[10px] text-zinc-600 mt-1.5 font-mono">Next: {levelName} → {getLevelName(level + 1)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Right Column: Live Activity Feed (extracted component) ─── */}
      <ActivityFeedColumn
        activities={isReplaying ? activities.slice(0, 30) : activities}
        isConnected={isConnected}
        isReplaying={isReplaying}
        lastTurnLength={lastTurnActivities.length}
        onToggleReplay={toggleReplay}
      />
    </div>
  );
}