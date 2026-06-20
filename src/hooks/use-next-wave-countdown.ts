'use client';

import { useEffect, useState } from 'react';

interface LatestWave {
  completedAt?: string | null;
  startedAt?: string | null;
}

/**
 * Computes minutes until the next 10-min cron wave.
 * Returns null when a wave is active or no timing baseline exists.
 */
export function useNextWaveCountdown(
  waveNumber: number,
  latestWave: LatestWave | null,
): number | null {
  const [countdownMin, setCountdownMin] = useState<number | null>(null);

  useEffect(() => {
    const compute = () => {
      if (waveNumber > 0 || (!latestWave?.completedAt && !latestWave?.startedAt)) {
        setCountdownMin(null);
        return;
      }
      const base = latestWave.completedAt
        ? new Date(latestWave.completedAt).getTime()
        : new Date(latestWave.startedAt!).getTime();
      const elapsed = (Date.now() - base) / 60_000;
      const remaining = Math.max(0, Math.ceil(10 - elapsed));
      setCountdownMin(remaining <= 10 ? remaining : null);
    };
    compute();
    const id = setInterval(compute, 15_000);
    return () => clearInterval(id);
  }, [waveNumber, latestWave?.completedAt, latestWave?.startedAt]);

  return countdownMin;
}