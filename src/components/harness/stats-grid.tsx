'use client';

import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Brain, TrendingUp, AlertTriangle, Target, GitBranch, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber } from './animated-number';
import type { Wave, TotalStats, Metric } from '@/store/harness-store';

/* ── Tiny Sparkline ──────────────────────────────────── */
function Sparkline({ data, color = 'currentColor', label = 'Trend chart' }: {
  data: number[]; color?: string; label?: string;
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
  // Area fill polygon (line points + bottom corners)
  const areaPoints = `${points} ${W},${H} 0,${H}`;
  return (
    <svg width="100%" height={H} className="shrink-0" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <title>{label}</title>
      <defs>
        <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#grad-${label.replace(/\s/g, '')})`}
        points={areaPoints}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.8}
      />
      {/* End dot */}
      <circle cx={W} cy={data[data.length - 1] !== undefined ? (H - ((data[data.length - 1] - min) / range) * (H - 2) - 1) : H / 2} r={2} fill={color} opacity={0.9} />
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

/* ── Quick Stats Tooltip ────────────────────────────── */
function StatTooltip({
  label,
  value,
  previousValue,
  changePercent,
  trend,
  sparkline,
  sparkColor,
}: {
  label: string;
  value: number;
  previousValue?: number | null;
  changePercent?: number | null;
  trend?: 'up' | 'down' | 'neutral';
  sparkline?: number[];
  sparkColor?: string;
}) {
  const changeDir = changePercent !== null && changePercent !== undefined
    ? changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral'
    : trend ?? 'neutral';

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 pointer-events-none">
      <div className="rounded-xl border border-white/[0.08] bg-[#1a1510]/95 shadow-2xl shadow-black/50 backdrop-blur-xl p-3">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">{label} Breakdown</div>
        <div className="space-y-1.5">
          {/* Current value */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">Current</span>
            <span className="text-xs font-bold font-mono text-white tabular-nums">{value}</span>
          </div>
          {/* Previous value */}
          {previousValue !== null && previousValue !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">Previous</span>
              <span className="text-xs font-mono text-zinc-400 tabular-nums">{previousValue}</span>
            </div>
          )}
          {/* Change */}
          {changePercent !== null && changePercent !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">Change</span>
            <span className={cn(
                'flex items-center gap-0.5 text-[11px] font-mono font-bold tabular-nums',
                changeDir === 'up' && 'text-emerald-400',
                changeDir === 'down' && 'text-red-400',
                changeDir === 'neutral' && 'text-zinc-500'
              )}>
                {changeDir === 'up' && <ArrowUp className="h-2.5 w-2.5" />}
                {changeDir === 'down' && <ArrowDown className="h-2.5 w-2.5" />}
                {changeDir === 'neutral' && <Minus className="h-2.5 w-2.5" />}
                {changePercent > 0 ? '+' : ''}{changePercent}%
              </span>
            </div>
          )}
          {/* Trend direction */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">Trend</span>
            <span className={cn(
              'text-[10px] font-mono',
              changeDir === 'up' && 'text-emerald-400',
              changeDir === 'down' && 'text-red-400',
              changeDir === 'neutral' && 'text-zinc-500'
            )}>
              {changeDir === 'up' ? '▲ Increasing' : changeDir === 'down' ? '▼ Decreasing' : '● Stable'}
            </span>
          </div>
        </div>
        {/* Mini sparkline in tooltip */}
        {sparkline && sparkline.length >= 2 && (
          <div className="mt-2 pt-2 border-t border-white/[0.04]">
            <Sparkline data={sparkline} color={sparkColor ?? '#10b981'} label={`Trend for ${label}`} />
          </div>
        )}
      </div>
      {/* Tooltip arrow */}
      <div className="flex justify-center -mt-px">
        <div className="w-2 h-2 rotate-45 border-b border-r border-white/[0.08] bg-[#1a1510]/95" />
      </div>
    </div>
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
  previousValue,
  changePercent,
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
  previousValue?: number | null;
  changePercent?: number | null;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card
        className="glass-card group relative overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Top accent line — color matches the stat icon */}
        <div className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30',
          color.split(' ')[1] ?? 'text-zinc-400'
        )} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                {label}
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-white">
                <AnimatedNumber value={value ?? 0} decimals={suffix === '%' ? 1 : 0} />{suffix ?? ''}
              </p>
            </div>
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110', color)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {sparkline && sparkline.length >= 2 ? (
            <div className="mt-2">
              <Sparkline data={sparkline} color={sparkColor ?? '#10b981'} label={`${label} trend: ${sparkline[sparkline.length - 1]}`} />
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
                className={cn(
                  'text-xs',
                  trend === 'up' && 'text-emerald-400/70',
                  trend === 'down' && 'text-amber-400/70',
                  (!trend || trend === 'neutral') && 'text-zinc-600'
                )}
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

        {/* Hover tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <StatTooltip
                label={label}
                value={value ?? 0}
                previousValue={previousValue}
                changePercent={changePercent}
                trend={trend}
                sparkline={sparkline}
                sparkColor={sparkColor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

/* ── Stats Grid ───────────────────────────────────────── */
export function StatsGrid({ stats, metrics, waves }: { stats?: TotalStats; metrics?: Metric[]; waves?: Wave[] }) {
  // Extract previous values and change percent from metrics — must be before early return (hooks rule)
  const getMetricPrevious = useCallback((key: string) => {
    const m = metrics?.find(m => m.metricKey === key);
    return m?.previousValue;
  }, [metrics]);
  const getMetricChangePct = useCallback((key: string) => {
    const m = metrics?.find(m => m.metricKey === key);
    return m?.changePercent;
  }, [metrics]);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="glass-card shimmer-card">
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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Total Waves"
        value={stats.totalWaves}
        icon={Activity}
        color="bg-emerald-500/10 text-emerald-400"
        delay={0.05}
        sparkline={wavesSparkline}
        sparkColor="#10b981"
        previousValue={getMetricPrevious('waves_completed')}
        changePercent={getMetricChangePct('waves_completed')}
      />
      <StatCard
        label="Decisions"
        value={stats.totalDecisions}
        icon={Brain}
        color="bg-cyan-500/10 text-cyan-400"
        delay={0.1}
        sparkline={decisionsSparkline}
        sparkColor="#06b6d4"
        previousValue={getMetricPrevious('total_decisions')}
        changePercent={getMetricChangePct('total_decisions')}
      />
      <StatCard
        label="Improvements"
        value={stats.totalImprovements}
        icon={TrendingUp}
        color="bg-teal-500/10 text-teal-400"
        delay={0.15}
        sparkline={improvementsSparkline}
        sparkColor="#14b8a6"
        previousValue={getMetricPrevious('total_improvements')}
        changePercent={getMetricChangePct('total_improvements')}
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
        previousValue={getMetricPrevious('wave_success_rate')}
        changePercent={getMetricChangePct('wave_success_rate')}
      />
      <StatCard
        label="Errors"
        value={stats.totalErrors}
        icon={AlertTriangle}
        color="bg-red-500/10 text-red-400"
        delay={0.25}
        sparkline={errorsSparkline}
        sparkColor="#ef4444"
        previousValue={getMetricPrevious('total_errors')}
        changePercent={getMetricChangePct('total_errors')}
      />
      <StatCard
        label="Git Commits"
        value={stats.githubCommits}
        icon={GitBranch}
        color="bg-amber-500/10 text-amber-400"
        delay={0.3}
        subLabel="Pushed to GitHub"
        previousValue={getMetricPrevious('github_commits')}
        changePercent={getMetricChangePct('github_commits')}
      />
    </div>
  );
}
