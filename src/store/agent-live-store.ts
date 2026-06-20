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
  timestampAR: string; // Argentina timezone formatted
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

  // Sub-agents
  subAgents: SubAgent[];

  // Last turn replay
  lastTurnActivities: LiveActivityEntry[];
  isReplaying: boolean;

  // Actions
  setStatus: (update: Partial<Pick<AgentLiveState, 'agentState' | 'message' | 'phase' | 'waveNumber' | 'progress' | 'waveCount' | 'totalImprovements' | 'totalDecisions' | 'recentSuccessRate' | 'healthScore' | 'healthScoreTrend'>>) => void;
  addActivity: (entry: Omit<LiveActivityEntry, 'id' | 'timestamp' | 'timestampAR'>) => void;
  setConnected: (connected: boolean) => void;
  setLastTurn: (activities: LiveActivityEntry[]) => void;
  setIsReplaying: (replaying: boolean) => void;
}

function getLevel(waves: number, improvements: number) {
  return Math.floor(waves / 2) + Math.floor(improvements / 5) + 1;
}

function getXpToNext(level: number): number {
  return level * 10 + 5;
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
  lastTurnActivities: [],
  isReplaying: false,

  setStatus: (update) => {
    const state = get();
    const newWaves = update.waveCount ?? state.waveCount;
    const newImprovements = update.totalImprovements ?? state.totalImprovements;
    const newDecisions = update.totalDecisions ?? state.totalDecisions;
    const newLevel = getLevel(newWaves, newImprovements);

    set({
      ...update,
      waveCount: newWaves,
      totalImprovements: newImprovements,
      totalDecisions: newDecisions,
      level: newLevel,
      levelName: getLevelName(newLevel),
      xpToNext: getXpToNext(newLevel),
      xp: newImprovements * 10 + newDecisions * 5,
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
    // Batch all state updates into a single set() to avoid multiple re-renders
    const updates: Partial<AgentLiveState> = { activities };
    if (entry.state) updates.agentState = entry.state;
    if (entry.message) updates.message = entry.message;
    if (entry.phase) updates.phase = entry.phase;
    set(updates);
  },

  setConnected: (connected) => set({ isConnected: connected }),

  setLastTurn: (activities) => set({ lastTurnActivities: activities }),
  setIsReplaying: (replaying) => set({ isReplaying: replaying }),
}));