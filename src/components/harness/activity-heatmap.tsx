'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { subDays, format, startOfDay } from 'date-fns';

interface HeatmapWave {
  startedAt: string;
  status: string;
}

/* ── Day cell in the heatmap ─────────────────────────── */
function HeatCell({
  count,
  completed,
  failed,
  interrupted,
  isFuture,
  date,
}: {
  count: number;
  completed: number;
  failed: number;
  interrupted: number;
  isFuture: boolean;
  date: Date;
}) {
  // Determine cell color based on wave status
  let bg = 'bg-white/[0.03]';
  let title = '';

  if (isFuture) {
    bg = 'bg-transparent';
    title = format(date, 'MMM d');
  } else if (count === 0) {
    bg = 'bg-white/[0.03]';
    title = `${format(date, 'MMM d')} — No activity`;
  } else if (failed > 0) {
    const intensity = Math.min(failed * 0.4, 1);
    bg = `rgba(239, 68, 68, ${0.15 + intensity * 0.45})`;
    title = `${format(date, 'MMM d')} — ${count} waves (${completed} ok, ${failed} fail)`;
  } else if (interrupted > 0) {
    const intensity = Math.min(interrupted * 0.4, 1);
    bg = `rgba(245, 158, 11, ${0.15 + intensity * 0.45})`;
    title = `${format(date, 'MMM d')} — ${count} waves (${completed} ok, ${interrupted} interrupted)`;
  } else {
    const intensity = Math.min(completed * 0.2, 1);
    bg = `rgba(16, 185, 129, ${0.1 + intensity * 0.5})`;
    title = `${format(date, 'MMM d')} — ${completed} completed`;
  }

  return (
    <div
      className={`h-[10px] w-[10px] rounded-[2px] transition-colors duration-200 ${!isFuture && count > 0 ? 'hover:ring-1 hover:ring-white/20 hover:brightness-125' : ''}`}
      style={{ backgroundColor: bg }}
      title={title}
      role="img"
      aria-label={title}
    />
  );
}

/* ── Activity Heatmap ────────────────────────────────── */
export function ActivityHeatmap({ waves }: { waves: HeatmapWave[] }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const startDate = useMemo(() => subDays(today, 83), [today]); // 12 weeks = 84 days, show 84

  // Build day -> wave counts map
  const dayMap = useMemo(() => {
    const map = new Map<string, { completed: number; failed: number; interrupted: number; total: number }>();
    for (const w of waves) {
      const dayStart = startOfDay(new Date(w.startedAt));
      const key = dayStart.toISOString();
      const existing = map.get(key) ?? { completed: 0, failed: 0, interrupted: 0, total: 0 };
      existing.total++;
      if (w.status === 'completed') existing.completed++;
      else if (w.status === 'failed') existing.failed++;
      else if (w.status === 'interrupted') existing.interrupted++;
      map.set(key, existing);
    }
    return map;
  }, [waves]);

  // Generate 84 days grid (12 weeks × 7 days)
  const grid = useMemo(() => {
    const days: { date: Date; key: string; count: number; completed: number; failed: number; interrupted: number; isFuture: boolean }[] = [];
    for (let i = 0; i < 84; i++) {
      const date = subDays(today, 83 - i);
      const key = startOfDay(date).toISOString();
      const data = dayMap.get(key) ?? { total: 0, completed: 0, failed: 0, interrupted: 0 };
      const isFuture = date > today;
      days.push({
        date,
        key,
        count: data.total,
        completed: data.completed,
        failed: data.failed,
        interrupted: data.interrupted,
        isFuture,
      });
    }
    return days;
  }, [today, dayMap]);

  // Arrange into columns (weeks), 7 rows per column (Mon-Sun)
  // Actually: each column is a day-of-week, 12 rows = 12 weeks
  // GitHub style: columns = weeks, rows = days (Mon-Sun)
  const weeks: typeof grid[] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  // Stats
  const totalActive = dayMap.size;
  const totalWavesCount = waves.length;

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = '';
  weeks.forEach((week, idx) => {
    const firstDay = week[0]?.date;
    if (firstDay) {
      const month = format(firstDay, 'MMM');
      if (month !== lastMonth) {
        monthLabels.push({ label: month, col: idx });
        lastMonth = month;
      }
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
    >
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-amber-400/70" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Wave Activity</span>
              <span className="text-[9px] font-mono text-zinc-600">{totalWavesCount} waves in {totalActive} active days</span>
            </div>
          </div>

          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 pl-6">
            {monthLabels.map(({ label, col }) => (
              <span
                key={`${label}-${col}`}
                className="text-[8px] font-mono text-zinc-600 shrink-0"
                style={{ width: 13 }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Day labels + Grid */}
          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-[3px] shrink-0">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                <div key={i} className="h-[10px] flex items-center text-[7px] font-mono text-zinc-600 w-5">
                  {d}
                </div>
              ))}
            </div>
            {/* Weeks grid */}
            <div className="flex gap-[3px] overflow-x-auto scrollbar-dark">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => (
                    <HeatCell
                      key={day.key}
                      count={day.count}
                      completed={day.completed}
                      failed={day.failed}
                      interrupted={day.interrupted}
                      isFuture={day.isFuture}
                      date={day.date}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-600">
              <span>Less</span>
              <div className="flex gap-[2px]">
                <div className="h-[10px] w-[10px] rounded-[2px] bg-white/[0.03]" />
                <div className="h-[10px] w-[10px] rounded-[2px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }} />
                <div className="h-[10px] w-[10px] rounded-[2px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.4)' }} />
                <div className="h-[10px] w-[10px] rounded-[2px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.6)' }} />
              </div>
              <span>More</span>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-mono">
              <span className="flex items-center gap-1">
                <div className="h-[8px] w-[8px] rounded-[2px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.5)' }} />
                <span className="text-zinc-600">Completed</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="h-[8px] w-[8px] rounded-[2px]" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
                <span className="text-zinc-600">Failed</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="h-[8px] w-[8px] rounded-[2px]" style={{ backgroundColor: 'rgba(245, 158, 11, 0.5)' }} />
                <span className="text-zinc-600">Interrupted</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
