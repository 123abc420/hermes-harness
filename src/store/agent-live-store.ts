import { create } from 'zustand';

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
  state: AgentVisualState;
  message: string;
  phase?: string;
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
  level: number;
  levelName: string;
  xp: number;
  xpToNext: number;

  // Activity feed
  activities: LiveActivityEntry[];
  maxActivities: number;

  // Actions
  setStatus: (update: Partial<Pick<AgentLiveState, 'agentState' | 'message' | 'phase' | 'waveNumber' | 'progress' | 'waveCount' | 'totalImprovements' | 'totalDecisions'>>) => void;
  addActivity: (entry: Omit<LiveActivityEntry, 'id' | 'timestamp'>) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Nascente',
  2: 'Aprendiz',
  3: 'Operativo',
  5: 'Especialista',
  8: 'Arquitecto',
  12: 'Maestro',
  20: 'Trascendente',
};

function getLevel(waves: number, improvements: number) {
  return Math.floor(waves / 2) + Math.floor(improvements / 5) + 1;
}

function getLevelName(level: number): string {
  let name = 'Nascente';
  for (const [lvl, n] of Object.entries(LEVEL_NAMES).map(([k, v]) => [Number(k), v])) {
    if (level >= lvl) name = n;
  }
  return name;
}

function getXpToNext(level: number): number {
  return level * 10 + 5;
}

export const useAgentLiveStore = create<AgentLiveState>((set, get) => ({
  agentState: 'idle',
  message: 'Esperando actividad...',
  phase: '',
  waveNumber: 0,
  progress: 0,
  isConnected: false,

  waveCount: 0,
  totalImprovements: 0,
  totalDecisions: 0,
  level: 1,
  levelName: 'Nascente',
  xp: 0,
  xpToNext: 15,

  activities: [],
  maxActivities: 80,

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
    const newEntry: LiveActivityEntry = {
      ...entry,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    const activities = [newEntry, ...state.activities].slice(0, state.maxActivities);
    set({ activities });

    // Auto-update state from activity
    if (entry.state) set({ agentState: entry.state });
    if (entry.message) set({ message: entry.message });
    if (entry.phase) set({ phase: entry.phase });
  },

  setConnected: (connected) => set({ isConnected: connected }),

  reset: () =>
    set({
      agentState: 'idle',
      message: 'Esperando actividad...',
      phase: '',
      waveNumber: 0,
      progress: 0,
      activities: [],
    }),
}));