'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import {
  Activity,
  Brain,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Check,
  Minus,
  Github,
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

/* ── Tiny Sparkline ──────────────────────────────────── */
function Sparkline({ data, color = 'currentColor', width = 64, height = 20 }: {
  data: number[]; color?: string; width?: number; height?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="shrink-0" viewBox={`0 0 ${width} ${height}`}>
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

const SPEC_CHECKLIST = (skillsCount?: number) => [
  { label: 'Spec-Driven Architecture', done: true },
  { label: 'Wave Lifecycle Protocol', done: true },
  { label: 'Decision Tracking System', done: true },
  { label: 'GitHub Persistence Layer', done: true },
  { label: 'Guardrails & Safety Rules', done: true },
  { label: 'Metrics & Observability', done: true },
  { label: 'Dashboard Control Plane', done: true },
  { label: 'Memory & Context System', done: true },
  { label: `Skills System (${skillsCount ?? '...'} skills)`, done: (skillsCount ?? 0) > 0 },
  { label: 'Export Contract (src/index.ts)', done: true },
  { label: 'Agent Live 3D (VRM walk + Chibi gestures)', done: true },
  { label: 'Cron Jobs (2 active)', done: true },
  { label: 'user_profile.md', done: true },
  { label: 'wave_protocol.md', done: true },
  { label: 'Turborepo Package Layout', done: true },
  { label: 'Error Rate Decreasing Trend', done: null as boolean | null },
];

/* ── Hero Status Card ─────────────────────────────────── */
function HeroStatusCard({
  stats,
  githubStatus,
  latestWave,
  firstWaveStart,
  waveVelocity,
  npmDeps,
  isLoading,
}: {
  stats?: TotalStats;
  githubStatus?: GithubStatus;
  latestWave?: { status: string; summary?: string | null; waveNumber?: number };
  firstWaveStart?: string;
  waveVelocity?: string | null;
  npmDeps?: number;
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
              {/* Pulsing status dot */}
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
                      <span className="text-zinc-600">
                        {waveVelocity} waves/hr
                      </span>
                    </>
                  )}
                  {npmDeps !== undefined && (
                    <>
                      {' '}&middot;{' '}
                      <span className="text-zinc-600">
                        {npmDeps} deps
                      </span>
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

            {/* GitHub badge */}
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
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }}
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

/* ── Quick Metrics Chart ──────────────────────────────── */
function QuickMetricsChart({ metrics, isLoading }: { metrics?: DashboardData['metrics']; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const metricData = metrics ?? [];

  const grouped = metricData.reduce<Record<string, typeof metricData>>((acc, m) => {
    (acc[m.metricKey] ??= []).push(m);
    return acc;
  }, {});

  const keys = Object.keys(grouped).sort(
    (a, b) => grouped[b].length - grouped[a].length
  );
  const primaryMetric = keys[0];

  const METRIC_LABELS: Record<string, string> = {
    api_routes: 'API Routes',
    github_commits: 'GitHub Commits',
    skills: 'Skills',
    waves_completed: 'Waves',
    lint_errors: 'Lint Errors',
    dead_files_removed: 'Dead Files Removed',
    station_sources: 'Station Sources',
    exported_types: 'Exported Types',
    spec_compliance_export: 'Spec Compliance',
    db_records: 'DB Records',
    npm_dependencies: 'NPM Dependencies',
  };

  const metricLabel = METRIC_LABELS[primaryMetric] ?? primaryMetric.replace(/_/g, ' ');

  if (!primaryMetric || grouped[primaryMetric].length < 2) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <div className="text-center">
            <Activity className="mx-auto mb-2 h-8 w-8 text-zinc-800" />
            <p className="text-sm text-zinc-600">
              Waiting for metric data
            </p>
            <p className="mt-0.5 text-xs text-zinc-700">
              Metrics will populate as waves execute
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = grouped[primaryMetric]
    .slice()
    .reverse()
    .map((m) => ({
      time: new Date(m.recordedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: m.metricValue,
    }));

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Metrics
          </CardTitle>
          <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-500">
            {metricLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#71717a' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#metricGradient)"
              dot={false}
              activeDot={{ r: 3, fill: '#10b981', stroke: '#050a0e', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── Spec Compliance Badge ────────────────────────────── */
function SpecComplianceCard({ skillsCount, errorTrendDecreasing }: { skillsCount?: number; errorTrendDecreasing?: boolean }) {
  const checklist = SPEC_CHECKLIST(skillsCount).map((item) => {
    if (item.label === 'Error Rate Decreasing Trend') {
      // Keep null (unknown) when no trend data, use computed boolean otherwise
      return errorTrendDecreasing !== undefined
        ? { ...item, done: errorTrendDecreasing }
        : item; // done stays null
    }
    return item.done !== null ? item : { ...item, done: false };
  });
  const doneCount = checklist.filter((s) => s.done).length;
  const totalCount = checklist.length;
  const percent = Math.round((doneCount / totalCount) * 100);
  const isComplete = percent === 100;

  return (
    <Card className={`glass-card ${isComplete ? 'border-emerald-500/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Spec Compliance
          </CardTitle>
          <span className={`text-sm font-bold tabular-nums ${isComplete ? 'text-amber-400' : 'text-emerald-400'}`}>
            {percent}%
            {isComplete && (
              <motion.span
                className="ml-1.5 inline-block"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                &#9733;
              </motion.span>
            )}
          </span>
        </div>
        {isComplete && (
          <motion.p
            className="text-[10px] text-amber-400/70"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            All spec requirements implemented
          </motion.p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {checklist.map((item, i) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            {item.done === true ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : item.done === null ? (
              <span className="h-3.5 w-3.5 shrink-0 flex items-center justify-center text-[10px] font-mono text-zinc-600">—</span>
            ) : (
              <Minus className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
            )}
            <span
              className={`text-xs ${
                item.done === true ? 'text-zinc-300' : item.done === null ? 'text-zinc-500 italic' : 'text-zinc-600'
              }`}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
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
  const { data: dash, isLoading } = useHarnessDashboard();

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
      {/* Hero Status Card */}
      <HeroStatusCard stats={stats} githubStatus={githubStatus} latestWave={waves[0]} firstWaveStart={firstWave?.startedAt} waveVelocity={waveVelocity} npmDeps={npmDep?.metricValue} isLoading={isLoading} />

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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
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
  );
}