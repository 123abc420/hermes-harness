'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import {
  Brain,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Target,
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
import { formatDistanceToNow } from 'date-fns';
import type { Wave, TotalStats, GithubStatus, DashboardData, Metric } from '@/store/harness-store';
import { CHART_TOOLTIP_STYLE } from '@/lib/constants';
import { HeroStatusCard } from './hero-status-card';
import { QuickMetricsChart } from './quick-metrics-chart';
import { WaveDurationBars } from './wave-duration-bars';
import { SpecComplianceCard } from './spec-compliance-card';
import { MilestonesTimeline } from './milestones-timeline';

/* ── Tiny Sparkline ──────────────────────────────────── */
function Sparkline({ data, color = 'currentColor' }: {
  data: number[]; color?: string;
}) {
  if (data.length < 2) return null;
  const W = 120, H = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 2) - 1;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={H} className="shrink-0" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.7}
      />
    </svg>
  );
}

/* Helper: extract last N values from metrics array for a given key */
function metricHistory(metrics: Metric[] | undefined, key: string, n = 8): number[] {
  if (!metrics) return [];
  return metrics
    .filter(m => m.metricKey === key)
    .slice(0, n)
    .map(m => m.metricValue)
    .reverse();
}

/* ── Stat Card ────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  suffix,
  subLabel,
  delay = 0,
  sparkline,
  sparkColor,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  suffix?: string;
  subLabel?: string;
  delay?: number;
  sparkline?: number[];
  sparkColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="glass-card group transition-all hover:border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                {label}
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-white">
                {value ?? 0}{suffix ?? ''}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {sparkline && sparkline.length >= 2 ? (
            <div className="mt-2">
              <Sparkline data={sparkline} color={sparkColor ?? '#10b981'} />
            </div>
          ) : trend ? (
            <div className="mt-2 flex items-center gap-1 text-[10px]">
              {trend === 'up' && (
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              )}
              {trend === 'down' && (
                <AlertTriangle className="h-3 w-3 text-amber-400" />
              )}
              <span
                className={
                  trend === 'up'
                    ? 'text-emerald-400/70'
                    : trend === 'down'
                      ? 'text-amber-400/70'
                      : 'text-zinc-600'
                }
              >
                {trend === 'up'
                  ? 'Growing'
                  : trend === 'down'
                    ? 'Needs attention'
                    : 'Stable'}
              </span>
            </div>
          ) : null}
          {subLabel && (
            <p className="mt-1 text-[10px] text-zinc-600">{subLabel}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Stats Grid ───────────────────────────────────────── */
function StatsGrid({ stats, metrics, waves }: { stats?: TotalStats; metrics?: Metric[]; waves?: Wave[] }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-3 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Derive sparkline data from metrics history and wave arrays
  const wavesSparkline = metricHistory(metrics, 'waves_completed', 8);
  const decisionsSparkline = waves
    ? [...waves].reverse().slice(-8).map(w => w.decisionsCount)
    : [];
  const improvementsSparkline = waves
    ? [...waves].reverse().slice(-8).map(w => w.improvementsCount)
    : [];
  const errorsSparkline = waves
    ? [...waves].reverse().slice(-8).map(w => w.errorsCount ?? 0)
    : [];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      <StatCard
        label="Total Waves"
        value={stats.totalWaves}
        icon={Activity}
        color="bg-emerald-500/10 text-emerald-400"
        delay={0.05}
        sparkline={wavesSparkline}
        sparkColor="#10b981"
      />
      <StatCard
        label="Decisions"
        value={stats.totalDecisions}
        icon={Brain}
        color="bg-cyan-500/10 text-cyan-400"
        delay={0.1}
        sparkline={decisionsSparkline}
        sparkColor="#06b6d4"
      />
      <StatCard
        label="Improvements"
        value={stats.totalImprovements}
        icon={TrendingUp}
        color="bg-teal-500/10 text-teal-400"
        delay={0.15}
        sparkline={improvementsSparkline}
        sparkColor="#14b8a6"
      />
      <StatCard
        label="Success Rate"
        value={stats.waveSuccessRate}
        suffix="%"
        icon={Target}
        color="bg-violet-500/10 text-violet-400"
        trend={stats.waveSuccessRate >= 80 ? 'up' : 'down'}
        delay={0.2}
        subLabel={`Last 5: ${stats.recentSuccessRate ?? stats.waveSuccessRate}%`}
      />
      <StatCard
        label="Errors"
        value={stats.totalErrors}
        icon={AlertTriangle}
        color="bg-red-500/10 text-red-400"
        delay={0.25}
        sparkline={errorsSparkline}
        sparkColor="#ef4444"
      />
    </div>
  );
}

/* ── Wave Timeline (mini) ─────────────────────────────── */
function MiniWaveTimeline({ waves }: { waves: Wave[] }) {
  if (waves.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-sm text-zinc-600">No waves recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-72 space-y-0 overflow-y-auto scrollbar-dark px-5 pb-4">
          {waves.slice(0, 5).map((wave, i) => {
            const statusColor =
              wave.status === 'completed'
                ? 'border-emerald-500 bg-emerald-500/20'
                : wave.status === 'failed'
                  ? 'border-red-500 bg-red-500/20'
                  : wave.status === 'running'
                    ? 'border-amber-500 bg-amber-500/20'
                    : 'border-zinc-600 bg-zinc-600/20';

            return (
              <div key={wave.id} className="relative flex gap-3 py-3">
                {i < Math.min(waves.length, 5) - 1 && (
                  <div className="absolute left-[9px] top-6 h-full w-px bg-white/[0.06]" />
                )}
                <div
                  className={`relative z-10 mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full border-2 ${statusColor}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-white">
                      WAVE {wave.waveNumber}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono font-medium ${
                        wave.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : wave.status === 'failed'
                            ? 'bg-red-500/10 text-red-400'
                            : wave.status === 'running'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-zinc-500/10 text-zinc-400'
                      }`}
                    >
                      {wave.status.toUpperCase()}
                    </span>
                  </div>
                  {wave.summary && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {wave.summary}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    {wave._count?.decisions ?? wave.decisionsCount} decisions &middot;{' '}
                    {formatDistanceToNow(new Date(wave.startedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

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