'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAgentLiveStore, type AgentVisualState, type LiveActivityEntry } from '@/store/agent-live-store';

interface HealthData {
  status: string;
  clients: number;
  latestStatus: Record<string, unknown>;
  activities: LiveActivityEntry[];
  activityCount: number;
  activityTimestamp: number;
}

// Format timestamp in Argentina timezone
function formatArgentinaTime(ts: number): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }
}

export function useAgentLive() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const { setStatus, setConnected, addActivity } = useAgentLiveStore();

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
          // Add Argentina timestamp if missing
          const entry = {
            ...act,
            timestampAR: act.timestampAR || formatArgentinaTime(act.timestamp),
          };
          newActivities.push(entry);
          hasNew = true;
        }
      }
      if (hasNew) {
        // Batch: update activities + extract latest state in a single setState
        const latest = data.activities[0];
        const stateUpdate: Record<string, unknown> = {
          activities: [...newActivities, ...store.activities]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, store.maxActivities),
        };
        if (latest.state) stateUpdate.agentState = latest.state;
        if (latest.message) stateUpdate.message = latest.message;
        useAgentLiveStore.setState(stateUpdate);
      }
    }
  }, [setStatus]);

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
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        console.warn('[AgentLive] SSE error, falling back to polling');
        es.close();
        eventSourceRef.current = null;
        setConnected(false);
        useAgentLiveStore.getState().setStatus({ agentState: 'offline' });
        startPolling();
      };
    } catch {
      console.warn('[AgentLive] SSE not supported, using polling');
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
        pollRef.current = undefined;
      }
      setConnected(false);
    };
  }, [connectSSE, setConnected]);
}