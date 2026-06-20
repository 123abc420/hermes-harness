'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { TotalStats, GithubStatus } from '@/store/harness-store';
import { useAgentLiveStore } from '@/store/agent-live-store';

/* ── Hero Status Card ─────────────────────────────────── */
export function HeroStatusCard({
  stats,
  githubStatus,
  latestWave,
  firstWaveStart,
  waveVelocity,
  npmDeps,
  healthScore,
  healthScoreTrend,
  healthBreakdown,
  isLoading,
}: {
  stats?: TotalStats;
  githubStatus?: GithubStatus;
  latestWave?: { status: string; summary?: string | null; waveNumber?: number };
  firstWaveStart?: string;
  waveVelocity?: string | null;
  npmDeps?: number;
  healthScore?: number;
  healthScoreTrend?: 'up' | 'down' | 'stable';
  healthBreakdown?: { spec: number; success: number; errors: number; github: number };
  isLoading: boolean;
}) {
  const agentState = useAgentLiveStore(s => s.agentState);
  const isAgentLive = useAgentLiveStore(s => s.isConnected);

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isConnected = githubStatus?.status === 'connected';

  const isActive = isAgentLive && ['thinking', 'searching', 'planning', 'executing', 'verifying', 'evolving'].includes(agentState);
  const isIdle = !isAgentLive || agentState === 'idle';
  const stateLabel = isAgentLive
    ? (agentState === 'celebrating' ? 'WAVE COMPLETE' : agentState === 'idle' ? 'STANDBY' : agentState.toUpperCase())
    : 'OFFLINE';

  // Pre-compute className strings to avoid nested template literal parsing issues
  const circleClass = [
    'relative flex h-12 w-12 items-center justify-center rounded-full border',
    isActive ? 'border-emerald-500/30 bg-emerald-500/10'
      : isIdle ? 'border-zinc-600/30 bg-zinc-500/5'
        : 'border-amber-500/30 bg-amber-500/10',
  ].join(' ');

  const iconClass = [
    'h-5 w-5',
    isActive ? 'text-emerald-400' : isIdle ? 'text-zinc-500' : 'text-amber-400',
  ].join(' ');

  const badgeClass = [
    'hidden rounded-md px-2 py-0.5 text-[10px] font-mono font-medium sm:inline',
    isActive ? 'bg-emerald-500/10 text-emerald-400'
      : isIdle ? 'bg-zinc-500/10 text-zinc-500'
        : 'bg-amber-500/10 text-amber-400',
  ].join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="gradient-border overflow-hidden border-0 bg-white/[0.02]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
                )}
                <div className={circleClass}>
                  <Activity className={iconClass} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                    HERMES HARNESS
                  </h2>
                  {healthScore !== undefined && (
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold tabular-nums ${
                      healthScore >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      healthScore >= 70 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {healthScoreTrend === 'up' && <span className="text-[8px]">&#9650;</span>}
                      {healthScoreTrend === 'down' && <span className="text-[8px] opacity-70">&#9660;</span>}
                      {healthScoreTrend === 'stable' && <span className="text-[6px] opacity-50">&#9679;</span>}
                      {healthScore}/100
                    </span>
                  )}
                  <span className={badgeClass}>
                    {stateLabel}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zinc-500">
                  <span>{stats?.totalWaves ?? 0} waves</span>
                  <span className="text-zinc-700">·</span>
                  <span>{stats?.totalDecisions ?? 0} decisions</span>
                  <span className="text-zinc-700">·</span>
                  <span>{stats?.totalImprovements ?? 0} improvements</span>
                  {firstWaveStart && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-600">
                        running for {formatDistanceToNow(new Date(firstWaveStart), { addSuffix: false })}
                      </span>
                    </>
                  )}
                  {waveVelocity && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-600">{waveVelocity} waves/hr</span>
                    </>
                  )}
                  {npmDeps !== undefined && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-600">{npmDeps} deps</span>
                    </>
                  )}
                </div>
                {healthBreakdown && (
                  <div className="mt-2 flex items-center gap-3">
                    {([['S', healthBreakdown.spec, 40, 'bg-violet-400'], ['R', healthBreakdown.success, 30, 'bg-emerald-400'], ['E', healthBreakdown.errors, 20, 'bg-rose-400'], ['G', healthBreakdown.github, 10, 'bg-sky-400']] as const).map(([label, val, max, color]) => (
                      <div key={label} className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-zinc-600 w-2">{label}</span>
                        <div className="h-1 w-12 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.round((val / max) * 100)}%` }} />
                        </div>
                        <span className="text-[8px] font-mono tabular-nums text-zinc-600">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
                {latestWave && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                      latestWave.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : latestWave.status === 'interrupted'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        latestWave.status === 'completed' ? 'bg-emerald-400' : latestWave.status === 'interrupted' ? 'bg-amber-400' : 'bg-blue-400 animate-pulse'
                      }`} />
                      W{latestWave.waveNumber} {latestWave.status}
                    </span>
                    {latestWave.summary && (
                      <span className="truncate max-w-[280px] text-[10px] text-zinc-600">
                        {latestWave.summary}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {githubStatus && (
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  isConnected
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                    : 'border-white/[0.06] bg-white/[0.02] text-zinc-500'
                }`}
              >
                <Github className="h-3.5 w-3.5" />
                {isConnected
                  ? `@${githubStatus.username}/${githubStatus.repoName}`
                  : 'Not Connected'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}