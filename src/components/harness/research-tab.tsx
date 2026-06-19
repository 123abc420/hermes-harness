'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemory, useSkills, useHarnessDashboard } from '@/hooks/use-harness-data';
import {
  Brain,
  Lightbulb,
  Sparkles,
  Database,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ErrorBlock } from './error-block';
import type { DashboardData } from '@/store/harness-store';

/* ── Memory Section ───────────────────────────────────── */
function MemorySection() {
  const { data, isLoading, isError, error, refetch } = useMemory();

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Memory Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <ErrorBlock message={error?.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : (
          <>
            {/* Context */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Database className="h-3 w-3 text-cyan-400" />
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Context
                </h3>
              </div>
              {data?.context ? (
                <ScrollArea className="max-h-48 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 font-mono">
                    {data.context}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-xs text-zinc-600">No context stored yet</p>
                </div>
              )}
            </div>

            {/* Insights */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Lightbulb className="h-3 w-3 text-amber-400" />
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Insights
                </h3>
              </div>
              {data?.insights ? (
                <ScrollArea className="max-h-48 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 font-mono">
                    {data.insights}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-xs text-zinc-600">No insights recorded yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Skills Section ───────────────────────────────────── */
function SkillsSection() {
  const { data, isLoading, isError, error, refetch } = useSkills();
  const skills = data?.skills ?? [];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Skills
            </CardTitle>
          </div>
          {skills.length > 0 && (
            <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-500">
              {skills.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <ErrorBlock message={error?.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
              <p className="text-xs text-zinc-500">No skills learned yet</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">
                Skills are acquired as the agent evolves through waves
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:border-white/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-white">
                    {skill.title}
                  </h4>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {skill.category && (
                      <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-mono text-cyan-400">
                        {skill.category}
                      </span>
                    )}
                    {skill.version && (
                      <span className="text-[9px] font-mono text-zinc-600">
                        v{skill.version}
                      </span>
                    )}
                  </div>
                </div>
                {skill.trigger && (
                  <p className="mt-1 text-[10px] italic text-zinc-600">
                    Trigger: {skill.trigger}
                  </p>
                )}
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                  {skill.content.slice(0, 200)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Decision Distribution ────────────────────────────── */
const PIE_COLORS: Record<string, string> = {
  code_quality: '#06b6d4',
  feature: '#10b981',
  fix: '#ef4444',
  refactor: '#8b5cf6',
  performance: '#f97316',
  architecture: '#14b8a6',
  skill: '#f59e0b',
  insight: '#ec4899',
};

function DecisionDistribution({ recentDecisions }: { recentDecisions?: DashboardData['recentDecisions'] }) {
  const decisions = recentDecisions ?? [];

  const catMap: Record<string, number> = {};
  for (const d of decisions) {
    catMap[d.category] = (catMap[d.category] ?? 0) + 1;
  }
  const chartData = Object.entries(catMap)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value, color: PIE_COLORS[name] ?? '#71717a' }))
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
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }}
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
    </div>
  );
}