'use client';

import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CATEGORY_HEX, CATEGORY_TW } from '@/lib/category-colors';

/* ── Types ─────────────────────────────────────────────── */
interface TrendRow {
  category: string;
  recent: number;
  earlier: number;
}

interface TrendsData {
  trends: TrendRow[];
  range: { earlier: { min: number; max: number }; recent: { min: number; max: number } };
}

/* ── Helpers ───────────────────────────────────────────── */
function fetchTrends(): Promise<TrendsData> {
  return fetch('/api/harness/decisions/trends').then(r => {
    if (!r.ok) throw new Error(`Trends fetch failed: ${r.status}`);
    return r.json();
  });
}

/* ── Component ─────────────────────────────────────────── */
export function CategoryTrendsChart() {
  const { data, isLoading, isError } = useQuery<TrendsData>({
    queryKey: ['decision-trends'],
    queryFn: fetchTrends,
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <Card className="glass-card">
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 flex-1 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (isError || !data?.trends?.length) return null;

  // Take top 8 categories by total count
  const sorted = [...data.trends]
    .map(t => ({ ...t, total: t.recent + t.earlier }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const maxTotal = Math.max(...sorted.map(t => t.total), 1);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Category Trends
            </CardTitle>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-600">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-zinc-600" />
              #{data.range.earlier.min}–{data.range.earlier.max}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              #{data.range.recent.min}–{data.range.recent.max}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {sorted.map((t) => {
          const earlierPct = maxTotal > 0 ? (t.earlier / maxTotal) * 100 : 0;
          const recentPct = maxTotal > 0 ? (t.recent / maxTotal) * 100 : 0;
          const hex = CATEGORY_HEX[t.category] ?? '#71717a';
          const tw = CATEGORY_TW[t.category];
          const diff = t.recent - t.earlier;
          const trendIcon = diff === 0
            ? <Minus className="h-2.5 w-2.5 text-zinc-600" />
            : diff > 0
              ? <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
              : <TrendingDown className="h-2.5 w-2.5 text-red-400" />;

          return (
            <div key={t.category} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: hex }} />
                  <span className={cn('text-[11px] font-medium', tw?.split(' ')[1] ?? 'text-zinc-400')}>
                    {t.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-600">{t.earlier}</span>
                  <span className="text-[9px] text-zinc-700">→</span>
                  <span className="text-[10px] font-mono text-zinc-400">{t.recent}</span>
                  {trendIcon}
                </div>
              </div>
              {/* Stacked bar: earlier (dark) + recent (colored) */}
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full bg-zinc-700/60 transition-all duration-500"
                  style={{ width: `${earlierPct}%` }}
                />
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${recentPct}%`, backgroundColor: hex, opacity: 0.7 }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}