'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAgentLiveStore, type LiveActivityEntry } from '@/store/agent-live-store';

/**
 * Encapsulates wave-completion tracking and replay-toggle logic.
 * Reads/writes isReplaying & lastTurnActivities from the Zustand store.
 */
export function useWaveReplay() {
  const waveNumber = useAgentLiveStore(s => s.waveNumber);
  const activities = useAgentLiveStore(s => s.activities);
  const isReplaying = useAgentLiveStore(s => s.isReplaying);
  const lastTurnActivities = useAgentLiveStore(s => s.lastTurnActivities);
  const setIsReplaying = useAgentLiveStore(s => s.setIsReplaying);
  const setLastTurn = useAgentLiveStore(s => s.setLastTurn);
  const addActivity = useAgentLiveStore(s => s.addActivity);

  const prevWaveRef = useRef(waveNumber);
  const replayIndexRef = useRef(0);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track wave completion — snapshot activities as "last turn"
  useEffect(() => {
    if (waveNumber > prevWaveRef.current && waveNumber > 0) {
      const waveActivities = activities
        .filter(a => a.phase || a.state !== 'idle')
        .slice(0, 20);
      if (waveActivities.length > 0) {
        setLastTurn(waveActivities);
      }
    }
    prevWaveRef.current = waveNumber;
  }, [waveNumber, activities, setLastTurn]);

  const toggleReplay = useCallback(() => {
    if (isReplaying) {
      setIsReplaying(false);
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
        replayTimerRef.current = null;
      }
    } else if (lastTurnActivities.length > 0) {
      setIsReplaying(true);
      replayIndexRef.current = 0;
      const MAX_CYCLES = 3;
      let ticks = 0;
      const totalTicks = MAX_CYCLES * lastTurnActivities.length;
      replayTimerRef.current = setInterval(() => {
        const idx = replayIndexRef.current % lastTurnActivities.length;
        const entry = lastTurnActivities[lastTurnActivities.length - 1 - idx];
        if (entry) {
          addActivity({
            state: entry.state,
            message: `\u27F3 ${entry.message}`,
            phase: entry.phase,
          });
        }
        replayIndexRef.current++;
        ticks++;
        if (replayIndexRef.current >= lastTurnActivities.length) {
          replayIndexRef.current = 0;
        }
        if (ticks >= totalTicks) {
          if (replayTimerRef.current) clearInterval(replayTimerRef.current);
          replayTimerRef.current = null;
          setIsReplaying(false);
        }
      }, 2000);
    }
  }, [isReplaying, lastTurnActivities, setIsReplaying, addActivity]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, []);

  return { isReplaying, lastTurnActivities, toggleReplay };
}