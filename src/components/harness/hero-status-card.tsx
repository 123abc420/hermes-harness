'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { TotalStats, GithubStatus } from '@/store/harness-store';

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
  isLoading: boolean;
}) {
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
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                    HARNESS ACTIVE
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
                  <span className="hidden rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 sm:inline">
                    LIVE
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {stats?.totalWaves ?? 0} waves executed &middot;{' '}
                  {stats?.totalDecisions ?? 0} decisions &middot;{' '}
                  {stats?.totalImprovements ?? 0} improvements
                  {firstWaveStart && (
                    <>
                      {' '}&middot;{' '}
                      <span className="text-zinc-600">
                        running for {formatDistanceToNow(new Date(firstWaveStart), { addSuffix: false })}
                      </span>
                    </>
                  )}
                  {waveVelocity && (
                    <>
                      {' '}&middot;{' '}
                      <span className="text-zinc-600">{waveVelocity} waves/hr</span>
                    </>
                  )}
                  {npmDeps !== undefined && (
                    <>
                      {' '}&middot;{' '}
                      <span className="text-zinc-600">{npmDeps} deps</span>
                    </>
                  )}
                </p>
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