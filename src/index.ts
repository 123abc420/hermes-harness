/**
 * HERMES Harness — Public API
 *
 * Exportable module contract (SPEC Section 5).
 * Import into any Next.js app and mount under /harness.
 *
 * @example
 *   import { HarnessDashboard, useHarnessDashboard, useHarnessStore } from '@/harness';
 */

// ─── Components ───────────────────────────────────────────────────────────
export { OverviewTab } from './components/harness/overview-tab';
export { WavesTab } from './components/harness/waves-tab';
export { DecisionsTab } from './components/harness/decisions-tab';
export { ResearchTab } from './components/harness/research-tab';
export { GithubTab } from './components/harness/github-tab';
export { AgentLivePanel } from './components/harness/agent-live-panel';
export { Agent3DSandbox } from './components/harness/agent-3d-sandbox';
export { AgentAvatarCanvas } from './components/harness/agent-avatar-canvas';
export type { AgentVisualState } from './components/harness/agent-avatar-canvas';
export { HarnessHeader } from './components/harness/harness-header';

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

// ─── Agent Live Store (avatar 3D) ─────────────────────────────────────────
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
  ResearchItem,
  TotalStats,
  ExportModule,
  DashboardData,
} from './store/harness-store';