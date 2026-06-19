'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardData } from '@/store/harness-store';
import { CHART_TOOLTIP_STYLE } from '@/lib/constants';

export function ErrorTrendChart({ errorTrend }: { errorTrend?: DashboardData['errorTrend'] }) {
  if (!errorTrend?.length) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-red-400/60" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Error Rate Trend
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex h-24 items-center justify-center">
          <div className="text-center">
            <TrendingDown className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
            <p className="text-xs text-zinc-600">No error trend data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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