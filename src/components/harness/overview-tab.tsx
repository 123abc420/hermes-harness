'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroStatusCard } from './hero-status-card';
import { QuickMetricsChart } from './quick-metrics-chart';
import { WaveDurationBars } from './wave-duration-bars';
import { SpecComplianceCard } from './spec-compliance-card';
import { MilestonesTimeline } from './milestones-timeline';
import { StatsGrid } from './stats-grid';
import { MiniWaveTimeline } from './mini-wave-timeline';
import { ErrorTrendChart } from './error-trend-chart';
import { RecentCommitsCard } from './recent-commits-card';
import { BuildHealthCard } from './build-health-card';

/* ── Overview Tab ─────────────────────────────────────── */
export function OverviewTab() {
  const { data: dash, isLoading, isError, refetch } = useHarnessDashboard();

  const stats = dash?.totalStats;
  const waves = dash?.waves ?? [];
  const githubStatus = dash?.githubStatus;
  const firstWave = waves.length > 0 ? waves[waves.length - 1] : undefined;
  const recentCommits = githubStatus?.recentCommits;

  // Compute wave velocity (waves per hour from first to last wave)
  const waveVelocity = waves.length >= 2 && firstWave?.startedAt && waves[0]?.startedAt
    ? (waves.length / ((new Date(waves[0].startedAt).getTime() - new Date(firstWave.startedAt).getTime()) / 3_600_000)).toFixed(1)
    : null;

  // Compute dynamic error trend for spec compliance
  const errorTrend = dash?.errorTrend;
  const isErrorsDecreasing = errorTrend && errorTrend.length >= 6
    ? errorTrend.slice(-3).reduce((s, t) => s + t.errors, 0) <= errorTrend.slice(-6, -3).reduce((s, t) => s + t.errors, 0)
    : errorTrend && errorTrend.length >= 2
      ? errorTrend[errorTrend.length - 1].errors <= errorTrend[errorTrend.length - 2].errors
      : undefined;

  // Extract npm_dependencies from metrics
  const npmDep = dash?.metrics?.find(m => m.metricKey === 'npm_dependencies');

  return (
    <div className="space-y-6">
      {isError && !isLoading && (
        <Card className="border-red-500/10 bg-red-500/[0.03]">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400/70 shrink-0" />
            <span className="text-sm text-red-400/80 flex-1">Failed to load dashboard data</span>
            <button onClick={() => refetch()} className="text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
              Retry
            </button>
          </CardContent>
        </Card>
      )}

      {/* Hero Status Card */}
      <HeroStatusCard stats={stats} githubStatus={githubStatus} latestWave={waves[0]} firstWaveStart={firstWave?.startedAt} waveVelocity={waveVelocity} npmDeps={npmDep?.metricValue} healthScore={dash?.healthScore} healthScoreTrend={dash?.healthScoreTrend} isLoading={isLoading} />

      {/* Stats Grid */}
      <StatsGrid stats={stats} metrics={dash?.metrics} waves={waves} />

      {/* Four-column: Spec Compliance + Quick Metrics + Error Trend + Recent Commits */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SpecComplianceCard skillsCount={dash?.skillsCount} errorTrendDecreasing={isErrorsDecreasing} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <QuickMetricsChart metrics={dash?.metrics} isLoading={isLoading} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ErrorTrendChart errorTrend={dash?.errorTrend} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          {isLoading ? (
            <Card className="glass-card">
              <div className="p-4">
                <Skeleton className="mb-3 h-4 w-28" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <RecentCommitsCard commits={recentCommits} />
          )}
        </motion.div>
      </div>

      {/* Evolution Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        {isLoading ? (
          <Card className="glass-card">
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-36" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <MilestonesTimeline waves={waves} totalWaves={stats?.totalWaves ?? 0} skillsCount={dash?.skillsCount} />
        )}
      </motion.div>

      {/* Wave Duration + Recent Activity + Build Health */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42 }}
        >
          {isLoading ? (
            <Card className="glass-card">
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-28" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-3 w-8 rounded" />
                    <Skeleton className="h-3 flex-1 rounded-full" />
                    <Skeleton className="h-3 w-10 rounded" />
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <WaveDurationBars waves={waves} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.46 }}
        >
          {isLoading ? (
            <Card className="glass-card">
              <div className="p-4 space-y-4">
                <Skeleton className="h-4 w-28" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <MiniWaveTimeline waves={waves} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.50 }}
        >
          <BuildHealthCard health={dash?.buildHealth} isLoading={isLoading} />
        </motion.div>
      </div>
    </div>
  );
}