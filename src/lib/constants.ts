// Shared constants for the HERMES Harness dashboard

import { type AgentVisualState } from '@/lib/schemas';

/** Server SSE poll interval (ms) — how often the SSE endpoint checks for state changes. */
export const SSE_SERVER_POLL_INTERVAL = 2000;
/** Client fallback poll interval (ms) — used when SSE is unavailable. */
export const SSE_CLIENT_POLL_INTERVAL = 3000;
/** Server SSE keep-alive interval (ms). */
export const SSE_KEEP_ALIVE_INTERVAL = 30_000;

// Read version from package.json at build time; fallback for non-Next.js contexts
export const HERMES_VERSION = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VERSION
  ? `v${process.env.NEXT_PUBLIC_VERSION}`
  : 'v0.4.0';

// Agent evolution stages — internal to getLevelName
const EVOLUTION_STAGES = [
  { level: 1,    name: 'Nascent' },
  { level: 5,    name: 'Apprentice' },
  { level: 15,   name: 'Operational' },
  { level: 30,   name: 'Specialist' },
  { level: 50,   name: 'Architect' },
  { level: 75,   name: 'Master' },
  { level: 100,  name: 'Transcendent' },
  { level: 150,  name: 'Omniscient' },
  { level: 200,  name: 'Singularity' },
] as const;

// Derived from EVOLUTION_STAGES for quick level→name lookups
const LEVEL_NAMES: Record<number, string> = Object.fromEntries(
  EVOLUTION_STAGES.map(s => [s.level, s.name])
);

export function getLevelName(level: number): string {
  let name = 'Nascent';
  for (const [lvl, n] of Object.entries(LEVEL_NAMES).map(([k, v]) => [Number(k), v] as const)) {
    if (level >= lvl) name = n;
  }
  return name;
}

// Chart tooltip styles — Recharts <Tooltip contentStyle>
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: 8,
  fontSize: 11,
} as const;

export const CHART_TOOLTIP_STYLE_DARK = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  fontSize: 11,
  color: '#e2e8f0',
} as const;

// Shared tooltip label style for Recharts <Tooltip labelStyle>
export const CHART_TOOLTIP_LABEL_STYLE = { color: '#a1a1aa' } as const;

// Format seconds into human-readable "Xm Ys" or "Xs" string
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

// Format a timestamp in Argentina timezone (America/Argentina/Buenos_Aires)
export function formatArgentinaTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

// ─── Agent Visual State RGB Colors — SINGLE SOURCE OF TRUTH ──────────
// Used by canvas (rgba strings), HUD badges (hex), and filter pills (hex).
// Every state maps to a unique [R, G, B] tuple.
export const STATE_RGB: Record<AgentVisualState, [number, number, number]> = {
  idle: [245, 158, 11],
  thinking: [6, 182, 212],
  searching: [249, 115, 22],
  planning: [168, 85, 247],
  executing: [244, 63, 94],
  verifying: [34, 197, 94],
  celebrating: [234, 179, 8],
  error: [220, 38, 38],
  evolving: [217, 70, 239],
  offline: [113, 113, 122],
};

// Derive hex string from RGB tuple
export function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

// Get hex color for a state (derived from STATE_RGB)
export function getStateHex(state: AgentVisualState): string {
  const rgb = STATE_RGB[state];
  return rgb ? rgbToHex(rgb) : '#71717a';
}

// Compare error counts: returns true if recent window (last N) has fewer-or-equal errors than the previous window
export function isErrorsTrendingDown(
  trend: { errors: number }[],
  windowSize = 3,
): boolean | undefined {
  if (trend.length >= windowSize * 2) {
    const recent = trend.slice(-windowSize).reduce((s, t) => s + t.errors, 0);
    const prev = trend.slice(-windowSize * 2, -windowSize).reduce((s, t) => s + t.errors, 0);
    return recent <= prev;
  }
  if (trend.length >= 2) {
    return trend[trend.length - 1].errors <= trend[trend.length - 2].errors;
  }
  return undefined;
}