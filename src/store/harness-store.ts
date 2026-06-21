import { create } from 'zustand';
import type { WaveStatus, DecisionPriority } from '@/lib/schemas';

export type { WaveStatus, DecisionPriority };
export type DecisionCategory =
  | 'code_quality' | 'feature' | 'fix' | 'refactor' | 'performance' | 'architecture'
  | 'style' | 'skill' | 'insight' | 'i18n' | 'ux' | 'automation'
  | 'data' | 'maintenance' | 'reliability' | 'code';
export type DecisionAction = 'planned' | 'executed' | 'skipped' | 'failed';

export interface Wave {
  id: string;
  waveNumber: number;
  status: WaveStatus;
  startedAt: string;
  completedAt: string | null;
  summary: string | null;
  decisionsCount: number;
  improvementsCount: number;
  errorsCount: number;
  decisions?: Decision[];
  _count?: { decisions: number };
}

export interface Decision {
  id: string;
  waveId: string;
  wave?: { waveNumber: number; status: string; id: string };
  category: DecisionCategory;
  priority: DecisionPriority;
  action: DecisionAction;
  description: string;
  reasoning: string | null;
  targetFile: string | null;
  targetModule: string | null;
  outcome: string | null;
  createdAt: string;
  executedAt: string | null;
}

export interface Metric {
  id: string;
  metricKey: string;
  metricValue: number;
  previousValue: number | null;
  change: number | null;
  changePercent: number | null;
  recordedAt: string;
}

export interface GithubStatus {
  id?: string;
  status: string;
  username: string | null;
  repoName: string | null;
  branch: string;
  totalCommits: number;
  lastSyncAt: string | null;
  lastCommitSha: string | null;
  recentCommits?: { sha: string; message: string }[];
}

export interface SpecData {
  content: string;
  version: string;
  lastUpdated: string;
  sectionsCount: number;
}

export interface Skill {
  name: string;
  title: string;
  content: string;
  version?: string;
  created?: string;
  category?: string;
  trigger?: string;
}

export interface TotalStats {
  totalWaves: number;
  totalDecisions: number;
  totalImprovements: number;
  totalErrors: number;
  githubCommits: number;
  waveSuccessRate: number;
  recentSuccessRate: number;
}

export interface ExportModule {
  id: string;
  moduleName: string;
  version: string;
  description: string | null;
  isReady: boolean;
  createdAt: string;
}

export interface DashboardData {
  waves: Wave[];
  totalStats: TotalStats;
  metrics: Metric[];
  latestMetrics?: Record<string, number>;
  githubStatus: GithubStatus;
  config: Record<string, string>;
  exports: ExportModule[];
  recentDecisions: Decision[];
  errorTrend: { wave: number; errors: number; status: string }[];
  skillsCount: number;
  healthScore: number;
  healthScoreTrend: 'up' | 'down' | 'stable';
  healthBreakdown?: { spec: number; success: number; errors: number; github: number };
  buildHealth: {
    lintPassed: boolean;
    lintErrors: number;
    lintWarnings: number;
    checkedAt: string;
  };
}

interface HarnessState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingWaveDetailId: string | null;
  setPendingWaveDetailId: (id: string | null) => void;
  waveFilter: string;
  setWaveFilter: (filter: string) => void;
  decisionCategoryFilter: string;
  setDecisionCategoryFilter: (filter: string) => void;
}

export const useHarnessStore = create<HarnessState>((set) => ({
  activeTab: 'agent',
  setActiveTab: (tab) => set({ activeTab: tab }),
  pendingWaveDetailId: null,
  setPendingWaveDetailId: (id) => set({ pendingWaveDetailId: id }),
  waveFilter: '',
  setWaveFilter: (filter) => set({ waveFilter: filter }),
  decisionCategoryFilter: '',
  setDecisionCategoryFilter: (filter) => set({ decisionCategoryFilter: filter }),
}));