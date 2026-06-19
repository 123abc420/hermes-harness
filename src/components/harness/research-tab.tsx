'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import {
  PieChart as PieChartIcon,
  ListChecks,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_HEX } from '@/lib/category-colors';
import { CHART_TOOLTIP_STYLE } from '@/lib/constants';
import { MemorySection } from './memory-section';
import { SkillsSection } from './skills-section';
import { WaveCategoryBreakdown } from './wave-category-breakdown';
import type { DashboardData } from '@/store/harness-store';

/* ── Decision Distribution ────────────────────────────── */
// (Pie colors imported from @/lib/category-colors as CATEGORY_HEX)

function DecisionDistribution({ recentDecisions }: { recentDecisions?: DashboardData['recentDecisions'] }) {
  const decisions = recentDecisions ?? [];

  const catMap: Record<string, number> = {};
  for (const d of decisions) {
    catMap[d.category] = (catMap[d.category] ?? 0) + 1;
  }
  const chartData = Object.entries(catMap)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value, color: CATEGORY_HEX[name] ?? '#71717a' }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-violet-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Decision Distribution
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-xs text-zinc-600">No decisions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-violet-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Decision Distribution
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-zinc-600">
            {decisions.length} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-400">{item.name}</span>
                <span className="ml-auto font-mono tabular-nums text-zinc-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Outcome Distribution ────────────────────────────── */
const OUTCOME_COLORS: Record<string, string> = {
  success_verified: '#10b981',
  skipped: '#71717a',
  failed_wave: '#ef4444',
  failed: '#f97316',
  interrupted: '#f59e0b',
  pending: '#3f3f46',
};

function OutcomeDistribution({ recentDecisions }: { recentDecisions?: DashboardData['recentDecisions'] }) {
  const decisions = recentDecisions ?? [];

  const outMap: Record<string, number> = {};
  for (const d of decisions) {
    const key = d.outcome ?? 'pending';
    outMap[key] = (outMap[key] ?? 0) + 1;
  }
  const chartData = Object.entries(outMap)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value, color: OUTCOME_COLORS[name] ?? '#71717a' }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Outcome Distribution
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-xs text-zinc-600">No decisions yet</p>
        </CardContent>
      </Card>
    );
  }

  const successCount = outMap['success_verified'] ?? 0;
  const successPct = Math.round((successCount / decisions.length) * 100);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Outcome Distribution
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/70">
            {successPct}% success
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-400">{item.name}</span>
                <span className="ml-auto font-mono tabular-nums text-zinc-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Decision Timeline ──────────────────────────────── */
function DecisionTimeline({ decisions }: { decisions?: DashboardData['recentDecisions'] }) {
  const items = decisions ?? [];
  if (items.length === 0) return null;

  const shown = items.slice(0, 8);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-teal-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Recent Decisions
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-zinc-600">
            {items.length} total
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-72 space-y-0 overflow-y-auto scrollbar-dark px-5 pb-4">
          {shown.map((d, i) => {
            const color = CATEGORY_HEX[d.category] ?? '#71717a';
            return (
              <div key={d.id} className="relative flex gap-3 py-2.5">
                {i < shown.length - 1 && (
                  <div className="absolute left-[5px] top-6 h-full w-px bg-white/[0.06]" />
                )}
                <div
                  className="relative z-10 mt-1 h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">
                      W{d.wave?.waveNumber ?? '?'}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-mono"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {d.category.replace('_', ' ')}
                    </span>
                    <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-mono ${
                      d.action === 'executed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : d.action === 'failed'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {d.action}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">{d.description}</p>
                  {d.targetFile && (
                    <p className="mt-0.5 text-[10px] text-zinc-600 font-mono truncate">{d.targetFile}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Research Tab ─────────────────────────────────────── */
export function ResearchTab() {
  const { data: dash } = useHarnessDashboard();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <MemorySection />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <SkillsSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <DecisionDistribution recentDecisions={dash?.recentDecisions} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <OutcomeDistribution recentDecisions={dash?.recentDecisions} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <WaveCategoryBreakdown
          waves={dash?.waves}
          decisions={dash?.recentDecisions}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
      >
        <DecisionTimeline decisions={dash?.recentDecisions} />
      </motion.div>
    </div>
  );
}