'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Wave } from '@/store/harness-store';

/* ── Wave Duration Bars ────────────────────────────── */
function DurationEmptyState() {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Wave Duration
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex h-24 items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
          <p className="text-xs text-zinc-600">Need at least 2 completed waves</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function WaveDurationBars({ waves }: { waves: Wave[] }) {
  if (waves.length < 2) return <DurationEmptyState />;

  const durationData = [...waves]
    .reverse()
    .map((w) => {
      if (!w.completedAt || !w.startedAt) return null;
      const ms = new Date(w.completedAt).getTime() - new Date(w.startedAt).getTime();
      return { wave: w.waveNumber, seconds: Math.max(0, Math.round(ms / 1000)), status: w.status };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  if (durationData.length < 2) return <DurationEmptyState />;

  const maxSec = Math.max(...durationData.map((d) => d.seconds), 1);
  const avgSec = Math.round(durationData.reduce((s, d) => s + d.seconds, 0) / durationData.length);

  const barColor = (status: string) =>
    status === 'completed'
      ? 'bg-emerald-500/60'
      : status === 'failed'
        ? 'bg-red-500/60'
        : status === 'interrupted'
          ? 'bg-amber-500/60'
          : 'bg-blue-500/60';

  const barTrack = 'bg-white/[0.04]';

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Wave Duration
            </CardTitle>
          </div>
          <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-500">
            avg {avgSec}s
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {durationData.map((d) => {
            const pct = (d.seconds / maxSec) * 100;
            return (
              <div key={d.wave} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-right text-[10px] font-mono text-zinc-500">
                  W{d.wave}
                </span>
                <div className={cn('h-3 flex-1 rounded-full overflow-hidden', barTrack)}>
                  <motion.div
                    className={cn('h-full rounded-full', barColor(d.status))}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-[10px] font-mono tabular-nums text-zinc-500">
                  {d.seconds}s
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}