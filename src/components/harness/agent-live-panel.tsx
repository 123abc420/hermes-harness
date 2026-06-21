'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAgentLiveStore, type LiveActivityEntry } from '@/store/agent-live-store';
import { useWaves, useDecisions } from '@/hooks/use-harness-data';
import { useWaveReplay } from '@/hooks/use-wave-replay';
import { useNextWaveCountdown } from '@/hooks/use-next-wave-countdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  WifiOff, Zap, Brain, TrendingUp, Waves, Shield, Sparkles,
  MonitorDot, CheckCircle2, FileCode2, Play, Pause, Activity, Circle, Terminal,
} from 'lucide-react';
import { getLevelName, HERMES_VERSION } from '@/lib/constants';
import { CATEGORY_TW } from '@/lib/category-colors';
import { AgentAvatarCanvas } from './agent-avatar-canvas';
import { PhaseTracker, STATE_ICONS, STATE_COLORS } from './agent-live-subcomponents';

// ─── Activity Entry ──────────────────────────────────────────────────
function ActivityEntry({ entry, isNew }: { entry: LiveActivityEntry; isNew: boolean }) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -12 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors"
    >
      <span className="text-sm mt-0.5 shrink-0">{STATE_ICONS[entry.state] || '•'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-zinc-200 leading-relaxed break-all">{entry.message}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-zinc-600 font-mono">{entry.timestampAR || '—'}</span>
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

// ─── Main Panel ──────────────────────────────────────────────────────
export function AgentLivePanel() {
  const {
    agentState, message, phase, waveNumber, progress, isConnected,
    waveCount, totalImprovements, totalDecisions, recentSuccessRate,
    healthScore, healthScoreTrend, level, levelName, xp, xpToNext,
    activities, subAgents,
  } = useAgentLiveStore();

  const { isReplaying, lastTurnActivities, toggleReplay } = useWaveReplay();
  const { data: latestWavesData, isError: wavesError } = useWaves(1, 1);
  const latestWave = latestWavesData?.waves?.[0] ?? null;
  const { data: recentDecisionsData, isError: decisionsError } = useDecisions(1, 3);
  const recentDecisions = recentDecisionsData?.decisions ?? [];
  const countdownMin = useNextWaveCountdown(waveNumber, latestWave);

  const hasData = isConnected || activities.length > 0 || waveCount > 0;
  const xpPercent = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="flex flex-col lg:flex-row gap-0 -mx-4 -mt-1 sm:-mx-6 sm:-mt-2">
      {/* ═══ LEFT: CANVAS + HUD OVERLAYS (60% desktop, full mobile) ═══ */}
      <div className="relative flex-1 lg:flex-[3] min-h-[55vh] lg:min-h-0 lg:h-[calc(100vh-220px)] overflow-hidden rounded-none lg:rounded-l-xl">
        {/* Canvas fills entire area */}
        <div className="absolute inset-0">
          <AgentAvatarCanvas />
        </div>

        {/* ── HUD: Top Bar ── */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            {/* Live/Offline badge */}
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span className="text-xs font-mono text-amber-300 font-semibold tracking-wider">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-zinc-700/30">
                <WifiOff className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs font-mono text-zinc-500 font-medium">OFFLINE</span>
              </div>
            )}

            {/* State badge */}
            <Badge
              variant="outline"
              className={`${STATE_COLORS[agentState]} text-xs px-3 py-1.5 font-semibold backdrop-blur-md bg-black/30 border-opacity-50`}
            >
              {STATE_ICONS[agentState]} {agentState.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Wave indicator */}
            {waveNumber > 0 && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.06]">
                <span className="text-xs font-mono text-amber-400 font-bold">WAVE {waveNumber}</span>
                <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500/70 transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-zinc-400 tabular-nums">{Math.round(progress * 100)}%</span>
              </div>
            )}
            {/* Level badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.06]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-mono text-amber-300 font-bold">LV.{level}</span>
              <span className="hidden sm:inline text-[10px] font-mono text-zinc-400">{levelName}</span>
            </div>
          </div>
        </div>

        {/* ── HUD: Phase Tracker (shown during active wave) ── */}
        {waveNumber > 0 && (
          <div className="absolute bottom-[72px] sm:bottom-20 left-1/2 -translate-x-1/2 z-10">
            <PhaseTracker phase={phase} progress={progress} />
          </div>
        )}

        {/* ── HUD: Bottom Bar (message + stats) ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Message bar */}
          <div className="px-4 sm:px-6 pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/[0.06] max-w-xl"
              >
                <p className="text-sm text-zinc-200 italic leading-relaxed truncate">
                  &ldquo;{message}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Compact stats strip */}
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Health */}
              {healthScore >= 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06]">
                  <Shield className="h-3 w-3 text-zinc-500" />
                  <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        healthScore >= 90 ? 'bg-emerald-500/70' :
                        healthScore >= 70 ? 'bg-amber-500/70' : 'bg-red-500/70'
                      }`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono font-bold tabular-nums ${
                    healthScore >= 90 ? 'text-emerald-400' :
                    healthScore >= 70 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {healthScoreTrend === 'up' && <span className="text-[8px]">&#9650;</span>}
                    {healthScoreTrend === 'down' && <span className="text-[8px] opacity-70">&#9660;</span>}
                    {healthScore}
                  </span>
                </div>
              )}

              {/* XP bar */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06]">
                <Zap className="h-3 w-3 text-amber-500/60" />
                <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500/60 transition-all duration-500" style={{ width: `${xpPercent}%` }} />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 tabular-nums">{xp}/{xpToNext}</span>
              </div>

              {/* Waves */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06]">
                <Waves className="h-3 w-3 text-cyan-500/60" />
                <span className="text-[10px] font-mono text-zinc-300 font-bold tabular-nums">{waveCount}</span>
                <span className="text-[10px] font-mono text-zinc-600">waves</span>
              </div>

              {/* Improvements */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06]">
                <TrendingUp className="h-3 w-3 text-emerald-500/60" />
                <span className="text-[10px] font-mono text-zinc-300 font-bold tabular-nums">{totalImprovements}</span>
              </div>

              {/* Decisions */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06]">
                <Brain className="h-3 w-3 text-violet-500/60" />
                <span className="text-[10px] font-mono text-zinc-300 font-bold tabular-nums">{totalDecisions}</span>
              </div>

              {/* Standby countdown */}
              {waveNumber === 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500/30 animate-ping" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {countdownMin !== null ? `Next wave ~${countdownMin}m` : 'Awaiting wave'}
                  </span>
                </div>
              )}

              {/* Sub-agents */}
              {subAgents.length > 0 && (
                <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                  {subAgents.map(sa => (
                    <div key={sa.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.06]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sa.color, boxShadow: `0 0 6px ${sa.color}` }} />
                      <span className="text-[9px] font-mono text-zinc-300">{sa.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Activity Feed + Details (40% desktop, below mobile) ═══ */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col border-l border-white/[0.06] bg-white/[0.015] backdrop-blur-sm rounded-none lg:rounded-r-xl">
        {/* Feed header */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-zinc-200">Activity</span>
            <span className="text-xs text-zinc-500 font-mono">{activities.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            )}
            {lastTurnActivities.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleReplay}
                className={`h-7 px-2 text-xs gap-1 ${
                  isReplaying
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                {isReplaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span className="font-mono text-[10px]">REPLAY</span>
              </Button>
            )}
          </div>
        </div>

        {/* Feed list */}
        <ScrollArea className="flex-1 h-[250px] sm:h-[350px] lg:h-auto">
          <div className="p-2 space-y-0.5" role="list" aria-label="Agent activity feed">
            <AnimatePresence initial={false}>
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <Circle className="h-12 w-12 text-zinc-800 mb-4" />
                  <p className="text-sm text-zinc-500 mb-1">Waiting for agent activity...</p>
                  <p className="text-xs text-zinc-600 max-w-[260px]">
                    Live updates appear here when the agent executes evolution waves
                  </p>
                </div>
              ) : (
                (isReplaying ? activities.slice(0, 30) : activities).map((entry, i) => (
                  <ActivityEntry key={entry.id} entry={entry} isNew={i === 0} />
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Bottom details */}
        <div className="border-t border-white/[0.06] shrink-0">
          {/* Last Wave */}
          {wavesError ? (
            <div className="px-4 py-3 flex items-center gap-2">
              <WifiOff className="h-3.5 w-3.5 text-red-400/70 shrink-0" />
              <span className="text-[11px] text-red-400/70 font-mono">Unable to load wave data</span>
            </div>
          ) : latestWave ? (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono text-zinc-400 tracking-wider">LAST WAVE</span>
                <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0 text-emerald-400/70 border-emerald-500/20">
                  #{latestWave.waveNumber}
                </Badge>
              </div>
              {latestWave.summary && (
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{latestWave.summary}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-zinc-500 font-mono">
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
            </div>
          ) : null}

          {/* Recent Decisions */}
          {!decisionsError && recentDecisions.length > 0 && (
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[11px] font-mono text-zinc-400 tracking-wider">RECENT DECISIONS</span>
              </div>
              <div className="space-y-1.5">
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
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3 text-amber-500/30" />
              <span className="text-[10px] font-mono text-zinc-600">HERMES {HERMES_VERSION}</span>
            </div>
            <span className="text-[10px] text-zinc-700 font-mono">SPEC-DRIVEN</span>
          </div>
        </div>
      </div>
    </div>
  );
}