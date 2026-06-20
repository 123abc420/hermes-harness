'use client';

import { useState, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useHarnessStore, type Decision } from '@/store/harness-store';
import { ChevronDown, FileCode2, CheckCircle2, XCircle, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { CATEGORY_TW } from '@/lib/category-colors';

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400',
  high: 'bg-orange-500/15 text-orange-400',
  medium: 'bg-amber-500/15 text-amber-400',
  low: 'bg-zinc-500/15 text-zinc-400',
};

/* ── Outcome Badge ───────────────────────────────────── */
function OutcomeBadge({ outcome }: { outcome: string | null }) {
  if (!outcome) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-600 bg-white/[0.02] border border-white/[0.04]">
        <CircleDot className="h-2.5 w-2.5" />
        pending
      </span>
    );
  }
  const isSuccess = outcome === 'success' || outcome === 'success_verified';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium border',
        isSuccess
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-red-400 bg-red-500/10 border-red-500/20'
      )}
    >
      {isSuccess ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
      {outcome}
    </span>
  );
}

/* ── Decision Card ───────────────────────────────────── */
export const DecisionCard = memo(function DecisionCard({ decision }: { decision: Decision }) {
  const setActiveTab = useHarnessStore(s => s.setActiveTab);
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="glass-card group transition-all hover:border-white/10">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-medium',
                  CATEGORY_TW[decision.category] ?? CATEGORY_TW.code_quality
                )}
              >
                {decision.category.replace('_', ' ')}
              </span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-mono font-medium',
                  PRIORITY_STYLES[decision.priority] ?? PRIORITY_STYLES.medium
                )}
              >
                {decision.priority}
              </span>
              <OutcomeBadge outcome={decision.outcome} />
            </div>
            <span
              className={cn(
                'text-[10px] font-mono font-medium',
                decision.action === 'executed'
                  ? 'text-emerald-400'
                  : decision.action === 'failed'
                    ? 'text-red-400'
                    : decision.action === 'skipped'
                      ? 'text-zinc-500'
                      : 'text-amber-400'
              )}
            >
              {decision.action.toUpperCase()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-sm text-zinc-200">{decision.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-zinc-600">
            {decision.wave && (
              <button
                onClick={() => setActiveTab('waves')}
                className="font-mono text-zinc-500 hover:text-amber-400 transition-colors"
              >
                Wave {decision.wave.waveNumber}
              </button>
            )}
            <span>
              {formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}
            </span>
            {decision.targetFile && (
              <span className="flex items-center gap-1 font-mono text-zinc-500">
                <FileCode2 className="h-3 w-3" />
                {decision.targetFile}
              </span>
            )}
          </div>

          {/* Expandable reasoning + outcome */}
          {(decision.reasoning || decision.outcome) && (
            <>
              <CollapsibleTrigger className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    open && 'rotate-180'
                  )}
                />
                {open ? 'Hide' : 'Show'} details
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                  {decision.reasoning && (
                    <div>
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Reasoning
                      </p>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {decision.reasoning}
                      </p>
                    </div>
                  )}
                  {decision.outcome && (
                    <div>
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Outcome
                      </p>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {decision.outcome}
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </>
          )}
        </CardContent>
      </Card>
    </Collapsible>
  );
});