import { create } from 'zustand';
import { getLevelName, formatArgentinaTime } from '@/lib/constants';

export type AgentVisualState =
  | 'idle'
  | 'thinking'
  | 'searching'
  | 'planning'
  | 'executing'
  | 'verifying'
  | 'celebrating'
  | 'error'
  | 'evolving'
  | 'offline';

export interface LiveActivityEntry {
  id: string;
  timestamp: number;
  timestampAR: string;
  state: AgentVisualState;
  message: string;
  phase?: string;
}

export interface SubAgent {
  id: string;
  name: string;
  state: AgentVisualState;
  message: string;
  spawnTime: number;
  color: string;
}

// ─── Network Node (v2.0) ──────────────────────────────────────────────
export interface NetworkNode {
  id: string;
  type: string;
  name: string;
  state: AgentVisualState;
  message: string;
  color: string;
  connections: string[];
  spawnTime: number;
  x: number;       // 0-1 normalized position
  y: number;       // 0-1 normalized position
  size: number;    // multiplier: 1.0 = default
  glowIntensity: number; // 0-2+: brightness
}

export interface AgentLiveState {
  // Current status
  agentState: AgentVisualState;
  message: string;
  phase: string;
  waveNumber: number;
  progress: number;
  isConnected: boolean;

  // Stats
  waveCount: number;
  totalImprovements: number;
  totalDecisions: number;
  decisionCountThisWave: number;
  recentSuccessRate: number;
  healthScore: number;
  healthScoreTrend: 'up' | 'down' | 'stable';
  level: number;
  levelName: string;
  xp: number;
  xpToNext: number;

  // Activity feed
  activities: LiveActivityEntry[];
  maxActivities: number;

  // Sub-agents (legacy)
  subAgents: SubAgent[];

  // Network nodes (v2.0)
  networkNodes: NetworkNode[];

  // Last turn replay
  lastTurnActivities: LiveActivityEntry[];
  isReplaying: boolean;

  // Selected node (for popup)
  selectedNodeId: string | null;

  // Actions
  setStatus: (update: Partial<Pick<AgentLiveState, 'agentState' | 'message' | 'phase' | 'waveNumber' | 'progress' | 'waveCount' | 'totalImprovements' | 'totalDecisions' | 'decisionCountThisWave' | 'recentSuccessRate' | 'healthScore' | 'healthScoreTrend'>>) => void;
  addActivity: (entry: Omit<LiveActivityEntry, 'id' | 'timestamp' | 'timestampAR'>) => void;
  setConnected: (connected: boolean) => void;
  setLastTurn: (activities: LiveActivityEntry[]) => void;
  setIsReplaying: (replaying: boolean) => void;
  setNetworkNodes: (nodes: NetworkNode[]) => void;
  selectNode: (nodeId: string | null) => void;
}

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 5, 12, 22, 35, 50, 70, 95, 125, 160, 200, 250, 300,
];

function getLevel(waves: number, _improvements: number) {
  let lvl = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (waves >= threshold) lvl++;
    else break;
  }
  return Math.min(lvl, LEVEL_THRESHOLDS.length);
}

function getXpToNext(level: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 50;
  return nextThreshold - currentThreshold;
}

function getXpInLevel(waves: number, level: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  return Math.max(0, waves - currentThreshold);
}

export const useAgentLiveStore = create<AgentLiveState>((set, get) => ({
  agentState: 'idle',
  message: 'Waiting for activity...',
  phase: '',
  waveNumber: 0,
  progress: 0,
  isConnected: false,

  waveCount: 0,
  totalImprovements: 0,
  totalDecisions: 0,
  decisionCountThisWave: 0,
  recentSuccessRate: 0,
  healthScore: 0,
  healthScoreTrend: 'stable' as const,
  level: 1,
  levelName: 'Nascent',
  xp: 0,
  xpToNext: 15,

  activities: [],
  maxActivities: 80,

  subAgents: [],
  networkNodes: [],

  lastTurnActivities: [],
  isReplaying: false,

  selectedNodeId: null,

  setStatus: (update) => {
    const state = get();
    const newWaves = update.waveCount ?? state.waveCount;
    const newImprovements = update.totalImprovements ?? state.totalImprovements;
    const newDecisions = update.totalDecisions ?? state.totalDecisions;
    const newLevel = getLevel(newWaves, newImprovements);

    const xpInCurrentLevel = getXpInLevel(newWaves, newLevel);

    set({
      ...update,
      waveCount: newWaves,
      totalImprovements: newImprovements,
      totalDecisions: newDecisions,
      level: newLevel,
      levelName: getLevelName(newLevel),
      xpToNext: getXpToNext(newLevel),
      xp: xpInCurrentLevel,
    });
  },

  addActivity: (entry) => {
    const state = get();
    const now = Date.now();
    const newEntry: LiveActivityEntry = {
      ...entry,
      id: `act_${now}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now,
      timestampAR: formatArgentinaTime(now),
    };
    const activities = [newEntry, ...state.activities].slice(0, state.maxActivities);
    const updates: Partial<AgentLiveState> = { activities };
    if (entry.state) updates.agentState = entry.state;
    if (entry.message) updates.message = entry.message;
    if (entry.phase) updates.phase = entry.phase;
    set(updates);
  },

  setConnected: (connected) => set({ isConnected: connected }),

  setLastTurn: (activities) => set({ lastTurnActivities: activities }),
  setIsReplaying: (replaying) => set({ isReplaying: replaying }),

  setNetworkNodes: (nodes) => set({ networkNodes: nodes }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
}));