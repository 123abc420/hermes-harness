'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMetrics } from '@/hooks/use-harness-data';
import type { Metric } from '@/store/harness-store';

export function MetricsChart() {
  const { data, isLoading } = useMetrics();

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const metrics = data?.metrics ?? [];

  // Group metrics by key for the chart
  const grouped = metrics.reduce<Record<string, Metric[]>>((acc, m) => {
    (acc[m.metricKey] ??= []).push(m);
    return acc;
  }, {});

  // Pick the most frequent metric key
  const keys = Object.keys(grouped).sort(
    (a, b) => grouped[b].length - grouped[a].length
  );
  const primaryMetric = keys[0];

  if (!primaryMetric || grouped[primaryMetric].length < 2) {
    return (
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Live Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-zinc-600">Insufficient metric data for chart</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = grouped[primaryMetric].map((m) => ({
    time: new Date(m.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: m.metricValue,
  }));

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Live Metrics
          </CardTitle>
          <span className="text-xs font-mono text-zinc-600">{primaryMetric}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#71717a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#a1a1aa' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#emeraldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}