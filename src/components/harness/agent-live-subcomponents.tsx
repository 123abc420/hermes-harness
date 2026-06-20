'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Zap, Circle, Play, Pause } from 'lucide-react';
import { HERMES_VERSION } from '@/lib/constants';
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
                flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] font-bold transition-all duration-500
                ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40' :
                  isCurrent ? `${p.color} bg-white/5 ring-1 ring-white/20 animate-pulse` :
                  'bg-white/[0.02] text-zinc-600 ring-1 ring-white/[0.05]'}
              `}
            >
              {isCompleted ? '✓' : p.label[0]}
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <div className={`w-3 sm:w-4 h-px ${currentIndex > i ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`} />
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

// ─── Activity Feed Column ───────────────────────────────────────────
export function ActivityFeedColumn({
  activities,
  isConnected,
  isReplaying,
  lastTurnLength,
  onToggleReplay,
}: {
  activities: LiveActivityEntry[];
  isConnected: boolean;
  isReplaying: boolean;
  lastTurnLength: number;
  onToggleReplay: () => void;
}) {
  const feedRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  // Auto-scroll to top on new activity
  useEffect(() => {
    if (activities.length > prevCount.current && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
    prevCount.current = activities.length;
  }, [activities.length]);

  return (
    <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex flex-col">
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-zinc-200">LIVE ACTIVITY</span>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          )}
          <span className="text-xs text-zinc-500 font-mono">{activities.length} events</span>
        </div>
      </div>

      {/* Visually-hidden assertive region for important state changes (wave complete, errors) */}
      <div aria-live="assertive" className="sr-only">
        {(() => {
          const stateEntry = activities.find(a => a.state === 'celebrating' || a.state === 'error');
          return stateEntry ? `${stateEntry.state === 'celebrating' ? 'Wave completed' : 'Wave error'}: ${stateEntry.message}` : '';
        })()}
      </div>

      <ScrollArea className="flex-1 h-[280px] sm:h-[420px] lg:h-[540px]" ref={feedRef}>
        {/* Polite region announces only the latest new entry, not the full list */}
        <div aria-live="polite" aria-label="Latest activity" className="sr-only">
          {activities.length > 0 ? activities[0].message : ''}
        </div>
        <div className="p-2 space-y-1" role="list" aria-label="Agent activity feed">
          <AnimatePresence initial={false}>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Circle className="h-10 w-10 text-zinc-800 mb-4" />
                <p className="text-sm text-zinc-500">Waiting for agent activity...</p>
                <p className="text-xs text-zinc-600 mt-2 max-w-[260px]">
                  Updates will appear here when the cron executes an evolution wave
                </p>
              </div>
            ) : (
              activities.map((entry, i) => (
                <ActivityEntry key={entry.id} entry={entry} isNew={i === 0} />
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Bottom bar with replay controls */}
      <div className="px-5 py-3 border-t border-white/[0.06] shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-amber-500/40" />
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider">SPEC-DRIVEN</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500/40" />
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider">AUTO-EVOLUTION</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastTurnLength > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleReplay}
                aria-label={isReplaying ? 'Pause replay' : 'Replay last wave'}
                className={`h-7 px-3 text-xs gap-1.5 ${
                  isReplaying
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                {isReplaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span className="hidden sm:inline font-mono">{'\u27F3'} REPLAY</span>
              </Button>
            )}
            <span className="hidden sm:inline text-[10px] text-zinc-700 font-mono">HERMES {HERMES_VERSION}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}