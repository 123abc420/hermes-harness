'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { WaveStatus } from '@/lib/schemas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWave } from '@/hooks/use-harness-data';
import { CATEGORY_TW } from '@/lib/category-colors';
import { formatDuration } from '@/lib/constants';
import { Copy, Check, ChevronDown, Eye, Lightbulb, Play, ShieldCheck, Save, FileText } from 'lucide-react';

const STATUS_COLORS: Record<WaveStatus, string> = {
  running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  interrupted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  error: 'bg-red-600/10 text-red-500 border-red-600/20',
  pending: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export { STATUS_COLORS };

/* ── Copy Button ─────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy — clipboard not available');
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="shrink-0 inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
      aria-label="Copy summary"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

/* ── Decision Item (in dialog) ──────────────────────── */
function DecisionItem({ d }: { d: { id: string; category: string; action: string; description: string; reasoning: string | null; outcome: string | null; targetFile: string | null } }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!(d.reasoning || d.outcome);

  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(
          'rounded border px-1.5 py-0.5 text-[10px] font-mono font-medium',
          CATEGORY_TW[d.category] ?? 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        )}>
          {d.category.replace('_', ' ')}
        </span>
        <span className={cn(
          'text-[10px] font-mono',
          d.action === 'executed' ? 'text-emerald-400' : d.action === 'failed' ? 'text-red-400' : 'text-zinc-500',
        )}>
          {d.action}
        </span>
        {d.outcome && (
          <span className={cn(
            'text-[9px] font-mono rounded px-1 py-0.5 border',
            d.outcome === 'success' || d.outcome === 'success_verified'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-red-400 bg-red-500/10 border-red-500/20',
          )}>
            {d.outcome}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-300">{d.description}</p>
      {d.targetFile && (
        <p className="mt-1 text-[10px] font-mono text-zinc-600 truncate">{d.targetFile}</p>
      )}
      {hasDetails && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
          {expanded ? 'Hide' : 'Show'} details
        </button>
      )}
      {expanded && hasDetails && (
        <div className="mt-2 space-y-2 rounded-lg bg-white/[0.02] p-2.5 border border-white/[0.04]">
          {d.reasoning && (
            <div>
              <p className="mb-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-600">Reasoning</p>
              <p className="text-[11px] leading-relaxed text-zinc-400">{d.reasoning}</p>
            </div>
          )}
          {d.outcome && (
            <div>
              <p className="mb-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-600">Outcome</p>
              <p className="text-[11px] leading-relaxed text-zinc-400">{d.outcome}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Phase Timeline ───────────────────────────────── */
const WAVE_PHASES = [
  { key: 'assess',   label: 'ASSESS',  icon: Eye,        color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    dot: 'bg-sky-400' },
  { key: 'plan',     label: 'PLAN',    icon: Lightbulb,  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  dot: 'bg-amber-400' },
  { key: 'execute',  label: 'EXECUTE', icon: Play,       color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  { key: 'verify',   label: 'VERIFY',  icon: ShieldCheck, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  { key: 'persist',  label: 'PERSIST', icon: Save,       color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   dot: 'bg-cyan-400' },
  { key: 'report',   label: 'REPORT',  icon: FileText,   color: 'text-lime-400',   bg: 'bg-lime-500/10',   border: 'border-lime-500/20',   dot: 'bg-lime-400' },
] as const;

function getCompletedPhaseIndex(status: string): number {
  if (status === 'completed') return 6;
  if (status === 'failed') return 3;    // typically fails during VERIFY
  if (status === 'interrupted') return 2; // typically interrupted during EXECUTE
  if (status === 'running') return 3;     // best guess: mid-wave
  return 0; // pending
}

function WavePhaseTimeline({ status }: { status: string }) {
  const completedIdx = getCompletedPhaseIndex(status);
  const isRunning = status === 'running';

  return (
    <div>
      <h3 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Wave Protocol Phases</h3>
      <p className="mb-3 text-[9px] text-zinc-600 italic">Phase progress estimated from final wave status</p>
      <div className="relative flex items-start gap-0">
        {WAVE_PHASES.map((phase, idx) => {
          const PhaseIcon = phase.icon;
          const isCompleted = idx < completedIdx;
          const isCurrent = idx === completedIdx && (isRunning || status === 'pending');
          const isPending = idx >= completedIdx && !isCurrent;

          return (
            <div key={phase.key} className="relative flex flex-1 flex-col items-center">
              {/* Connector line (not on last item) */}
              {idx < WAVE_PHASES.length - 1 && (
                <div className={cn(
                  'absolute left-1/2 top-2.5 h-px w-full',
                  idx < completedIdx - 1 ? 'bg-zinc-500/40' : 'bg-zinc-800',
                )} />
              )}
              {/* Dot */}
              <div className={cn(
                'relative z-10 flex h-5 w-5 items-center justify-center rounded-full border transition-all',
                isCompleted && [phase.bg, phase.border],
                isCurrent && [phase.bg, phase.border, 'ring-2 ring-offset-1 ring-offset-[#0f172a] ring-current animate-pulse'],
                !isCompleted && !isCurrent && 'border-zinc-800 bg-zinc-900',
              ) }>
                <PhaseIcon className={cn('h-2.5 w-2.5',
                  (isCompleted || isCurrent) ? phase.color : 'text-zinc-700',
                )} />
              </div>
              {/* Label */}
              <span className={cn(
                'mt-1.5 text-[8px] font-mono font-medium sm:text-[9px]',
                (isCompleted || isCurrent) ? phase.color : 'text-zinc-700',
              )}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Wave Detail Dialog ─────────────────────────────── */
export function WaveDetailDialog({
  waveId,
  onClose,
}: {
  waveId: string | null;
  onClose: () => void;
}) {
  const { data: wave, isLoading } = useWave(waveId);

  return (
    <Dialog open={!!waveId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] border-white/[0.08] bg-[#0f172a] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {wave ? `Wave ${wave.waveNumber}` : isLoading ? 'Loading wave...' : 'Wave'}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4 p-1">
            <div className="flex gap-2"><Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-20" /></div>
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <Skeleton className="mx-auto mb-1 h-6 w-8" />
                  <Skeleton className="mx-auto h-2.5 w-12" />
                </div>
              ))}
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : wave ? (
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium',
                    STATUS_COLORS[wave.status],
                  )}>
                  {wave.status.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(wave.startedAt), { addSuffix: true })}
                </span>
                {wave.completedAt && (
                  <span className="text-[10px] font-mono text-zinc-600">
                    Duration: {formatDuration(Math.round((new Date(wave.completedAt).getTime() - new Date(wave.startedAt).getTime()) / 1000))}
                  </span>
                )}
              </div>
              {wave.summary && (
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm text-zinc-400">{wave.summary}</p>
                  <CopyButton text={wave.summary} />
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Decisions', value: wave.decisions?.length ?? wave.decisionsCount, color: 'text-cyan-400' },
                  { label: 'Improved', value: wave.improvementsCount, color: 'text-emerald-400' },
                  { label: 'Errors', value: wave.errorsCount, color: 'text-red-400' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                    <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-600">{stat.label}</p>
                  </div>
                ))}
              </div>
              {/* Phase Timeline */}
              <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                <WavePhaseTimeline status={wave.status} />
              </div>
              {wave.decisions && wave.decisions.length > 0 && (
                <div>
                  <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Decisions</h3>
                  <div className="space-y-2">
                    {wave.decisions.map((d) => (
                      <DecisionItem key={d.id} d={d} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}