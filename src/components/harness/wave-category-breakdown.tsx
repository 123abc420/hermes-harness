'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { CATEGORY_HEX } from '@/lib/category-colors';
import { CHART_TOOLTIP_STYLE } from '@/lib/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Wave, Decision } from '@/store/harness-store';

/* ── Wave Category Breakdown ─────────────────────────── */
export function WaveCategoryBreakdown({
  waves,
  decisions,
}: {
  waves?: Wave[];
  decisions?: Decision[];
}) {
  const waveList = waves ?? [];
  const allDecisions = decisions ?? [];

  // Build data: last 10 waves with per-category decision counts
  const recentWaves = waveList.slice(-10);
  const chartData = recentWaves.map((w) => {
    const waveDecs = allDecisions.filter((d) => d.waveId === w.id);
    const catCounts: Record<string, number> = {};
    for (const d of waveDecs) {
      catCounts[d.category] = (catCounts[d.category] ?? 0) + 1;
    }
    const total = waveDecs.length;
    return {
      name: `W${w.waveNumber}`,
      total,
      ...catCounts,
    };
  });

  // Collect all categories that appear
  const allCats = new Set<string>();
  for (const row of chartData) {
    for (const key of Object.keys(row)) {
      if (key !== 'name' && key !== 'total') allCats.add(key);
    }
  }
  const categories = Array.from(allCats).sort();

  if (chartData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-rose-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Wave Category Breakdown
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-xs text-zinc-600">No wave data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-rose-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Wave Category Breakdown
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-zinc-600">
            last {chartData.length} waves
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]" role="img" aria-label="Decision category breakdown stacked bar chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              {categories.map((cat) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={CATEGORY_HEX[cat] ?? '#71717a'}
                  radius={0}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5 text-[10px]">
              <span
                className="h-2 w-2 rounded-sm shrink-0"
                style={{ backgroundColor: CATEGORY_HEX[cat] ?? '#71717a' }}
              />
              <span className="text-zinc-500">{cat.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}