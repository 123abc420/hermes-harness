'use client';

import { useState } from 'react';
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
import { Waves as WavesIcon, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ErrorBlock } from './error-block';
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
  const [detailId, setDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 30;

  const { data, isLoading, isError, error, refetch } = useWaves(page, limit, waveFilter);

  const waves = data?.waves ?? [];
  const totalWaves = data?.total ?? 0;
  const statusCounts = data?.countsByStatus ?? {};
  const hasMore = waves.length < totalWaves;
  const showingCount = Math.min(page * limit, totalWaves);

  const handleFilterChange = (val: string) => {
    setWaveFilter(val);
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
          Wave History
        </h2>
        <div className="flex items-center gap-2 min-w-0">
          {/* Filter buttons */}
          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5 overflow-x-auto max-w-[220px] sm:max-w-none scrollbar-dark">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                aria-pressed={waveFilter === opt.value}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  waveFilter === opt.value
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {opt.label}
                {opt.value && statusCounts[opt.value] !== undefined && (
                  <span className={`text-[9px] tabular-nums ${
                    waveFilter === opt.value ? 'text-emerald-400/60' : 'text-zinc-600'
                  }`}>
                    {statusCounts[opt.value]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <TriggerWaveDialog />
        </div>
      </motion.div>

      {/* Error / Loading / Empty */}
      {isError ? (
        <ErrorBlock message={error?.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Card className="glass-card">
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
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
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
                  {waves.map((wave) => {
                    const duration = wave.completedAt && wave.startedAt
                      ? Math.round((new Date(wave.completedAt).getTime() - new Date(wave.startedAt).getTime()) / 1000)
                      : null;
                    return (
                      <TableRow
                        key={wave.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for wave ${wave.waveNumber}`}
                        className="border-white/[0.04] transition-colors hover:bg-white/[0.02] cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400/50 focus-visible:outline-offset-[-2px]"
                        onClick={() => setDetailId(wave.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailId(wave.id); }
                        }}
                      >
                        <TableCell className="font-mono text-xs font-bold text-white">
                          #{String(wave.waveNumber).padStart(3, '0')}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${
                            STATUS_COLORS[wave.status] ?? STATUS_COLORS.pending
                          }`}>
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
                          {duration !== null
                            ? <span className="font-mono tabular-nums">{formatDuration(duration)}</span>
                            : <span className="text-zinc-600">—</span>
                          }
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-zinc-500 md:table-cell">
                          {wave.summary || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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

      <WaveDetailDialog waveId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}