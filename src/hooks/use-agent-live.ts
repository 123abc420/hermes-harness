'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAgentLiveStore, type AgentVisualState, type LiveActivityEntry, type NetworkNode } from '@/store/agent-live-store';
import { formatArgentinaTime } from '@/lib/constants';

/** Mirrors the in-memory AgentStatus shape from agent-status/route.ts */
interface ServerAgentStatus {
  agentState: string;
  message: string;
  phase: string;
  waveNumber: number;
  progress: number;
  waveCount: number;
  totalImprovements: number;
  totalDecisions: number;
  decisionCountThisWave: number;
  timestamp: number;
}

/** Mirrors the in-memory ActivityEntry shape from agent-status/route.ts */
interface ServerActivityEntry {
  state: string;
  agentState: string;
  message: string;
  phase: string;
  id: string;
  timestamp: number;
  timestampAR: string;
}

/** Mirrors the in-memory SubAgentEntry shape from agent-status/route.ts */
interface ServerSubAgentEntry {
  id: string;
  name: string;
  state: string;
  message: string;
  color: string;
  spawnTime: number;
  timestampAR: string;
}

interface HealthData {
  status: string;
  clients: number;
  latestStatus: ServerAgentStatus;
  activities: ServerActivityEntry[];
  activityCount: number;
  activityTimestamp: number;
  subAgents?: ServerSubAgentEntry[];
  networkNodes?: NetworkNode[];
  nodeTimestamp?: number;
}

const SSE_URL = '/api/harness/agent-status?stream=true';

/**
 * Creates an EventSource connection with standardized message/error handling.
 * Eliminates duplication between initial connect and retry logic.
 */
function createSSEConnection(handlers: {
  onMessage: (data: HealthData) => void;
  onOpen: () => void;
  onError: () => void;
}): EventSource {
  const es = new EventSource(SSE_URL);

  es.onopen = () => {
    handlers.onOpen();
  };

  es.onmessage = (event) => {
    try {
      const data: HealthData = JSON.parse(event.data);
      handlers.onMessage(data);
    } catch {
      // Malformed SSE event — skip silently
    }
  };

  es.onerror = () => {
    handlers.onError();
  };

  return es;
}

export function useAgentLive() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseRetryRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { setStatus, setConnected, setNetworkNodes } = useAgentLiveStore();

  const processData = useCallback((data: HealthData) => {
    const s = data.latestStatus;
    if (s) {
      const update: Parameters<typeof setStatus>[0] = {};
      if (s.agentState) update.agentState = s.agentState as AgentVisualState;
      if (s.message) update.message = s.message;
      if (s.phase) update.phase = s.phase;
      if (s.waveNumber !== undefined) update.waveNumber = s.waveNumber;
      if (s.progress !== undefined) update.progress = s.progress;
      if (s.waveCount !== undefined) update.waveCount = s.waveCount;
      if (s.totalImprovements !== undefined) update.totalImprovements = s.totalImprovements;
      if (s.totalDecisions !== undefined) update.totalDecisions = s.totalDecisions;
      if (s.decisionCountThisWave !== undefined) update.decisionCountThisWave = s.decisionCountThisWave;
      if (Object.keys(update).length > 0) setStatus(update);
    }

    // Sync activities from server
    if (data.activities && data.activities.length > 0) {
      const store = useAgentLiveStore.getState();
      const localIds = new Set(store.activities.map(a => a.id));
      let hasNew = false;
      const newActivities: LiveActivityEntry[] = [];
      for (const act of data.activities) {
        if (!localIds.has(act.id)) {
          const entry: LiveActivityEntry = {
            id: act.id,
            timestamp: act.timestamp,
            timestampAR: act.timestampAR || formatArgentinaTime(act.timestamp),
            state: (act.state || act.agentState) as AgentVisualState || 'idle',
            message: act.message,
            phase: act.phase,
          };
          newActivities.push(entry);
          hasNew = true;
        }
      }
      if (hasNew) {
        const store = useAgentLiveStore.getState();
        const stateUpdate = {
          activities: [...newActivities, ...store.activities]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, store.maxActivities),
        };
        useAgentLiveStore.setState(stateUpdate);
      }
    }

    // Sync network nodes (v2.0)
    if (data.networkNodes) {
      setNetworkNodes(data.networkNodes);
    }
  }, [setStatus, setNetworkNodes]);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    const poll = async () => {
      try {
        const res = await fetch('/api/harness/agent-status');
        if (res.ok) {
          const data: HealthData = await res.json();
          if (data.status === 'ok') {
            processData(data);
            setConnected(true);
          } else {
            setConnected(false);
          }
        } else {
          setConnected(false);
        }
      } catch {
        setConnected(false);
      }
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
  }, [processData, setConnected]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const stopSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (sseRetryRef.current) {
      clearInterval(sseRetryRef.current);
      sseRetryRef.current = null;
    }
  }, []);

  const connectSSE = useCallback(() => {
    try {
      const es = createSSEConnection({
        onMessage: (data) => {
          processData(data);
        },
        onOpen: () => {
          setConnected(true);
        },
        onError: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[AgentLive] SSE error, falling back to polling');
          }
          stopSSE();
          setConnected(false);
          useAgentLiveStore.getState().setStatus({ agentState: 'offline' });
          startPolling();
          // Schedule reconnection attempt
          if (!sseRetryRef.current) {
            sseRetryRef.current = setInterval(() => {
              if (eventSourceRef.current) return;
              if (process.env.NODE_ENV !== 'production') {
                console.warn('[AgentLive] Attempting SSE reconnection...');
              }
              stopPolling();
              // Clear retry timer on successful reconnect
              const retryTimer = sseRetryRef.current;
              const retryEs = createSSEConnection({
                onMessage: (data) => processData(data),
                onOpen: () => {
                  setConnected(true);
                  if (retryTimer) {
                    clearInterval(retryTimer);
                    sseRetryRef.current = null;
                  }
                },
                onError: () => {
                  stopSSE();
                  setConnected(false);
                  startPolling();
                },
              });
              eventSourceRef.current = retryEs;
            }, 30_000);
          }
        },
      });
      eventSourceRef.current = es;
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AgentLive] SSE not supported, using polling');
      }
      useAgentLiveStore.getState().setStatus({ agentState: 'offline' });
      startPolling();
    }
  }, [processData, setConnected, startPolling, stopPolling, stopSSE]);

  useEffect(() => {
    connectSSE();
    return () => {
      stopSSE();
      stopPolling();
      setConnected(false);
    };
  }, [connectSSE, setConnected, stopSSE, stopPolling]);
}