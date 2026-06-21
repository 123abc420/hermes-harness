'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { AgentVisualState } from '@/store/agent-live-store';

// ─── State Configuration (shared across sub-components) ──────────
export const STATE_ICONS: Record<AgentVisualState, string> = {
  idle: '💤', thinking: '🧠', searching: '🔍', planning: '📋',
  executing: '⚡', verifying: '✅', celebrating: '🎉', error: '💥',
  evolving: '🧬', offline: '⚫',
};

export const STATE_COLORS: Record<AgentVisualState, string> = {
  idle: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  thinking: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  searching: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  planning: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  executing: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  verifying: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  celebrating: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  error: 'bg-red-500/15 text-red-300 border-red-500/25',
  evolving: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25',
  offline: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
};

export const PHASE_STEPS = [
  { key: 'assess', label: 'ASSESS', color: 'text-cyan-400', barColor: '#06b6d4', range: [0, 0.15] },
  { key: 'plan', label: 'PLAN', color: 'text-violet-400', barColor: '#a855f7', range: [0.15, 0.25] },
  { key: 'execute', label: 'EXECUTE', color: 'text-rose-400', barColor: '#f43f5e', range: [0.25, 0.70] },
  { key: 'verify', label: 'VERIFY', color: 'text-emerald-400', barColor: '#22c55e', range: [0.70, 0.85] },
  { key: 'persist', label: 'PERSIST', color: 'text-amber-400', barColor: '#f59e0b', range: [0.85, 0.95] },
  { key: 'report', label: 'REPORT', color: 'text-sky-400', barColor: '#38bdf8', range: [0.95, 1.0] },
] as const;

// ─── Wave Phase Tracker (W237: with per-phase progress bar) ──────
export function PhaseTracker({ phase, progress }: { phase: string; progress: number }) {
  const currentIndex = PHASE_STEPS.findIndex(p => p.key === phase);
  return (
    <div className="px-4 py-2.5 rounded-xl bg-black/55 backdrop-blur-xl border border-white/[0.08]">
      <div className="flex items-center gap-1">
        {PHASE_STEPS.map((p, i) => {
          const isCompleted = currentIndex > i || (currentIndex === i && progress > 0.8);
          const isCurrent = currentIndex === i;

          // W237: Calculate per-phase progress
          const [phaseStart, phaseEnd] = p.range;
          const phaseProgress = isCurrent
            ? Math.max(0, Math.min(1, (progress - phaseStart) / (phaseEnd - phaseStart)))
            : isCompleted ? 1 : 0;

          return (
            <div key={p.key} className="flex items-center gap-1">
              <div className="relative flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] font-bold transition-all duration-500',
                    isCompleted && 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40',
                    isCurrent && `${p.color} bg-white/5 ring-1 ring-white/20 animate-pulse`,
                    !isCompleted && !isCurrent && 'bg-white/[0.02] text-zinc-600 ring-1 ring-white/[0.05]'
                  )}
                >
                  {isCompleted ? '✓' : p.label[0]}
                </div>
                {/* W237: Per-phase progress micro-bar */}
                {isCurrent && phaseProgress > 0 && (
                  <div className="w-5 sm:w-6 h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: p.barColor }}
                      animate={{ width: `${phaseProgress * 100}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </div>
              {i < PHASE_STEPS.length - 1 && (
                <div className={cn('w-3 sm:w-4 h-px', currentIndex > i ? 'bg-emerald-500/40' : 'bg-white/[0.06]')} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}