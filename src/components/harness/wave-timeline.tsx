'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Wave } from '@/store/harness-store';
import { cn } from '@/lib/utils';

interface WaveTimelineProps {
  waves: Wave[];
}

export function WaveTimeline({ waves }: WaveTimelineProps) {
  if (waves.length === 0) {
    return (
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
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
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-72">
          <div className="space-y-0 px-4 pb-4">
            {waves.slice(0, 8).map((wave, i) => (
              <div key={wave.id} className="relative flex gap-3 py-3">
                {/* Timeline line */}
                {i < waves.length - 1 && (
                  <div className="absolute left-[9px] top-6 h-full w-px bg-white/10" />
                )}
                {/* Dot */}
                <div
                  className={cn(
                    'relative z-10 mt-1.5 h-[18px] w-[18px] shrink-0 rounded-full border-2',
                    wave.status === 'completed'
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : wave.status === 'failed'
                        ? 'border-red-500 bg-red-500/20'
                        : wave.status === 'running'
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-zinc-600 bg-zinc-600/20'
                  )}
                />
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-white">
                      WAVE {wave.waveNumber}
                    </span>
                    <StatusBadge status={wave.status} />
                  </div>
                  {wave.summary && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{wave.summary}</p>
                  )}
                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    {wave._count?.decisions ?? wave.decisionsCount} decisions ·{' '}
                    {formatDistanceToNow(new Date(wave.startedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}