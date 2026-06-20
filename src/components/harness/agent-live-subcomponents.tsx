'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { AgentVisualState, LiveActivityEntry } from '@/store/agent-live-store';

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
  { key: 'assess', label: 'ASSESS', color: 'text-cyan-400' },
  { key: 'plan', label: 'PLAN', color: 'text-violet-400' },
  { key: 'execute', label: 'EXECUTE', color: 'text-rose-400' },
  { key: 'verify', label: 'VERIFY', color: 'text-emerald-400' },
  { key: 'persist', label: 'PERSIST', color: 'text-amber-400' },
  { key: 'report', label: 'REPORT', color: 'text-sky-400' },
] as const;

// ─── Activity Entry ────────────────────────────────────────────────
export function ActivityEntry({ entry, isNew }: { entry: LiveActivityEntry; isNew: boolean }) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -16 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.02] transition-colors"
    >
      <span className="text-sm mt-0.5 shrink-0">
        {STATE_ICONS[entry.state] || '•'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-zinc-200 leading-relaxed break-all">
          {entry.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <ClockIcon />
          <span className="text-[10px] text-zinc-500 font-mono">{entry.timestampAR || '—'}</span>
          {entry.phase && (
            <span className="text-[9px] text-zinc-600 font-mono uppercase bg-white/[0.03] px-1.5 py-0.5 rounded">
              {entry.phase}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Inline clock icon (avoids importing Clock from lucide in the sub-component file)
function ClockIcon() {
  return (
    <svg className="h-2.5 w-2.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ─── Wave Phase Tracker ──────────────────────────────────────────────
export function PhaseTracker({ phase, progress }: { phase: string; progress: number }) {
  const currentIndex = PHASE_STEPS.findIndex(p => p.key === phase);
  return (
    <div className="flex items-center gap-1 mt-2.5">
      {PHASE_STEPS.map((p, i) => {
        const isCompleted = currentIndex > i || (currentIndex === i && progress > 0.8);
        const isCurrent = currentIndex === i;
        return (
          <div key={p.key} className="flex items-center gap-1">
            <div
              className={`
                flex items-center justify-center w-7 h-7 rounded-md text-[9px] font-bold transition-all duration-500
                ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40' :
                  isCurrent ? `${p.color} bg-white/5 ring-1 ring-white/20 animate-pulse` :
                  'bg-white/[0.02] text-zinc-600 ring-1 ring-white/[0.05]'}
              `}
            >
              {isCompleted ? '✓' : p.label[0]}
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <div className={`w-4 h-px ${currentIndex > i ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-Agent Badge ─────────────────────────────────────────────────
export function SubAgentBadge({ name, color, state }: { name: string; color: string; state: AgentVisualState }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
    >
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-[10px] text-zinc-300 font-mono truncate max-w-[90px]">{name}</span>
      <span className="text-[10px]">{STATE_ICONS[state]}</span>
    </motion.div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, subtitle, iconColor }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle: string;
  iconColor: string;
}) {
  return (
    <Card className="border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors min-h-[80px]">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <span className="text-[11px] font-mono text-zinc-400 tracking-wider">{label}</span>
        </div>
        <div className="mt-2">
          <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
          <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}