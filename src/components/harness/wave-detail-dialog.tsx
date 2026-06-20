'use client';

import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWave } from '@/hooks/use-harness-data';
import { CATEGORY_TW } from '@/lib/category-colors';
import { formatDuration } from '@/lib/constants';

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  interrupted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export { STATUS_COLORS };

export function WaveDetailDialog({
  waveId,
  onClose,
}: {
  waveId: string | null;
  onClose: () => void;
}) {
  const { data: wave } = useWave(waveId);

  return (
    <Dialog open={!!waveId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] border-white/[0.08] bg-[#0f172a] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {wave ? `Wave ${wave.waveNumber}` : 'Loading...'}
          </DialogTitle>
        </DialogHeader>
        {wave && (
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${
                    STATUS_COLORS[wave.status] ?? STATUS_COLORS.pending
                  }`}
                >
                  {wave.status.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(wave.startedAt), { addSuffix: true })}
                </span>
                {wave.completedAt && (
                  <span className="text-[10px] font-mono text-zinc-600">
                    Duration: {formatDuration(Math.round((new Date(wave.completedAt).getTime() - new Date(wave.startedAt).getTime()) / 1000))}
                  </span>
                )}
              </div>
              {wave.summary && (
                <p className="text-sm text-zinc-400">{wave.summary}</p>
              )}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Decisions', value: wave.decisions?.length ?? wave.decisionsCount, color: 'text-cyan-400' },
                  { label: 'Improved', value: wave.improvementsCount, color: 'text-emerald-400' },
                  { label: 'Errors', value: wave.errorsCount, color: 'text-red-400' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-600">{stat.label}</p>
                  </div>
                ))}
              </div>
              {wave.decisions && wave.decisions.length > 0 && (
                <div>
                  <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Decisions</h3>
                  <div className="space-y-2">
                    {wave.decisions.map((d) => (
                      <div key={d.id} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                            CATEGORY_TW[d.category] ?? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                          }`}>
                            {d.category.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-mono ${
                            d.action === 'executed' ? 'text-emerald-400' : d.action === 'failed' ? 'text-red-400' : 'text-zinc-500'
                          }`}>
                            {d.action}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-300">{d.description}</p>
                        {d.targetFile && (
                          <p className="mt-1 text-[10px] font-mono text-zinc-600 truncate">{d.targetFile}</p>
                        )}
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
  );
}