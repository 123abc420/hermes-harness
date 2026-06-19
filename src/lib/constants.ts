// Shared constants for the HERMES Harness dashboard

export const HERMES_VERSION = 'v0.4.0';

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