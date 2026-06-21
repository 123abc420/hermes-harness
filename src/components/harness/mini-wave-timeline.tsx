'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import type { Wave } from '@/store/harness-store';

export function MiniWaveTimeline({ waves }: { waves: Wave[] }) {
  if (waves.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-sm text-zinc-600">No waves recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-72 space-y-0 overflow-y-auto scrollbar-dark px-5 pb-4">
          {waves.slice(0, 5).map((wave, i) => {
            const statusColor =
              wave.status === 'completed'
                ? 'border-emerald-500 bg-emerald-500/20'
                : wave.status === 'failed'
                  ? 'border-red-500 bg-red-500/20'
                  : wave.status === 'running'
                    ? 'border-amber-500 bg-amber-500/20'
                    : 'border-zinc-600 bg-zinc-600/20';

            return (
              <div key={wave.id} className="relative flex gap-3 py-3">
                {i < Math.min(waves.length, 5) - 1 && (
                  <div className="absolute left-[9px] top-6 h-full w-px bg-white/[0.06]" />
                )}
                <div
                  className={cn('relative z-10 mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full border-2', statusColor)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-white">
                      WAVE {wave.waveNumber}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[9px] font-mono font-medium',
                        wave.status === 'completed' && 'bg-emerald-500/10 text-emerald-400',
                        wave.status === 'failed' && 'bg-red-500/10 text-red-400',
                        wave.status === 'running' && 'bg-amber-500/10 text-amber-400',
                        wave.status !== 'completed' && wave.status !== 'failed' && wave.status !== 'running' && 'bg-zinc-500/10 text-zinc-400'
                      )}
                    >
                      {wave.status.toUpperCase()}
                    </span>
                  </div>
                  {wave.summary && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {wave.summary}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    {wave._count?.decisions ?? wave.decisionsCount} decisions &middot;{' '}
                    {formatDistanceToNow(new Date(wave.startedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}