'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWaves } from '@/hooks/use-harness-data';
import { useHarnessStore } from '@/store/harness-store';
import { Waves as WavesIcon, ChevronDown, Search, X, CheckCircle2, Clock, BarChart3, TrendingUp, GitCompareArrows, ArrowLeftRight, Check, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBlock } from './error-block';
import { ExportMenu } from './export-menu';
import { STATUS_COLORS } from './wave-detail-dialog';
import { TriggerWaveDialog } from './trigger-wave-dialog';
import { WaveDetailDialog } from './wave-detail-dialog';
import { formatDuration } from '@/lib/constants';

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'interrupted', label: 'Interrupted' },
  { value: 'failed', label: 'Failed' },
];

export function WavesTab() {
  const waveFilter = useHarnessStore(s => s.waveFilter);
  const setWaveFilter = useHarnessStore(s => s.setWaveFilter);
  const pendingWaveDetailId = useHarnessStore(s => s.pendingWaveDetailId);
  const setPendingWaveDetailId = useHarnessStore(s => s.setPendingWaveDetailId);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelections, setCompareSelections] = useState<string[]>([]);
  const limit = 30;

  const { data, isLoading, isError, error, refetch } = useWaves(page, limit, waveFilter, search);

  const waves = data?.waves ?? [];
  const totalWaves = data?.total ?? 0;
  const statusCounts = data?.countsByStatus ?? {};
  const hasMore = waves.length < totalWaves;
  const showingCount = Math.min(page * limit, totalWaves);
  const completionPct = totalWaves > 0 ? Math.round(((statusCounts['completed'] ?? 0) / totalWaves) * 100) : 0;

  // Average duration from current page waves
  let avgDurationSec: number | null = null;
  const doneWaves = waves.filter(w => w.completedAt && w.startedAt);
  if (doneWaves.length > 0) {
    const totalSec = doneWaves.reduce((s, w) => s + (new Date(w.completedAt!).getTime() - new Date(w.startedAt!).getTime()) / 1000, 0);
    avgDurationSec = Math.round(totalSec / doneWaves.length);
  }

  // Max duration for progress bar normalization
  const maxDuration = waves.reduce((max, w) => {
    if (w.completedAt && w.startedAt) {
      const dur = (new Date(w.completedAt).getTime() - new Date(w.startedAt).getTime()) / 1000;
      return dur > max ? dur : max;
    }
    return max;
  }, 0);

  const handleFilterChange = (val: string) => {
    setWaveFilter(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const toggleCompare = (waveId: string) => {
    setCompareSelections(prev => {
      if (prev.includes(waveId)) return prev.filter(id => id !== waveId);
      if (prev.length >= 2) return [prev[1], waveId]; // Keep last 2
      return [...prev, waveId];
    });
  };

  const clearCompare = () => {
    setCompareSelections([]);
    setCompareMode(false);
  };

  const compareWaves = compareSelections.map(id => waves.find(w => w.id === id)).filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Header + Filters */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Wave History
        </h2>
        <div className="flex items-center gap-2 min-w-0">
          {/* Compare toggle */}
          <button
            onClick={() => { setCompareMode(v => !v); if (compareMode) setCompareSelections([]); }}
            aria-label="Compare waves"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all border',
              compareMode
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.15)]'
                : 'text-zinc-500 border-white/[0.06] hover:text-zinc-300 hover:border-white/[0.1]',
            )}
          >
            <GitCompareArrows className="h-3 w-3" />
            <span className="hidden sm:inline">Compare</span>
          </button>
          {/* Search input */}
          <div className="relative min-w-0">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search summaries..."
              aria-label="Search waves"
              className="h-7 w-full min-w-[100px] max-w-[140px] rounded-md border border-white/[0.06] bg-white/[0.02] pl-7 pr-2 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
            {search && (
              <button onClick={() => handleSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300" aria-label="Clear search">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {/* Filter buttons */}
          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5 overflow-x-auto max-w-[220px] sm:max-w-none scrollbar-dark">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                aria-pressed={waveFilter === opt.value}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5',
                  waveFilter === opt.value
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]'
                    : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                {opt.label}
                {opt.value && statusCounts[opt.value] !== undefined && (
                  <span className={cn(
                    'text-[9px] tabular-nums',
                    waveFilter === opt.value ? 'text-emerald-400/60' : 'text-zinc-600',
                  )}>
                    {statusCounts[opt.value]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <TriggerWaveDialog />
          <ExportMenu
            baseUrl="/api/harness/waves"
            dataKey="waves"
            totalKey="total"
            filename="harness-waves"
            columns={["waveNumber","status","decisionsCount","improvementsCount","errorsCount","summary","startedAt","completedAt"]}
            transform={(r) => ({
              ...r,
              decisions: r._count?.decisions ?? r.decisionsCount ?? 0,
            })}
          />
        </div>
      </motion.div>

      {/* Compare selection banner */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] px-4 py-2.5">
              <ArrowLeftRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] text-amber-300/80">
                {compareSelections.length === 0
                  ? 'Select 2 waves from the table below to compare'
                  : compareSelections.length === 1
                    ? `1 selected — choose one more wave`
                    : `Comparing 2 waves`
                }
              </span>
              {compareSelections.length === 2 && (
                <button
                  onClick={clearCompare}
                  className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-white px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                >
                  <XIcon className="h-2.5 w-2.5" />
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wave Comparison Panel */}
      <AnimatePresence>
        {compareMode && compareWaves.length === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <WaveComparePanel waves={compareWaves as NonNullable<typeof waves>[number][]} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary bar */}
      {!isError && !isLoading && totalWaves > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <WavesIcon className="h-3 w-3 text-emerald-400" />
            <span className="text-xs font-mono text-zinc-300 tabular-nums">{totalWaves}</span>
            <span className="text-[10px] text-zinc-600">total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-xs font-mono text-zinc-300 tabular-nums">{completionPct}%</span>
            <span className="text-[10px] text-zinc-600">completed</span>
          </div>
          {avgDurationSec !== null && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-zinc-500" />
              <span className="text-xs font-mono text-zinc-300 tabular-nums">{formatDuration(avgDurationSec)}</span>
              <span className="text-[10px] text-zinc-600">avg</span>
            </div>
          )}
        </div>
      )}

      {/* Inline mini-visualizations */}
      {!isError && !isLoading && waves.length >= 5 && (
        <WavesInlineCharts waves={waves} />
      )}

      {/* Error / Loading / Empty */}
      {isError ? (
        <ErrorBlock message={error?.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Card className="glass-card shimmer-card">
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : waves.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-card">
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <WavesIcon className="h-8 w-8 text-zinc-700" />
                </div>
                <p className="text-sm font-medium text-zinc-400">No waves yet</p>
                <p className="mt-1 max-w-xs text-xs text-zinc-600">
                  The harness will start improving automatically via cron jobs.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="glass-card overflow-hidden">
            <ScrollArea className="max-h-[60vh]">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    {compareMode && <TableHead className="w-8 text-[10px] font-medium uppercase tracking-wider text-zinc-500" />}
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Wave #</TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Status</TableHead>
                    <TableHead className="hidden text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">Decisions</TableHead>
                    <TableHead className="hidden text-[10px] font-medium uppercase tracking-wider text-zinc-500 md:table-cell">Improved</TableHead>
                    <TableHead className="hidden text-[10px] font-medium uppercase tracking-wider text-zinc-500 lg:table-cell">Errors</TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Duration</TableHead>
                    <TableHead className="hidden max-w-[200px] text-[10px] font-medium uppercase tracking-wider text-zinc-500 md:table-cell">Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waves.map((wave, idx) => {
                    const duration = wave.completedAt && wave.startedAt
                      ? Math.round((new Date(wave.completedAt).getTime() - new Date(wave.startedAt).getTime()) / 1000)
                      : null;
                    const durationPct = duration !== null && maxDuration > 0 ? Math.round((duration / maxDuration) * 100) : 0;
                    const isSelected = compareSelections.includes(wave.id);
                    const isAltRow = idx % 2 === 1;
                    return (
                      <TableRow
                        key={wave.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for wave ${wave.waveNumber}`}
                        className={cn(
                          'border-white/[0.04] transition-all duration-200 hover:bg-white/[0.03] cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400/50 focus-visible:outline-offset-[-2px]',
                          isAltRow && 'bg-white/[0.015]',
                          isSelected
                            ? 'bg-amber-500/[0.06] border-l-2 border-l-amber-500/40'
                            : 'hover:border-l-2 hover:border-l-amber-500/20 border-l-2 border-l-transparent',
                        )}
                        onClick={() => { if (compareMode) { toggleCompare(wave.id); return; } setDetailId(wave.id); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (compareMode) { toggleCompare(wave.id); return; }
                            setDetailId(wave.id);
                          }
                        }}
                      >
                        {/* Compare checkbox */}
                        {compareMode && (
                          <TableCell className="w-8 p-2">
                            <div className={cn(
                              'flex h-4 w-4 items-center justify-center rounded border transition-all',
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500/40'
                                : 'border-white/[0.1] hover:border-white/[0.2]',
                            )}>
                              {isSelected && <Check className="h-2.5 w-2.5 text-amber-400" />}
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="font-mono text-xs font-bold text-white">
                          #{String(wave.waveNumber).padStart(3, '0')}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium',
                            STATUS_COLORS[wave.status],
                          )}>
                            {wave.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums text-xs text-zinc-400 sm:table-cell">
                          {wave._count?.decisions ?? wave.decisionsCount}
                        </TableCell>
                        <TableCell className="tabular-nums text-xs text-emerald-400 md:table-cell">
                          {wave.improvementsCount}
                        </TableCell>
                        <TableCell className="tabular-nums text-xs text-red-400 lg:table-cell">
                          {wave.errorsCount}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500">
                          {duration !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono tabular-nums shrink-0">{formatDuration(duration)}</span>
                              <div className="h-1.5 w-12 sm:w-16 overflow-hidden rounded-full bg-white/[0.04]">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.max(durationPct, 3)}%`,
                                    backgroundColor: durationPct > 70 ? '#f59e0b' : '#10b981',
                                    opacity: 0.6,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-zinc-500 md:table-cell">
                          {wave.summary || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-3">
              <span className="text-[10px] font-mono text-zinc-600">
                Showing {showingCount} of {totalWaves}
              </span>
              {hasMore && (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading}
                  className="gap-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                >
                  {isLoading && <ChevronDown className="h-3 w-3 animate-spin" />}
                  <ChevronDown className="h-3 w-3" />
                  Load More
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      <WaveDetailDialog
        waveId={pendingWaveDetailId ?? detailId}
        onClose={() => {
          setDetailId(null);
          if (pendingWaveDetailId) setPendingWaveDetailId(null);
        }}
      />
    </div>
  );
}

/* ── Wave Compare Panel ───────────────────────────────── */
function WaveComparePanel({ waves }: { waves: { waveNumber: number; status: string; decisionsCount: number; improvementsCount: number; errorsCount: number; summary: string | null; startedAt: string; completedAt: string | null }[] }) {
  const [a, b] = waves;
  if (!a || !b) return null;

  const durA = a.completedAt && a.startedAt ? Math.round((new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()) / 1000) : null;
  const durB = b.completedAt && b.startedAt ? Math.round((new Date(b.completedAt).getTime() - new Date(b.startedAt).getTime()) / 1000) : null;

  const metrics = [
    { label: 'Status', valA: a.status, valB: b.status, format: (v: string) => v.toUpperCase(), compare: (x: string, y: string) => x === y ? 'equal' : 'different' },
    { label: 'Duration', valA: durA, valB: durB, format: (v: number | null) => v !== null ? formatDuration(v) : '—', compare: (x: number | null, y: number | null) => {
      if (x === null || y === null) return 'neutral';
      if (x < y) return 'better';
      if (x > y) return 'worse';
      return 'equal';
    }},
    { label: 'Decisions', valA: a.decisionsCount, valB: b.decisionsCount, format: (v: number) => String(v), compare: (x: number, y: number) => x > y ? 'better' : x < y ? 'worse' : 'equal' },
    { label: 'Improvements', valA: a.improvementsCount, valB: b.improvementsCount, format: (v: number) => String(v), compare: (x: number, y: number) => x > y ? 'better' : x < y ? 'worse' : 'equal' },
    { label: 'Errors', valA: a.errorsCount, valB: b.errorsCount, format: (v: number) => String(v), compare: (x: number, y: number) => x < y ? 'better' : x > y ? 'worse' : 'equal' },
    { label: 'Summary', valA: a.summary ?? '—', valB: b.summary ?? '—', format: (v: string) => v.length > 50 ? v.slice(0, 50) + '...' : v, compare: () => 'neutral' },
  ];

  return (
    <Card className="border-amber-500/15 bg-amber-500/[0.03]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowLeftRight className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-amber-400">Wave Comparison</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {/* Metric label column */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-zinc-600 h-8 flex items-center">Metric</div>
            {metrics.map(m => (
              <div key={m.label} className="h-8 flex items-center text-[11px] text-zinc-400 font-medium">{m.label}</div>
            ))}
          </div>
          {/* Wave A */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-amber-400 h-8 flex items-center font-bold">#{String(a.waveNumber).padStart(3, '0')}</div>
            {metrics.map(m => {
              const result = m.compare(m.valA as never, m.valB as never);
              const cls = result === 'better' ? 'text-emerald-400' : result === 'worse' ? 'text-red-400' : 'text-zinc-300';
              return (
                <div key={m.label} className={cn('h-8 flex items-center text-xs font-mono tabular-nums rounded px-2 transition-colors', cls)}>
                  {m.format(m.valA as never)}
                </div>
              );
            })}
          </div>
          {/* Wave B */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-amber-400 h-8 flex items-center font-bold">#{String(b.waveNumber).padStart(3, '0')}</div>
            {metrics.map(m => {
              const result = m.compare(m.valB as never, m.valA as never);
              const cls = result === 'better' ? 'text-emerald-400' : result === 'worse' ? 'text-red-400' : 'text-zinc-300';
              return (
                <div key={m.label} className={cn('h-8 flex items-center text-xs font-mono tabular-nums rounded px-2 transition-colors', cls)}>
                  {m.format(m.valB as never)}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Inline Mini-Visualizations ──────────────────────── */
function WavesInlineCharts({ waves }: { waves: { waveNumber: number; startedAt: string; completedAt: string | null; status: string }[] }) {
  // Last 20 waves reversed (oldest→newest) for the sparkline
  const recent = [...waves].reverse().slice(-20);
  const durations = recent
    .map(w => w.completedAt && w.startedAt
      ? Math.round((new Date(w.completedAt).getTime() - new Date(w.startedAt).getTime()) / 1000)
      : null)
    .filter((d): d is number => d !== null);

  const maxDur = Math.max(...durations, 1);

  // Success rate from visible waves
  const completed = waves.filter(w => w.status === 'completed').length;
  const failed = waves.filter(w => w.status === 'failed').length;
  const other = waves.length - completed - failed;
  const successPct = waves.length > 0 ? Math.round((completed / waves.length) * 100) : 0;

  // Trend: compare avg of last 5 vs previous 5
  const last5 = durations.slice(-5);
  const prev5 = durations.slice(-10, -5);
  const avgLast = last5.length > 0 ? last5.reduce((a, b) => a + b, 0) / last5.length : 0;
  const avgPrev = prev5.length > 0 ? prev5.reduce((a, b) => a + b, 0) / prev5.length : 0;
  const trendPct = avgPrev > 0 ? Math.round(((avgLast - avgPrev) / avgPrev) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {/* Duration sparkline */}
      <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-amber-400/70" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Recent Duration</span>
          </div>
          <span className={cn('flex items-center gap-1 text-[10px] font-mono', trendPct <= 0 ? 'text-emerald-400' : 'text-amber-400')}>
            <TrendingUp className={cn('h-2.5 w-2.5', trendPct > 0 && 'rotate-180')} />
            {trendPct === 0 ? 'stable' : `${Math.abs(trendPct)}%`}
          </span>
        </div>
        <div className="flex items-end gap-px h-8" role="img" aria-label={`Duration trend for last ${Math.min(durations.length, 20)} waves`}>
          {durations.slice(-20).map((sec, i) => {
            const pct = (sec / maxDur) * 100;
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-emerald-500/40 hover:bg-emerald-400/60 transition-colors min-w-[2px]"
                style={{ height: `${Math.max(pct, 4)}%` }}
                title={`${sec}s`}
                aria-label={`${sec} seconds`}
                role="presentation"
              />
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-zinc-600">
          <span>{durations.length > 0 ? durations[0] : 0}s</span>
          <span className="text-zinc-500">avg {durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0}s</span>
        </div>
      </div>

      {/* Success donut */}
      <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <CheckCircle2 className="h-3 w-3 text-emerald-400/70" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Success Rate</span>
        </div>
        <div className="flex items-center gap-3">
          {/* SVG donut */}
          <svg viewBox="0 0 36 36" className="h-10 w-10 shrink-0">
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
            <circle
              cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4"
              strokeDasharray={`${successPct * 0.88} 88`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
              className="transition-all duration-500"
            />
            {failed > 0 && (
              <circle
                cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="4"
                strokeDasharray={`${Math.round((failed / waves.length) * 0.88)} 88`}
                strokeDashoffset={`${-successPct * 0.88}`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            )}
          </svg>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-lg font-bold font-mono text-emerald-400">{successPct}%</div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-mono">
              <span className="text-emerald-400/70">{completed} ok</span>
              {failed > 0 && <span className="text-red-400/70">{failed} fail</span>}
              {other > 0 && <span className="text-zinc-500">{other} other</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
