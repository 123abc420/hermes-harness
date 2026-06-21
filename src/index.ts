/**
 * HERMES Harness — Public API
 *
 * Exportable module contract (SPEC Section 5).
 * Import into any Next.js app and mount under /harness.
 *
 * @example
 *   import { HarnessDashboard, useHarnessDashboard, useHarnessStore } from '@/harness';
 */

// ─── Composite ────────────────────────────────────────────────────────────
export { HarnessDashboard } from './components/harness/harness-dashboard';

// ─── Components ───────────────────────────────────────────────────────────
export { OverviewTab } from './components/harness/overview-tab';
export { WavesTab } from './components/harness/waves-tab';
export { DecisionsTab } from './components/harness/decisions-tab';
export { ResearchTab } from './components/harness/research-tab';
export { GithubTab } from './components/harness/github-tab';
export { AgentLivePanel } from './components/harness/agent-live-panel';

export { HarnessHeader } from './components/harness/harness-header';
export { HarnessErrorBoundary } from './components/harness/error-boundary';
export { AnimatedSection } from './components/harness/animated-section';

// ─── Shared Footer Components (extracted from page.tsx / harness-dashboard.tsx) ──────────
export { WaveSparkline, SuccessRatePulse, UptimeDisplay, LastWaveBadge } from './components/harness/shared-footer-components';

// ─── Hooks ────────────────────────────────────────────────────────────────
export {
  useHarnessDashboard,
  useWaves,
  useWave,
  useCreateWave,
  useDecisions,
  useMetrics,
  useGithubStatus,
  useGithubSync,
  useSpec,
  useSkills,
  useMemory,
} from './hooks/use-harness-data';
export { useAgentLive } from './hooks/use-agent-live';

// ─── Agent Live Store (canvas avatar) ──────────────────────────────────
export { useAgentLiveStore } from './store/agent-live-store';
export type { LiveActivityEntry, SubAgent } from './store/agent-live-store';

// ─── Store (Dashboard) ────────────────────────────────────────────────────
export { useHarnessStore } from './store/harness-store';
export type {
  WaveStatus,
  DecisionCategory,
  DecisionPriority,
  DecisionAction,
  Wave,
  Decision,
  Metric,
  GithubStatus,
  SpecData,
  Skill,
  TotalStats,
  ExportModule,
  DashboardData,
} from './store/harness-store';