import { create } from 'zustand';

export type WaveStatus = 'pending' | 'running' | 'completed' | 'failed';
export type DecisionCategory = 'code_quality' | 'feature' | 'fix' | 'refactor' | 'style' | 'performance' | 'architecture';
export type DecisionPriority = 'low' | 'medium' | 'high' | 'critical';
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
  wave?: { waveNumber: number; status: string };
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
}

export interface ResearchItem {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  keyInsight: string;
}

export interface TotalStats {
  totalWaves: number;
  totalDecisions: number;
  totalImprovements: number;
  totalErrors: number;
  githubCommits: number;
}

export interface DashboardData {
  waves: Wave[];
  totalStats: TotalStats;
  metrics: Metric[];
  githubStatus: GithubStatus;
  config: Record<string, string>;
  exports: unknown[];
  recentDecisions: Decision[];
}

interface HarnessState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  waveFilter: string;
  setWaveFilter: (filter: string) => void;
  decisionCategoryFilter: string;
  setDecisionCategoryFilter: (filter: string) => void;
  decisionPriorityFilter: string;
  setDecisionPriorityFilter: (filter: string) => void;
  decisionActionFilter: string;
  setDecisionActionFilter: (filter: string) => void;
  selectedWaveId: string | null;
  setSelectedWaveId: (id: string | null) => void;
  triggerDialogOpen: boolean;
  setTriggerDialogOpen: (open: boolean) => void;
}

export const useHarnessStore = create<HarnessState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  waveFilter: '',
  setWaveFilter: (filter) => set({ waveFilter: filter }),
  decisionCategoryFilter: '',
  setDecisionCategoryFilter: (filter) => set({ decisionCategoryFilter: filter }),
  decisionPriorityFilter: '',
  setDecisionPriorityFilter: (filter) => set({ decisionPriorityFilter: filter }),
  decisionActionFilter: '',
  setDecisionActionFilter: (filter) => set({ decisionActionFilter: filter }),
  selectedWaveId: null,
  setSelectedWaveId: (id) => set({ selectedWaveId: id }),
  triggerDialogOpen: false,
  setTriggerDialogOpen: (open) => set({ triggerDialogOpen: open }),
}));