/**
 * Unified decision category colors — single source of truth.
 * Both Tailwind classes (for badges) and hex colors (for charts)
 * are derived from this map to prevent drift.
 */

export interface CategoryColor {
  tw: string;  // Tailwind classes for badge backgrounds/text
  hex: string; // Hex color for charts (Recharts, SVG, etc.)
}

export const DECISION_CATEGORIES: Record<string, CategoryColor> = {
  feature:      { tw: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', hex: '#10b981' },
  fix:          { tw: 'bg-red-500/10 text-red-400 border-red-500/20',           hex: '#ef4444' },
  performance:  { tw: 'bg-orange-500/10 text-orange-400 border-orange-500/20', hex: '#f97316' },
  code_quality: { tw: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',       hex: '#06b6d4' },
  refactor:     { tw: 'bg-violet-500/10 text-violet-400 border-violet-500/20', hex: '#8b5cf6' },
  architecture: { tw: 'bg-teal-500/10 text-teal-400 border-teal-500/20',       hex: '#14b8a6' },
  style:        { tw: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', hex: '#6366f1' },
  skill:        { tw: 'bg-pink-500/10 text-pink-400 border-pink-500/20',       hex: '#ec4899' },
  insight:      { tw: 'bg-amber-500/10 text-amber-400 border-amber-500/20',    hex: '#f59e0b' },
  i18n:         { tw: 'bg-sky-500/10 text-sky-400 border-sky-500/20',          hex: '#0ea5e9' },
  ux:           { tw: 'bg-lime-500/10 text-lime-400 border-lime-500/20',       hex: '#84cc16' },
  automation:   { tw: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20', hex: '#d946ef' },
  data:         { tw: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', hex: '#eab308' },
  maintenance:  { tw: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',       hex: '#a1a1aa' },
};

/** Tailwind-only map (for badge className) */
export const CATEGORY_TW: Record<string, string> = Object.fromEntries(
  Object.entries(DECISION_CATEGORIES).map(([k, v]) => [k, v.tw])
);

/** Hex-only map (for charts) */
export const CATEGORY_HEX: Record<string, string> = Object.fromEntries(
  Object.entries(DECISION_CATEGORIES).map(([k, v]) => [k, v.hex])
);

/** All valid category names */
export const VALID_CATEGORIES = Object.keys(DECISION_CATEGORIES);