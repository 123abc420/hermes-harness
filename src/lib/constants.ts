// Shared constants for the HERMES Harness dashboard

export const HERMES_VERSION = 'v0.4.0';

// Internal service URLs (server-to-server, not client-facing)
export const AGENT_LIVE_SERVICE_URL = process.env.AGENT_LIVE_PORT
  ? `http://localhost:${process.env.AGENT_LIVE_PORT}/broadcast`
  : 'http://localhost:3004/broadcast';

export const APP_INTERNAL_URL = process.env.APP_PORT
  ? `http://localhost:${process.env.APP_PORT}`
  : 'http://localhost:3000';

// Agent evolution stages — single source of truth (names + visual params)
export const EVOLUTION_STAGES = [
  { level: 1,  name: 'Nascent',      particles: 15, nodes: 3,  rings: 1, description: 'First spark of consciousness' },
  { level: 2,  name: 'Apprentice',   particles: 25, nodes: 6,  rings: 2, description: 'Learning from every wave' },
  { level: 3,  name: 'Operational',  particles: 35, nodes: 10, rings: 3, description: 'Stable operational system' },
  { level: 5,  name: 'Specialist',   particles: 50, nodes: 15, rings: 3, description: 'Improving specialized skills' },
  { level: 8,  name: 'Architect',    particles: 65, nodes: 20, rings: 4, description: 'Designing its own evolution' },
  { level: 12, name: 'Master',       particles: 80, nodes: 25, rings: 4, description: 'Mastery in self-improvement' },
  { level: 20, name: 'Transcendent', particles: 100, nodes: 30, rings: 5, description: 'Beyond the cycles' },
] as const;

// Derived from EVOLUTION_STAGES for quick level→name lookups
export const LEVEL_NAMES: Record<number, string> = Object.fromEntries(
  EVOLUTION_STAGES.map(s => [s.level, s.name])
);

export function getLevelName(level: number): string {
  let name = 'Nascent';
  for (const [lvl, n] of Object.entries(LEVEL_NAMES).map(([k, v]) => [Number(k), v])) {
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