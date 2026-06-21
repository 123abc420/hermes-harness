'use client';

import { PieChart as PieChartIcon, CheckCircle2 } from 'lucide-react';
import { CATEGORY_HEX } from '@/lib/category-colors';
import { DonutChartCard, type DonutSlice } from './donut-chart-card';
import type { DashboardData } from '@/store/harness-store';
import type { DecisionOutcome } from '@/lib/schemas';

const OUTCOME_COLORS: Record<DecisionOutcome, string> = {
  success: '#34d399',
  success_verified: '#10b981',
  skipped: '#71717a',
  failed_wave: '#ef4444',
  failed: '#f97316',
  interrupted: '#f59e0b',
  pending: '#3f3f46',
};

export function DecisionDistribution({ recentDecisions }: { recentDecisions?: DashboardData['recentDecisions'] }) {
  const decisions = recentDecisions ?? [];
  const catMap: Record<string, number> = {};
  for (const d of decisions) catMap[d.category] = (catMap[d.category] ?? 0) + 1;
  const data: DonutSlice[] = Object.entries(catMap)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value, color: CATEGORY_HEX[name] ?? '#71717a' }))
    .sort((a, b) => b.value - a.value);

  return (
    <DonutChartCard
      title="Decision Distribution"
      icon={PieChartIcon}
      iconColor="text-violet-400"
      data={data}
      emptyMessage="No decisions yet"
      headerBadge={data.length > 0 ? `${decisions.length} total` : undefined}
    />
  );
}

export function OutcomeDistribution({ recentDecisions }: { recentDecisions?: DashboardData['recentDecisions'] }) {
  const decisions = recentDecisions ?? [];
  const outMap: Record<string, number> = {};
  for (const d of decisions) { const k = d.outcome ?? 'pending'; outMap[k] = (outMap[k] ?? 0) + 1; }
  const data: DonutSlice[] = Object.entries(outMap)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value, color: OUTCOME_COLORS[name as DecisionOutcome] ?? '#71717a' }))
    .sort((a, b) => b.value - a.value);
  const successPct = decisions.length > 0 ? Math.round(((outMap['success_verified'] ?? 0) / decisions.length) * 100) : 0;

  return (
    <DonutChartCard
      title="Outcome Distribution"
      icon={CheckCircle2}
      iconColor="text-emerald-400"
      data={data}
      emptyMessage="No decisions yet"
      headerBadge={data.length > 0 ? `${successPct}% success` : undefined}
      badgeColor="text-emerald-400/70"
    />
  );
}