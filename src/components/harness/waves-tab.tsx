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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StatusBadge } from './status-badge';
import { useWaves, useWave, useCreateWave } from '@/hooks/use-harness-data';
import { useHarnessStore, type Wave, type Decision } from '@/store/harness-store';
import { Play, ExternalLink, X, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const statusColor: Record<string, string> = {
  running: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30',
  pending: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

export function WavesTab() {
  const { waveFilter, setWaveFilter } = useHarnessStore();
  const { selectedWaveId, setSelectedWaveId } = useHarnessStore();
  const { triggerDialogOpen, setTriggerDialogOpen } = useHarnessStore();
  const [triggerSummary, setTriggerSummary] = useState('');

  const { data, isLoading } = useWaves(1, 30, waveFilter);
  const { data: waveDetail } = useWave(selectedWaveId);
  const createWave = useCreateWave();

  const waves = data?.waves ?? [];

  const handleTrigger = () => {
    createWave.mutate(triggerSummary || undefined);
    setTriggerSummary('');
    setTriggerDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-zinc-400">Wave History</h2>
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="flex rounded-lg border border-white/10 p-0.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setWaveFilter(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  waveFilter === opt.value
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Trigger wave */}
          <Dialog open={triggerDialogOpen} onOpenChange={setTriggerDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <Play className="h-3.5 w-3.5" />
                Trigger Wave
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-zinc-900 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Trigger New Wave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Optional summary for this wave..."
                  value={triggerSummary}
                  onChange={(e) => setTriggerSummary(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTriggerDialogOpen(false)}
                    className="text-zinc-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleTrigger}
                    disabled={createWave.isPending}
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {createWave.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    Start Wave
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : waves.length === 0 ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="flex h-48 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-zinc-500">No waves recorded yet</p>
              <p className="mt-1 text-xs text-zinc-600">Trigger a wave to begin self-evolution</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/10 bg-white/[0.03] overflow-hidden">
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-xs text-zinc-500">Wave #</TableHead>
                  <TableHead className="text-xs text-zinc-500">Status</TableHead>
                  <TableHead className="hidden text-xs text-zinc-500 sm:table-cell">Decisions</TableHead>
                  <TableHead className="hidden text-xs text-zinc-500 md:table-cell">Improvements</TableHead>
                  <TableHead className="hidden text-xs text-zinc-500 lg:table-cell">Errors</TableHead>
                  <TableHead className="text-xs text-zinc-500">Started</TableHead>
                  <TableHead className="hidden text-xs text-zinc-500 md:table-cell">Summary</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waves.map((wave) => (
                  <TableRow
                    key={wave.id}
                    className="border-white/5 transition-colors hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => setSelectedWaveId(wave.id)}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-white">
                      {wave.waveNumber}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${
                          statusColor[wave.status] ?? statusColor.pending
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
                      {formatDistanceToNow(new Date(wave.startedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-zinc-500 md:table-cell">
                      {wave.summary || '—'}
                    </TableCell>
                    <TableCell>
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-600" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {/* Wave Detail Dialog */}
      <Dialog open={!!selectedWaveId} onOpenChange={(open) => !open && setSelectedWaveId(null)}>
        <DialogContent className="max-h-[80vh] border-white/10 bg-zinc-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {waveDetail ? `Wave ${waveDetail.waveNumber}` : 'Loading...'}
            </DialogTitle>
          </DialogHeader>
          {waveDetail && (
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={waveDetail.status} />
                  <span className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(waveDetail.startedAt), { addSuffix: true })}
                  </span>
                </div>
                {waveDetail.summary && (
                  <p className="text-sm text-zinc-400">{waveDetail.summary}</p>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                    <p className="text-lg font-bold text-white">{waveDetail.decisions?.length ?? waveDetail.decisionsCount}</p>
                    <p className="text-[10px] uppercase text-zinc-500">Decisions</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                    <p className="text-lg font-bold text-emerald-400">{waveDetail.improvementsCount}</p>
                    <p className="text-[10px] uppercase text-zinc-500">Improved</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                    <p className="text-lg font-bold text-red-400">{waveDetail.errorsCount}</p>
                    <p className="text-[10px] uppercase text-zinc-500">Errors</p>
                  </div>
                </div>
                {waveDetail.decisions && waveDetail.decisions.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Decisions
                    </h3>
                    <div className="space-y-2">
                      {waveDetail.decisions.map((d) => (
                        <div
                          key={d.id}
                          className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                        >
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={d.category} />
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

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    code_quality: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    feature: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    fix: 'bg-red-500/15 text-red-400 border-red-500/30',
    refactor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    performance: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    architecture: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  };

  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono font-medium ${
        colors[category] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
      }`}
    >
      {category}
    </span>
  );
}