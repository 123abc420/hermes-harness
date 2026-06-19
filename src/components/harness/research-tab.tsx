'use client';

import { useHarnessDashboard } from '@/hooks/use-harness-data';
import { PieChart as PieChartIcon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORY_HEX } from '@/lib/category-colors';
import { MemorySection } from './memory-section';
import { SkillsSection } from './skills-section';
import { WaveCategoryBreakdown } from './wave-category-breakdown';
import { DecisionTimeline } from './decision-timeline';
import { DonutChartCard } from './donut-chart-card';
import type { DonutSlice } from './donut-chart-card';
import type { DashboardData } from '@/store/harness-store';

/* ── Outcome color map ───────────────────────────────── */
const OUTCOME_COLORS: Record<string, string> = {
  success_verified: '#10b981',
  skipped: '#71717a',
  failed_wave: '#ef4444',
  failed: '#f97316',
  interrupted: '#f59e0b',
  pending: '#3f3f46',
};

/* ── Decision Distribution ────────────────────────────── */
function DecisionDistribution({ recentDecisions }: { recentDecisions?: DashboardData['recentDecisions'] }) {
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

/* ── Outcome Distribution ────────────────────────────── */
function OutcomeDistribution({ recentDecisions }: { recentDecisions?: DashboardData['recentDecisions'] }) {
  const decisions = recentDecisions ?? [];
  const outMap: Record<string, number> = {};
  for (const d of decisions) { const k = d.outcome ?? 'pending'; outMap[k] = (outMap[k] ?? 0) + 1; }
  const data: DonutSlice[] = Object.entries(outMap)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value, color: OUTCOME_COLORS[name] ?? '#71717a' }))
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