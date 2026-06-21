'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAgentLiveStore, type AgentVisualState, type LiveActivityEntry, type NetworkNode } from '@/store/agent-live-store';
import { formatArgentinaTime } from '@/lib/constants';

interface HealthData {
  status: string;
  clients: number;
  latestStatus: Record<string, unknown>;
  activities: LiveActivityEntry[];
  activityCount: number;
  activityTimestamp: number;
  subAgents?: Array<Record<string, unknown>>;
  networkNodes?: NetworkNode[];
  nodeTimestamp?: number;
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
      if (s.message) update.message = s.message as string;
      if (s.phase) update.phase = s.phase as string;
      if (s.waveNumber !== undefined) update.waveNumber = s.waveNumber as number;
      if (s.progress !== undefined) update.progress = s.progress as number;
      if (s.waveCount !== undefined) update.waveCount = s.waveCount as number;
      if (s.totalImprovements !== undefined) update.totalImprovements = s.totalImprovements as number;
      if (s.totalDecisions !== undefined) update.totalDecisions = s.totalDecisions as number;
      if (s.decisionCountThisWave !== undefined) update.decisionCountThisWave = s.decisionCountThisWave as number;
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
          const raw = act as unknown as Record<string, unknown>;
          const entry: LiveActivityEntry = {
            id: act.id,
            timestamp: act.timestamp,
            timestampAR: act.timestampAR || formatArgentinaTime(act.timestamp),
            state: (raw.state as AgentVisualState) || (raw.agentState as AgentVisualState) || 'idle',
            message: act.message,
            phase: act.phase,
          };
          newActivities.push(entry);
          hasNew = true;
        }
      }
      if (hasNew) {
        const store = useAgentLiveStore.getState();
        const stateUpdate: Record<string, unknown> = {
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

  const connectSSE = useCallback(() => {
    try {
      const es = new EventSource('/api/harness/agent-status?stream=true');
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const data: HealthData = JSON.parse(event.data);
          processData(data);
        } catch {
          // Malformed SSE event — skip silently
        }
      };

      es.onerror = () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[AgentLive] SSE error, falling back to polling');
        }
        es.close();
        eventSourceRef.current = null;
        setConnected(false);
        useAgentLiveStore.getState().setStatus({ agentState: 'offline' });
        startPolling();
        if (!sseRetryRef.current) {
          sseRetryRef.current = setInterval(() => {
            if (eventSourceRef.current) return;
            if (process.env.NODE_ENV !== 'production') {
              console.warn('[AgentLive] Attempting SSE reconnection...');
            }
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
            if (sseRetryRef.current) {
              clearInterval(sseRetryRef.current);
              sseRetryRef.current = null;
            }
            try {
              const retryEs = new EventSource('/api/harness/agent-status?stream=true');
              eventSourceRef.current = retryEs;
              retryEs.onopen = () => {
                setConnected(true);
                if (sseRetryRef.current) {
                  clearInterval(sseRetryRef.current);
                  sseRetryRef.current = null;
                }
              };
              retryEs.onmessage = (event) => {
                try {
                  const data: HealthData = JSON.parse(event.data);
                  processData(data);
                } catch {
                  // skip
                }
              };
              retryEs.onerror = () => {
                retryEs.close();
                eventSourceRef.current = null;
                setConnected(false);
                startPolling();
              };
            } catch {
              startPolling();
            }
          }, 30_000);
        }
      };
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AgentLive] SSE not supported, using polling');
      }
      useAgentLiveStore.getState().setStatus({ agentState: 'offline' });
      startPolling();
    }
  }, [processData, setConnected, startPolling]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (sseRetryRef.current) {
        clearInterval(sseRetryRef.current);
        sseRetryRef.current = null;
      }
      setConnected(false);
    };
  }, [connectSSE, setConnected]);
}