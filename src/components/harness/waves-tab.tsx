'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWaves, useWave, useCreateWave } from '@/hooks/use-harness-data';
import { useHarnessStore } from '@/store/harness-store';
import { Play, Loader2, Waves as WavesIcon, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ErrorBlock } from './error-block';

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  interrupted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'interrupted', label: 'Interrupted' },
  { value: 'failed', label: 'Failed' },
];

export function WavesTab() {
  const { waveFilter, setWaveFilter } = useHarnessStore();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [page, setPage] = useState(1);
  const limit = 30;

  const { data, isLoading, isError, error, refetch } = useWaves(page, limit, waveFilter);
  const { data: waveDetail } = useWave(detailId);
  const createWave = useCreateWave();

  const waves = data?.waves ?? [];
  const totalWaves = data?.total ?? 0;
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
          {/* Filter buttons — scrollable on mobile */}
          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5 overflow-x-auto max-w-[220px] sm:max-w-none scrollbar-dark">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                aria-pressed={waveFilter === opt.value}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 ${
                  waveFilter === opt.value
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Trigger wave */}
          <Dialog open={triggerOpen} onOpenChange={setTriggerOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
                aria-label="Trigger new wave"
              >
                <Play className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Trigger Wave</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/[0.08] bg-[#0f172a] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Trigger New Wave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Optional summary for this wave..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-600"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTriggerOpen(false)}
                    className="text-zinc-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      createWave.mutate(summary || undefined);
                      setSummary('');
                      setTriggerOpen(false);
                    }}
                    disabled={createWave.isPending}
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {createWave.isPending && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    Start Wave
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error State */}
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
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card">
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <WavesIcon className="h-8 w-8 text-zinc-700" />
                </div>
                <p className="text-sm font-medium text-zinc-400">
                  No waves yet
                </p>
                <p className="mt-1 max-w-xs text-xs text-zinc-600">
                  The harness will start improving automatically via cron jobs.
                  You can also trigger a wave manually.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card overflow-hidden">
            <ScrollArea className="max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Wave #
                    </TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Status
                    </TableHead>
                    <TableHead className="hidden text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">
                      Decisions
                    </TableHead>
                    <TableHead className="hidden text-[10px] font-medium uppercase tracking-wider text-zinc-500 md:table-cell">
                      Improved
                    </TableHead>
                    <TableHead className="hidden text-[10px] font-medium uppercase tracking-wider text-zinc-500 lg:table-cell">
                      Errors
                    </TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Time
                    </TableHead>
                    <TableHead className="hidden max-w-[200px] text-[10px] font-medium uppercase tracking-wider text-zinc-500 md:table-cell">
                      Summary
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waves.map((wave) => (
                    <TableRow
                      key={wave.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for wave ${wave.waveNumber}`}
                      className="border-white/[0.04] transition-colors hover:bg-white/[0.02] cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400/50 focus-visible:outline-offset-[-2px]"
                      onClick={() => setDetailId(wave.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDetailId(wave.id);
                        }
                      }}
                    >
                      <TableCell className="font-mono text-xs font-bold text-white">
                        #{String(wave.waveNumber).padStart(3, '0')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${
                            STATUS_COLORS[wave.status] ?? STATUS_COLORS.pending
                          }`}
                        >
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
                        {formatDistanceToNow(new Date(wave.startedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-zinc-500 md:table-cell">
                        {wave.summary || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-3">
              <span className="text-[10px] font-mono text-zinc-600">
                Showing {showingCount} of {totalWaves}
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
          </Card>
        </motion.div>
      )}

      {/* Wave Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[80vh] border-white/[0.08] bg-[#0f172a] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {waveDetail ? `Wave ${waveDetail.waveNumber}` : 'Loading...'}
            </DialogTitle>
          </DialogHeader>
          {waveDetail && (
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${
                      STATUS_COLORS[waveDetail.status] ?? STATUS_COLORS.pending
                    }`}
                  >
                    {waveDetail.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(waveDetail.startedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {waveDetail.summary && (
                  <p className="text-sm text-zinc-400">{waveDetail.summary}</p>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: 'Decisions',
                      value: waveDetail.decisions?.length ?? waveDetail.decisionsCount,
                      color: 'text-cyan-400',
                    },
                    {
                      label: 'Improved',
                      value: waveDetail.improvementsCount,
                      color: 'text-emerald-400',
                    },
                    {
                      label: 'Errors',
                      value: waveDetail.errorsCount,
                      color: 'text-red-400',
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center"
                    >
                      <p className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-600">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                {waveDetail.decisions && waveDetail.decisions.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Decisions
                    </h3>
                    <div className="space-y-2">
                      {waveDetail.decisions.map((d) => (
                        <div
                          key={d.id}
                          className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                              {d.category.replace('_', ' ')}
                            </span>
                            <span
                              className={`text-[10px] font-mono ${
                                d.action === 'executed'
                                  ? 'text-emerald-400'
                                  : d.action === 'failed'
                                    ? 'text-red-400'
                                    : 'text-zinc-500'
                              }`}
                            >
                              {d.action}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-300">{d.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}