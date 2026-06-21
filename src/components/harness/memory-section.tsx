'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemory } from '@/hooks/use-harness-data';
import { Brain, Lightbulb, Database, User, AlertTriangle } from 'lucide-react';
import { ErrorBlock } from './error-block';

function HealthBar({ chars, cap, pct }: { chars: number; cap?: number; pct?: number }) {
  if (!cap || pct === undefined) {
    return <span className="text-[9px] font-mono text-zinc-600">{chars} chars</span>;
  }

  const isOver = pct > 90;
  const barColor = isOver
    ? 'bg-red-500'
    : pct > 70
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      {isOver && <AlertTriangle className="h-3 w-3 shrink-0 text-red-400" />}
      <span className={cn('text-[9px] font-mono shrink-0', isOver ? 'text-red-400' : 'text-zinc-600')}>
        {pct}%
      </span>
    </div>
  );
}

/* ── Memory Section ───────────────────────────────────── */
export function MemorySection() {
  const { data, isLoading, isError, error, refetch } = useMemory();
  const health = data?.health;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Memory Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <ErrorBlock message={error?.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : (
          <>
            {/* Context */}
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3 text-cyan-400" />
                  <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Context
                  </h3>
                </div>
                {health?.context && (
                  <HealthBar chars={health.context.chars} cap={health.context.cap} pct={health.context.pct} />
                )}
              </div>
              {data?.context ? (
                <ScrollArea className="max-h-48 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 font-mono">
                    {data.context}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-xs text-zinc-600">No context stored yet</p>
                </div>
              )}
            </div>

            {/* Insights */}
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3 w-3 text-amber-400" />
                  <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Insights
                  </h3>
                </div>
                {health?.insights && (
                  <HealthBar chars={health.insights.chars} cap={health.insights.cap} pct={health.insights.pct} />
                )}
              </div>
              {data?.insights ? (
                <ScrollArea className="max-h-48 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 font-mono">
                    {data.insights}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-xs text-zinc-600">No insights recorded yet</p>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-sky-400" />
                  <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    User Profile
                  </h3>
                </div>
                {health?.userProfile && (
                  <span className="text-[9px] font-mono text-zinc-600">{health.userProfile.chars} chars</span>
                )}
              </div>
              {data?.userProfile ? (
                <ScrollArea className="max-h-48 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 font-mono">
                    {data.userProfile}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-xs text-zinc-600">No user profile stored yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}