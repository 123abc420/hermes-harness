'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAgentLiveStore, type LiveActivityEntry } from '@/store/agent-live-store';
import { AgentNetworkGraph } from './agent-network-graph';
import { PHASE_STEPS, STATE_ICONS } from './agent-live-subcomponents';
import { getStateHex } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play, Pause, Repeat, SkipForward, Waves,
} from 'lucide-react';

/* ═════════════════════════════════════════════════════════════════════
   WAVE REPLAY VIEW — "Turn Recorder"

   Shows a timestamped timeline of everything the agent did.
   Play/Pause/Loop controls. SVG graph shows node state.
   No canvas animations, no particles, no lag.
   ═════════════════════════════════════════════════════════════════════ */

// ─── Timeline Entry ─────────────────────────────────────────
function TimelineEntry({
  entry,
  index,
  isActive,
  isFirstInPhase,
  waveStart,
}: {
  entry: LiveActivityEntry;
  index: number;
  isActive: boolean;
  isFirstInPhase: boolean;
  waveStart: number;
}) {
  const relMs = entry.timestamp - waveStart;
  const relSec = Math.round(relMs / 1000);
  const mins = Math.floor(relSec / 60);
  const secs = relSec % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const stateColor = getStateHex(entry.state);

  return (
    <>
      {isFirstInPhase && entry.phase && (
        <div className="flex items-center gap-2 pt-2 pb-1">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
            {entry.phase}
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
      )}
      <div
        className={cn(
          'flex items-start gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-300',
          isActive
            ? 'bg-white/[0.06]'
            : 'hover:bg-white/[0.02]',
        )}
      >
        {/* Timestamp */}
        <span className="shrink-0 text-[10px] font-mono text-zinc-600 w-10 text-right pt-0.5">
          {timeStr}
        </span>

        {/* State indicator */}
        <div
          className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] mt-px"
          style={{
            backgroundColor: stateColor + '15',
            color: stateColor,
          }}
        >
          {STATE_ICONS[entry.state] || '●'}
        </div>

        {/* Message */}
        <p
          className={cn(
            'text-[11px] leading-relaxed min-w-0',
            isActive ? 'text-zinc-200' : 'text-zinc-400',
          )}
        >
          {entry.message}
        </p>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function WaveReplayView() {
  const activities = useAgentLiveStore(s => s.activities);
  const waveNumber = useAgentLiveStore(s => s.waveNumber);
  const progress = useAgentLiveStore(s => s.progress);
  const agentState = useAgentLiveStore(s => s.agentState);
  const phase = useAgentLiveStore(s => s.phase);
  const networkNodes = useAgentLiveStore(s => s.networkNodes);

  // Replay state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackIndex, setPlaybackIndex] = useState(-1); // -1 = show all
  const [speed, setSpeed] = useState(1500); // ms per step
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter meaningful activities (exclude idle and duplicates)
  const meaningfulActivities = useMemo(() => {
    return activities
      .filter(a => a.state !== 'idle' || (a.phase && a.phase.length > 0))
      .slice(0, 60);
  }, [activities]);

  // Wave start timestamp (first meaningful activity)
  const waveStart = useMemo(() => {
    if (meaningfulActivities.length === 0) return Date.now();
    return meaningfulActivities[meaningfulActivities.length - 1].timestamp;
  }, [meaningfulActivities]);

  const waveEnd = useMemo(() => {
    if (meaningfulActivities.length === 0) return Date.now();
    return meaningfulActivities[0].timestamp;
  }, [meaningfulActivities]);

  // Total duration
  const durationSec = Math.max(1, Math.round((waveEnd - waveStart) / 1000));

  // Current phase index for progress bar
  const currentPhaseIdx = useMemo(() => {
    const idx = PHASE_STEPS.findIndex(p => p.value === phase);
    return idx >= 0 ? idx : 0;
  }, [phase]);

  // Auto-play control
  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackIndex(-1);
  }, []);

  const startPlayback = useCallback(() => {
    if (meaningfulActivities.length === 0) return;
    setIsPlaying(true);
    // Play from oldest to newest (array is newest-first, so reverse)
    let idx = meaningfulActivities.length - 1;
    setPlaybackIndex(idx);

    timerRef.current = setInterval(() => {
      idx--;
      if (idx < 0) {
        if (isLooping) {
          idx = meaningfulActivities.length - 1;
        } else {
          stopPlayback();
          return;
        }
      }
      setPlaybackIndex(idx);
    }, speed);
  }, [meaningfulActivities, isLooping, speed, stopPlayback]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  const skipToEnd = useCallback(() => {
    stopPlayback();
    setPlaybackIndex(0); // newest entry
  }, [stopPlayback]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-scroll to active entry
  useEffect(() => {
    if (playbackIndex >= 0 && scrollRef.current) {
      const entries = scrollRef.current.querySelectorAll('[data-replay-entry]');
      // entries are in reverse order (newest first), so the DOM index is length - 1 - playbackIndex
      const domIdx = meaningfulActivities.length - 1 - playbackIndex;
      const el = entries[domIdx] as HTMLElement | undefined;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [playbackIndex, meaningfulActivities.length]);

  // Speed options
  const speedOptions = [
    { label: '0.5x', value: 3000 },
    { label: '1x', value: 1500 },
    { label: '2x', value: 750 },
    { label: '4x', value: 375 },
  ];
  const currentSpeedIdx = speedOptions.findIndex(s => s.value === speed);

  const nextSpeed = () => {
    const next = (currentSpeedIdx + 1) % speedOptions.length;
    setSpeed(speedOptions[next].value);
  };

  const hasData = meaningfulActivities.length > 0;
  const isWaveActive = agentState !== 'idle' && agentState !== 'offline';

  return (
    <div className="flex flex-col gap-2.5 h-full">
      {/* ═══ HEADER: Wave info + Controls ═══ */}
      <div className="shrink-0 flex items-center gap-3 p-2.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/[0.06]">
        {/* Wave badge */}
        <div className="flex items-center gap-2">
          <Waves className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-bold text-white">
            {waveNumber > 0 ? `WAVE ${waveNumber}` : 'REPLAY'}
          </span>
          {isWaveActive && (
            <Badge
              className="text-[8px] h-4 px-1.5 animate-pulse"
              style={{ backgroundColor: getStateHex(agentState) + '30', color: getStateHex(agentState), borderColor: getStateHex(agentState) + '50' }}
              variant="outline"
            >
              {agentState}
            </Badge>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Speed toggle */}
        <button
          onClick={nextSpeed}
          className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 px-1.5 py-0.5 rounded border border-white/[0.06] hover:border-white/[0.12] transition-colors"
          title="Playback speed"
        >
          {speedOptions[currentSpeedIdx >= 0 ? currentSpeedIdx : 1].label}
        </button>

        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          disabled={!hasData}
          className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08]"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </Button>

        {/* Skip to end */}
        <Button
          variant="ghost"
          size="sm"
          onClick={skipToEnd}
          disabled={!hasData}
          className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08]"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </Button>

        {/* Loop toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLooping(!isLooping)}
          className={cn(
            'h-7 w-7 p-0 rounded-lg transition-colors',
            isLooping
              ? 'text-sky-400 bg-sky-400/10 hover:bg-sky-400/20'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.08]',
          )}
          title={isLooping ? 'Loop: ON' : 'Loop: OFF'}
        >
          <Repeat className="w-3.5 h-3.5" />
        </Button>

        {/* Duration */}
        {hasData && (
          <span className="text-[9px] font-mono text-zinc-600 w-12 text-right">
            {durationSec}s · {meaningfulActivities.length}
          </span>
        )}
      </div>

      {/* ═══ PHASE PROGRESS BAR ═══ */}
      <div className="shrink-0 flex items-center gap-1">
        {PHASE_STEPS.map((p, i) => {
          const isCompleted = i < currentPhaseIdx;
          const isCurrent = i === currentPhaseIdx && isWaveActive;
          return (
            <div
              key={p.value}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-500',
                isCompleted
                  ? 'bg-emerald-500/60'
                  : isCurrent
                    ? 'bg-white/30'
                    : 'bg-white/[0.04]',
              )}
              title={p.label}
            />
          );
        })}
      </div>

      {/* ═══ MAIN CONTENT: Graph + Timeline ═══ */}
      <div className="flex-1 min-h-0 flex gap-2.5">
        {/* LEFT: Node Graph */}
        <div className="hidden sm:flex flex-col w-[45%] min-w-0">
          <div className="relative flex-1 min-h-0 rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden">
            {/* Corner labels */}
            <div className="absolute top-2 left-2.5 z-10 pointer-events-none">
              <span className="text-[8px] font-mono text-zinc-600 tracking-wider">AGENT NETWORK</span>
            </div>
            <div className="absolute top-2 right-2.5 z-10 pointer-events-none">
              <span className="text-[8px] font-mono text-zinc-600 tracking-wider">
                {networkNodes.length} NODE{networkNodes.length !== 1 ? 'S' : ''}
              </span>
            </div>
            <AgentNetworkGraph />
          </div>
        </div>

        {/* RIGHT: Timeline */}
        <div className="flex-1 min-w-0 flex flex-col rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-white/[0.04] flex items-center gap-2">
            <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase">Timeline</span>
            {isPlaying && (
              <span className="text-[9px] font-mono text-sky-400 animate-pulse">
                ▶ Playing
              </span>
            )}
            {!isPlaying && hasData && (
              <span className="text-[9px] font-mono text-zinc-600">
                {meaningfulActivities.length} actions
              </span>
            )}
          </div>

          <ScrollArea className="flex-1">
            {hasData ? (
              <div className="p-2 flex flex-col gap-0.5">
                {meaningfulActivities
                  .slice() // clone to not mutate
                  .reverse() // oldest first for display
                  .map((entry, displayIdx) => {
                    // The actual index in the original array (newest-first)
                    const originalIdx = meaningfulActivities.length - 1 - displayIdx;
                    const isActive = playbackIndex === originalIdx;
                    const isFirstInPhase =
                      displayIdx === 0 ||
                      entry.phase !== meaningfulActivities[meaningfulActivities.length - 1 - displayIdx + 1]?.phase;

                    return (
                      <div key={entry.id} data-replay-entry>
                        <TimelineEntry
                          entry={entry}
                          index={displayIdx}
                          isActive={isActive}
                          isFirstInPhase={isFirstInPhase}
                          waveStart={waveStart}
                        />
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
                <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center">
                  <Waves className="w-5 h-5 text-zinc-700" />
                </div>
                <p className="text-zinc-600 text-xs text-center leading-relaxed">
                  Waiting for the next wave...<br />
                  <span className="text-zinc-700">Actions will appear here with timestamps</span>
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}