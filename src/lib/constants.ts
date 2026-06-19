// Shared constants for the HERMES Harness dashboard

export const HERMES_VERSION = 'v0.4.0';

// Agent evolution level names — single source of truth
export const LEVEL_NAMES: Record<number, string> = {
  1: 'Nascent',
  2: 'Apprentice',
  3: 'Operational',
  5: 'Specialist',
  8: 'Architect',
  12: 'Master',
  20: 'Transcendent',
};

export function getLevelName(level: number): string {
  let name = 'Nascent';
  for (const [lvl, n] of Object.entries(LEVEL_NAMES).map(([k, v]) => [Number(k), v])) {
    if (level >= lvl) name = n;
  }
  return name;
}