'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import {
  TrendingDown,
  AlertTriangle,
  GitCommitHorizontal,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Wave, DashboardData } from '@/store/harness-store';
import { CHART_TOOLTIP_STYLE } from '@/lib/constants';
import { HeroStatusCard } from './hero-status-card';
import { QuickMetricsChart } from './quick-metrics-chart';
import { WaveDurationBars } from './wave-duration-bars';
import { SpecComplianceCard } from './spec-compliance-card';
import { MilestonesTimeline } from './milestones-timeline';
import { StatsGrid } from './stats-grid';
import { MiniWaveTimeline } from './mini-wave-timeline';

/* ── Error Trend Sparkline ───────────────────────────── */
function ErrorTrendChart({ errorTrend }: { errorTrend?: DashboardData['errorTrend'] }) {
  if (!errorTrend?.length) return null;

  const trend = errorTrend;
  const totalErrors = trend.reduce((s, t) => s + t.errors, 0);
  const recentErrors = trend.slice(-3).reduce((s, t) => s + t.errors, 0);
  const isTrendingDown = recentErrors <= (trend.slice(-6, -3).reduce((s, t) => s + t.errors, 0) || 1);

  const chartData = trend.map((t) => ({ wave: `W${t.wave}`, errors: t.errors }));

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Error Rate Trend
          </CardTitle>
          <div className={`flex items-center gap-1 text-xs ${isTrendingDown ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isTrendingDown ? (
              <>
                <TrendingDown className="h-3 w-3" />
                <span>Decreasing</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                <span>Monitor</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-zinc-100">{totalErrors}</span>
          <span className="text-xs text-zinc-500">total errors across {trend.length} waves</span>
        </div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="wave" tick={{ fontSize: 9, fill: '#71717a' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#71717a' }} allowDecimals={false} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Area type="stepAfter" dataKey="errors" stroke="#ef4444" fill="url(#errorGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Recent Commits ──────────────────────────────────── */
function RecentCommitsCard({ commits }: { commits?: { sha: string; message: string }[] }) {
  if (!commits?.length) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Recent Commits
            </CardTitle>
          </div>
          <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-500">
            {commits.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {commits.map((c) => (
          <div key={c.sha} className="flex items-start gap-2.5">
            <code className="mt-0.5 shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-cyan-400/80">
              {c.sha}
            </code>
            <span className="truncate text-xs text-zinc-400">{c.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ── Overview Tab ─────────────────────────────────────── */
export function OverviewTab() {
  const { data: dash, isLoading, isError, error, refetch } = useHarnessDashboard();

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

      {/* Three-column: Spec Compliance + Metrics Chart + Recent Commits */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
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
          <ErrorTrendChart errorTrend={dash?.errorTrend} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {isLoading ? (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </CardContent>
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
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <MilestonesTimeline waves={waves} totalWaves={stats?.totalWaves ?? 0} skillsCount={dash?.skillsCount} />
        )}
      </motion.div>

      {/* Wave Duration + Recent Activity */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42 }}
        >
          {isLoading ? (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-3 w-8 rounded" />
                    <Skeleton className="h-3 flex-1 rounded-full" />
                    <Skeleton className="h-3 w-10 rounded" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <WaveDurationBars waves={waves} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.48 }}
        >
          {isLoading ? (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <MiniWaveTimeline waves={waves} />
          )}
        </motion.div>
      </div>
    </div>
  );
}