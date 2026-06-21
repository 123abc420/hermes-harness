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

// Level thresholds: each level requires N waves (wave-based leveling, not XP-based)
// This avoids quadratic XP math that produces negative values at high wave counts
const LEVEL_THRESHOLDS = [
  0,   // Level 1:  0 waves
  5,   // Level 2:  5 waves
  12,  // Level 3:  12 waves
  22,  // Level 4:  22 waves
  35,  // Level 5:  35 waves
  50,  // Level 6:  50 waves
  70,  // Level 7:  70 waves
  95,  // Level 8:  95 waves
  125, // Level 9:  125 waves
  160, // Level 10: 160 waves
  200, // Level 11: 200 waves
  250, // Level 12: 250 waves
  300, // Level 13: 300 waves
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
  // XP to next level = waves needed from current to next threshold
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 50;
  return nextThreshold - currentThreshold;
}

/** XP within the current level (waves completed beyond the current threshold). */
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