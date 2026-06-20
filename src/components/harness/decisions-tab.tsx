'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDecisions } from '@/hooks/use-harness-data';
import { useHarnessStore } from '@/store/harness-store';
import { ChevronDown, Filter, Brain, Loader2, CheckCircle2, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ErrorBlock } from './error-block';
import { DecisionCard } from './decision-card';
import { CATEGORY_TW, VALID_CATEGORIES } from '@/lib/category-colors';

// Derive filter buttons from the single source of truth (VALID_CATEGORIES)
const FILTER_BUTTONS = [
  { value: '', label: 'All' },
  ...VALID_CATEGORIES.map(c => ({ value: c, label: c.replace('_', ' ') })),
];

export function DecisionsTab() {
  const decisionCategoryFilter = useHarnessStore(s => s.decisionCategoryFilter);
  const setDecisionCategoryFilter = useHarnessStore(s => s.setDecisionCategoryFilter);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 30;

  const { data, isLoading, isError, error, refetch } = useDecisions(page, limit, decisionCategoryFilter, search);

  const decisions = data?.decisions ?? [];
  const totalDecisions = data?.total ?? 0;
  const categoryCounts = data?.countsByCategory ?? {};
  const actionCounts = data?.countsByAction ?? {};
  const hasMore = decisions.length < totalDecisions;

  // Summary stats
  const executedCount = actionCounts['executed'] ?? 0;
  const executedPct = totalDecisions > 0 ? Math.round((executedCount / totalDecisions) * 100) : 0;
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const showingCount = Math.min(page * limit, totalDecisions);

  const handleFilterChange = (val: string) => {
    setDecisionCategoryFilter(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
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
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search decisions..."
              aria-label="Search decisions"
              className="h-7 w-[140px] rounded-md border border-white/[0.06] bg-white/[0.02] pl-7 pr-2 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
            {search && (
              <button onClick={() => handleSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300" aria-label="Clear search">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Filter className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          <div className="flex gap-1 overflow-x-auto max-w-[260px] sm:max-w-none pb-1 scrollbar-dark">
            {FILTER_BUTTONS.map((btn) => {
              const count = btn.value === '' ? totalDecisions : (categoryCounts[btn.value] ?? 0);
              return (
                <button
                  key={btn.value}
                  onClick={() => handleFilterChange(btn.value)}
                  aria-pressed={decisionCategoryFilter === btn.value}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    decisionCategoryFilter === btn.value
                      ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                  }`}
                >
                  {btn.label}
                  <span className={`text-[9px] tabular-nums ${
                    decisionCategoryFilter === btn.value ? 'text-emerald-400/60' : 'text-zinc-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Summary bar */}
      {!isError && !isLoading && totalDecisions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-2.5"
        >
          <div className="flex items-center gap-1.5">
            <Brain className="h-3 w-3 text-violet-400" />
            <span className="text-xs font-mono text-zinc-300 tabular-nums">{totalDecisions}</span>
            <span className="text-[10px] text-zinc-600">total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-xs font-mono text-zinc-300 tabular-nums">{executedPct}%</span>
            <span className="text-[10px] text-zinc-600">executed</span>
          </div>
          {topCategory && (
            <div className="flex items-center gap-1.5">
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${CATEGORY_TW[topCategory[0]] ?? 'bg-violet-500/10 text-violet-400'}`}>
                {topCategory[0].replace('_', ' ')}
              </span>
              <span className="text-[10px] text-zinc-600">top category</span>
            </div>
          )}
        </motion.div>
      )}

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