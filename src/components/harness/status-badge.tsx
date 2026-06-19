'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'connected' | 'running' | 'completed' | 'pending' | 'failed' | 'disconnected' | 'error' | 'syncing';
  label?: string;
  pulse?: boolean;
  className?: string;
}

const colorMap: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  connected: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  running: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  disconnected: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  syncing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export function StatusBadge({ status, label, pulse, className }: StatusBadgeProps) {
  const displayLabel = label ?? status.toUpperCase();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium tracking-wider',
        colorMap[status] ?? colorMap.pending,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'active' || status === 'connected' || status === 'completed'
            ? 'bg-emerald-400'
            : status === 'running' || status === 'syncing'
              ? 'bg-amber-400'
              : status === 'failed' || status === 'error'
                ? 'bg-red-400'
                : 'bg-zinc-400',
          pulse && (status === 'active' || status === 'running' || status === 'connected')
            ? 'animate-pulse'
            : ''
        )}
      />
      {displayLabel}
    </span>
  );
}