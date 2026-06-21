'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { TotalStats, GithubStatus } from '@/store/harness-store';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { cn } from '@/lib/utils';

/* ── Circular Progress Ring for Health Score ────────── */
function HealthRing({ score, trend }: { score: number; trend?: 'up' | 'down' | 'stable' }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center">
      <svg width={66} height={66} viewBox="0 0 66 66" className="shrink-0">
        {/* Background circle */}
        <circle cx="33" cy="33" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
        {/* Progress arc */}
        <circle
          cx="33" cy="33" r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 33 33)"
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 4px ${color}40)`,
          }}
        />
      </svg>
      {/* Score number centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold font-mono tabular-nums" style={{ color }}>{score}</span>
        {trend && (
          <span className="text-[8px] leading-none" style={{ color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#71717a' }}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── System Pulse Mini Visualization ─────────────────── */
function SystemPulse({ waves }: { waves: { startedAt: string; status: string }[] }) {
  // Take last 5 waves to show frequency
  const last5 = waves.slice(0, 5).reverse();
  if (last5.length < 2) return null;

  // Calculate time gaps between waves (in minutes)
  const gaps: number[] = [];
  for (let i = 1; i < last5.length; i++) {
    const gap = (new Date(last5[i].startedAt).getTime() - new Date(last5[i - 1].startedAt).getTime()) / 60_000;
    gaps.push(Math.min(gap, 60)); // Cap at 60 min for display
  }
  const maxGap = Math.max(...gaps, 1);

  // Add first and last as display bars (use wave status for color)
  const bars = last5.map((w, i) => {
    const h = i === 0 ? 0.5 : Math.max(0.2, 1 - (gaps[i - 1] / maxGap));
    const color = w.status === 'completed' ? '#10b981' : w.status === 'failed' ? '#ef4444' : '#f59e0b';
    return { h, color, delay: i * 0.15 };
  });

  return (
    <div className="flex items-center gap-0.5" aria-label="Wave frequency pulse">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-300"
          style={{
            height: `${Math.max(bar.h * 24, 4)}px`,
            backgroundColor: bar.color,
            opacity: 0.7,
            animation: `system-pulse ${1.5 + bar.delay}s ease-in-out ${bar.delay}s infinite`,
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  );
}

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
  waves,
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
  waves?: { startedAt: string; status: string }[];
}) {
  const agentState = useAgentLiveStore(s => s.agentState);
  const isAgentLive = useAgentLiveStore(s => s.isConnected);

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-white/[0.06] bg-white/[0.02] shimmer-card">
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

  // Pre-compute className via cn() for readability
  const circleClass = cn(
    'relative flex h-12 w-12 items-center justify-center rounded-full border',
    isActive ? 'border-emerald-500/30 bg-emerald-500/10'
      : isIdle ? 'border-zinc-600/30 bg-zinc-500/5'
        : 'border-amber-500/30 bg-amber-500/10',
  );

  const iconClass = cn(
    'h-5 w-5',
    isActive ? 'text-emerald-400' : isIdle ? 'text-zinc-500' : 'text-amber-400',
  );

  const badgeClass = cn(
    'hidden rounded-md px-2 py-0.5 text-[10px] font-mono font-medium sm:inline',
    isActive ? 'bg-emerald-500/10 text-emerald-400'
      : isIdle ? 'bg-zinc-500/10 text-zinc-500'
        : 'bg-amber-500/10 text-amber-400',
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="hero-glow-border overflow-hidden">
        <CardContent className="p-5 sm:p-6 relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Animated status indicator */}
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
                )}
                <div className={circleClass}>
                  <Activity className={iconClass} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                    HERMES HARNESS
                  </h2>
                  {/* Circular health score ring */}
                  {healthScore != null && typeof healthScore === 'number' && (
                    <HealthRing score={healthScore} trend={healthScoreTrend} />
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
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {([['S', healthBreakdown.spec, 40, 'bg-violet-400'], ['R', healthBreakdown.success, 30, 'bg-emerald-400'], ['E', healthBreakdown.errors, 20, 'bg-rose-400'], ['G', healthBreakdown.github, 10, 'bg-sky-400']] as const).map(([label, val, max, color]) => (
                      <div key={label} className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-zinc-600 w-2">{label}</span>
                        <div className="h-1 w-12 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.round((val / max) * 100)}%` }} />
                        </div>
                        <span className="text-[8px] font-mono tabular-nums text-zinc-600">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
                {latestWave && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium',
                      latestWave.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : latestWave.status === 'interrupted'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-blue-500/10 text-blue-400',
                    )}>
                      <span className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        latestWave.status === 'completed' ? 'bg-emerald-400' : latestWave.status === 'interrupted' ? 'bg-amber-400' : 'bg-blue-400 animate-pulse',
                      )} />
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

            {/* Right side: GitHub + System Pulse */}
            <div className="flex items-center gap-4">
              {/* System Pulse */}
              {waves && waves.length >= 2 && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">Pulse</span>
                  <SystemPulse waves={waves} />
                </div>
              )}
              {githubStatus && (
                <div
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
                    isConnected
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-500',
                  )}
                >
                  <Github className="h-3.5 w-3.5" />
                  {isConnected
                    ? `@${githubStatus.username}/${githubStatus.repoName}`
                    : 'Not Connected'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
