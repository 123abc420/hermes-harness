'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { formatDistanceToNow } from 'date-fns';
import type { Wave } from '@/store/harness-store';

const MILESTONE_WAVES = [1, 10, 25, 50, 75, 100];

export function MilestonesTimeline({ waves, totalWaves, skillsCount }: { waves: Wave[]; totalWaves: number; skillsCount?: number }) {
  const allWaveNumbers = waves.map(w => w.waveNumber).sort((a, b) => a - b);
  const firstWave = allWaveNumbers[0];
  const latestWave = allWaveNumbers[allWaveNumbers.length - 1];
  const reduced = usePrefersReducedMotion();

  const milestones: { wave: number; label: string; time: string; summary?: string }[] = [];

  if (firstWave) {
    const w = waves.find(w => w.waveNumber === firstWave);
    milestones.push({ wave: firstWave, label: 'First Wave', time: w?.startedAt ?? '', summary: w?.summary ?? undefined });
  }

  for (const m of MILESTONE_WAVES) {
    if (m === 1 || m > totalWaves) continue;
    const w = waves.find(w => w.waveNumber === m);
    if (w) {
      milestones.push({ wave: m, label: `Wave ${m}`, time: w.startedAt, summary: w.summary ?? undefined });
    }
  }

  if (latestWave && latestWave !== firstWave && !MILESTONE_WAVES.includes(latestWave)) {
    const w = waves.find(w => w.waveNumber === latestWave);
    milestones.push({ wave: latestWave, label: 'Latest', time: w?.startedAt ?? '', summary: w?.summary ?? undefined });
  }

  if (skillsCount && skillsCount >= 10) {
    milestones.push({ wave: 0, label: `${skillsCount} Skills`, time: '', summary: 'Agent knowledge base' });
  }

  if (milestones.length < 2) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Evolution Milestones
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex h-24 items-center justify-center">
          <div className="text-center">
            <Trophy className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
            <p className="text-xs text-zinc-600">Not enough waves for milestones</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Evolution Milestones
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-52 overflow-y-auto scrollbar-dark px-5 pb-4">
          {milestones.map((m, i) => (
            <motion.div
              key={`${m.wave}-${m.label}`}
              className="relative flex gap-3 py-2.5"
              initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              animate={reduced ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
              transition={reduced ? { duration: 0 } : { delay: i * 0.05 }}
            >
              {i < milestones.length - 1 && (
                <div className="absolute left-[7px] top-7 h-full w-px bg-amber-500/10" />
              )}
              <div className="relative z-10 mt-0.5 h-[16px] w-[16px] shrink-0 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-300/90">{m.label}</span>
                  {m.time && (
                    <span className="text-[10px] font-mono text-zinc-600">
                      {formatDistanceToNow(new Date(m.time), { addSuffix: false })}
                    </span>
                  )}
                </div>
                {m.summary && (
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">{m.summary}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}