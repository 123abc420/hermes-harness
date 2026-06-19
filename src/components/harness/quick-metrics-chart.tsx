'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CHART_TOOLTIP_STYLE_DARK, CHART_TOOLTIP_LABEL_STYLE } from '@/lib/constants';
import type { DashboardData } from '@/store/harness-store';

/* ── Quick Metrics Chart ────────────────────────────── */
export function QuickMetricsChart({ metrics, isLoading }: { metrics?: DashboardData['metrics']; isLoading: boolean }) {
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
            <p className="text-sm text-zinc-600">Waiting for metric data</p>
            <p className="mt-0.5 text-xs text-zinc-700">Metrics will populate as waves execute</p>
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
              contentStyle={CHART_TOOLTIP_STYLE_DARK}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
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