'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Wave, TotalStats, Metric } from '@/store/harness-store';

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
export function StatsGrid({ stats, metrics, waves }: { stats?: TotalStats; metrics?: Metric[]; waves?: Wave[] }) {
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