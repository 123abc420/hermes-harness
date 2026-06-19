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

export function useAgentLive() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const { setStatus, setConnected } = useAgentLiveStore();

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
          newActivities.push(act);
          hasNew = true;
        }
      }
      if (hasNew) {
        useAgentLiveStore.setState(s => ({
          activities: [...newActivities, ...s.activities]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, s.maxActivities),
        }));
        // Update state from latest activity
        const latest = data.activities[0];
        if (latest.state) useAgentLiveStore.setState({ agentState: latest.state });
        if (latest.message) useAgentLiveStore.setState({ message: latest.message });
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
        console.log('[AgentLive] SSE connected');
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
        startPolling();
      };
    } catch {
      console.warn('[AgentLive] SSE not supported, using polling');
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