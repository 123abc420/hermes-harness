'use client';

import type { AgentVisualState } from '@/store/agent-live-store';

// ─── State Configuration (shared across sub-components) ──────────
export const STATE_ICONS: Record<AgentVisualState, string> = {
  idle: '💤', thinking: '🧠', searching: '🔍', planning: '📋',
  executing: '⚡', verifying: '✅', celebrating: '🎉', error: '💥',
  evolving: '🧬', offline: '⚫',
};

export const PHASE_STEPS = [
  { key: 'assess', label: 'ASSESS', color: 'text-cyan-400', barColor: '#06b6d4', range: [0, 0.15] },
  { key: 'plan', label: 'PLAN', color: 'text-violet-400', barColor: '#a855f7', range: [0.15, 0.25] },
  { key: 'execute', label: 'EXECUTE', color: 'text-rose-400', barColor: '#f43f5e', range: [0.25, 0.70] },
  { key: 'verify', label: 'VERIFY', color: 'text-emerald-400', barColor: '#22c55e', range: [0.70, 0.85] },
  { key: 'persist', label: 'PERSIST', color: 'text-amber-400', barColor: '#f59e0b', range: [0.85, 0.95] },
  { key: 'report', label: 'REPORT', color: 'text-sky-400', barColor: '#38bdf8', range: [0.95, 1.0] },
] as const;