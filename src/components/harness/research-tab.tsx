'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import {
  PieChart as PieChartIcon,
  ListChecks,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_HEX } from '@/lib/category-colors';
import { MemorySection } from './memory-section';
import { SkillsSection } from './skills-section';
import { WaveCategoryBreakdown } from './wave-category-breakdown';
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

/* ── Decision Timeline ──────────────────────────────── */
function DecisionTimeline({ decisions }: { decisions?: DashboardData['recentDecisions'] }) {
  const items = decisions ?? [];
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (items.length === 0) return null;

  const shown = items.slice(0, 8);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
            const isOpen = expanded.has(d.id);
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
                  <div
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => toggle(d.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(d.id); }}
                  >
                    <span className="text-[10px] font-mono text-zinc-500">
                      W{d.wave?.waveNumber ?? '?'}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-mono"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {d.category.replace('_', ' ')}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${
                      d.action === 'executed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : d.action === 'failed'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {d.action}
                    </span>
                    {(d.reasoning || d.targetFile) && (
                      <ChevronDown className={`ml-auto h-3 w-3 shrink-0 text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  <p className={`mt-0.5 text-xs text-zinc-400 ${isOpen ? '' : 'truncate'}`}>{d.description}</p>
                  {d.targetFile && (
                    <p className="mt-0.5 text-[10px] text-zinc-600 font-mono truncate">{d.targetFile}</p>
                  )}
                  <AnimatePresence>
                    {isOpen && d.reasoning && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-1.5 rounded-md border border-white/[0.04] bg-white/[0.02] px-2.5 py-2 text-[11px] leading-relaxed text-zinc-500 italic">
                          {d.reasoning}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
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