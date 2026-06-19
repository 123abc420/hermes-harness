'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useDecisions } from '@/hooks/use-harness-data';
import { useHarnessStore, type Decision } from '@/store/harness-store';
import { ChevronDown, Filter, Brain, FileCode2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ErrorBlock } from './error-block';

const CATEGORY_COLORS: Record<string, string> = {
  code_quality: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  feature: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  fix: 'bg-red-500/10 text-red-400 border-red-500/20',
  refactor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  performance: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  architecture: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  skill: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  insight: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400',
  high: 'bg-orange-500/15 text-orange-400',
  medium: 'bg-amber-500/15 text-amber-400',
  low: 'bg-zinc-500/15 text-zinc-400',
};

const FILTER_BUTTONS = [
  { value: '', label: 'All' },
  { value: 'code_quality', label: 'Code Quality' },
  { value: 'feature', label: 'Feature' },
  { value: 'fix', label: 'Fix' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'performance', label: 'Performance' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'skill', label: 'Skill' },
  { value: 'insight', label: 'Insight' },
];

function DecisionCard({ decision }: { decision: Decision }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="glass-card group transition-all hover:border-white/10">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-medium',
                  CATEGORY_COLORS[decision.category] ?? CATEGORY_COLORS.code_quality
                )}
              >
                {decision.category.replace('_', ' ')}
              </span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-mono font-medium',
                  PRIORITY_STYLES[decision.priority] ?? PRIORITY_STYLES.medium
                )}
              >
                {decision.priority}
              </span>
            </div>
            <span
              className={cn(
                'text-[10px] font-mono font-medium',
                decision.action === 'executed'
                  ? 'text-emerald-400'
                  : decision.action === 'failed'
                    ? 'text-red-400'
                    : decision.action === 'skipped'
                      ? 'text-zinc-500'
                      : 'text-amber-400'
              )}
            >
              {decision.action.toUpperCase()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-sm text-zinc-200">{decision.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-zinc-600">
            {decision.wave && (
              <span className="font-mono">Wave {decision.wave.waveNumber}</span>
            )}
            <span>
              {formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}
            </span>
            {decision.targetFile && (
              <span className="flex items-center gap-1 font-mono text-zinc-500">
                <FileCode2 className="h-3 w-3" />
                {decision.targetFile}
              </span>
            )}
          </div>

          {/* Expandable reasoning + outcome */}
          {(decision.reasoning || decision.outcome) && (
            <>
              <CollapsibleTrigger className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    open && 'rotate-180'
                  )}
                />
                {open ? 'Hide' : 'Show'} details
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                  {decision.reasoning && (
                    <div>
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Reasoning
                      </p>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {decision.reasoning}
                      </p>
                    </div>
                  )}
                  {decision.outcome && (
                    <div>
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Outcome
                      </p>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {decision.outcome}
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </>
          )}
        </CardContent>
      </Card>
    </Collapsible>
  );
}

export function DecisionsTab() {
  const { decisionCategoryFilter, setDecisionCategoryFilter } = useHarnessStore();
  const [page, setPage] = useState(1);
  const limit = 30;

  const { data, isLoading, isError, error, refetch } = useDecisions(page, limit, decisionCategoryFilter);

  const decisions = data?.decisions ?? [];
  const totalDecisions = data?.total ?? 0;
  const hasMore = decisions.length < totalDecisions;
  const showingCount = Math.min(page * limit, totalDecisions);

  const handleFilterChange = (val: string) => {
    setDecisionCategoryFilter(val);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header + Filters */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Decisions Log
        </h2>
        <div className="flex items-center gap-2 min-w-0">
          <Filter className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          <div className="flex gap-1 overflow-x-auto max-w-[260px] sm:max-w-none pb-1 scrollbar-dark">
            {FILTER_BUTTONS.map((btn) => (
              <button
                key={btn.value}
                onClick={() => handleFilterChange(btn.value)}
                aria-pressed={decisionCategoryFilter === btn.value}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 ${
                  decisionCategoryFilter === btn.value
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Decision Cards */}
      {isError ? (
        <ErrorBlock message={error?.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card">
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <Brain className="h-8 w-8 text-zinc-700" />
                </div>
                <p className="text-sm font-medium text-zinc-400">
                  No decisions recorded yet
                </p>
                <p className="mt-1 max-w-xs text-xs text-zinc-600">
                  Decisions will appear as the harness executes waves and
                  evaluates improvements
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {decisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </motion.div>
        {/* Pagination footer */}
        {decisions.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-600">
              Showing {showingCount} of {totalDecisions}
            </span>
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
                className="gap-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                <ChevronDown className="h-3 w-3" />
                Load More
              </Button>
            )}
          </div>
        )}
        </>
      )}
    </div>
  );
}