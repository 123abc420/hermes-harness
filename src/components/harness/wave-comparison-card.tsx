'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { STATUS_COLORS } from './wave-detail-dialog';
import { formatDuration } from '@/lib/constants';
import type { Wave } from '@/store/harness-store';

/* ── Delta indicator ─────────────────────────────────── */
function Delta({ current, previous, invert = false }: { current: number; previous: number; invert?: boolean }) {
  const diff = current - previous;
  if (diff === 0) {
    return <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-600"><Minus className="h-2.5 w-2.5" />0</span>;
  }
  const isPositive = invert ? diff < 0 : diff > 0;
  const Icon = diff > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      <Icon className="h-2.5 w-2.5" />
      {diff > 0 ? '+' : ''}{diff}
    </span>
  );
}

/* ── Single wave column ──────────────────────────────── */
function WaveColumn({ wave, label }: { wave: Wave; label: string }) {
  const duration = wave.completedAt && wave.startedAt
    ? Math.round((new Date(wave.completedAt).getTime() - new Date(wave.startedAt).getTime()) / 1000)
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-zinc-600">{label}</span>
        <span className="font-mono text-sm font-bold text-white">#{String(wave.waveNumber).padStart(3, '0')}</span>
        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-mono font-medium ${STATUS_COLORS[wave.status] ?? STATUS_COLORS.pending}`}>
          {wave.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2">
        {[
          { label: 'Decisions', value: wave.decisionsCount, color: 'text-cyan-400' },
          { label: 'Improved', value: wave.improvementsCount, color: 'text-emerald-400' },
          { label: 'Errors', value: wave.errorsCount, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">{stat.label}</span>
            <span className={`font-mono text-sm font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}

        <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Duration</span>
          <span className="font-mono text-sm text-zinc-300">
            {duration !== null ? formatDuration(duration) : '—'}
          </span>
        </div>
      </div>

      {wave.summary && (
        <p className="text-[11px] leading-relaxed text-zinc-500 line-clamp-3">{wave.summary}</p>
      )}
    </div>
  );
}

/* ── Wave Comparison Card ────────────────────────────── */
export function WaveComparisonCard({ waves }: { waves: Wave[] }) {
  // Pick the 2 most recent completed waves
  const completed = waves.filter(w => w.status === 'completed');
  const [waveB, waveA] = completed.length >= 2 ? [completed[0], completed[1]] : [completed[0], null];

  if (!waveA || !waveB) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-amber-400" />
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Wave Comparison
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <WaveColumn wave={waveB} label="Latest" />
          <div className="relative">
            <WaveColumn wave={waveA} label="Previous" />
            {/* Delta overlay */}
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-3 py-2">
              <span className="text-[9px] uppercase tracking-wider text-amber-400/70">Delta</span>
              <Delta current={waveB.decisionsCount} previous={waveA.decisionsCount} />
              <Delta current={waveB.improvementsCount} previous={waveA.improvementsCount} />
              <Delta current={waveB.errorsCount} previous={waveA.errorsCount} invert />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}