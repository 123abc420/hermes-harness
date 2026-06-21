'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAgentLiveStore, type LiveActivityEntry } from '@/store/agent-live-store';
import { AgentNetworkGraph } from './agent-network-graph';
import { PHASE_STEPS, STATE_ICONS } from './agent-live-subcomponents';
import { getStateHex } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Play, Pause, Repeat, SkipForward, Waves,
} from 'lucide-react';

/* ═════════════════════════════════════════════════════════════════════
   WAVE REPLAY VIEW v3.0 — Bigger Phase Bar, Legible Timeline, No-Scroll

   - Phase bar: h-2 (8px) with labels inside completed segments
   - Timeline entries: text-xs (12px) messages, larger icons, more padding
   - NO ScrollArea — clips to available space
   - Graph + timeline share viewport height
   ═════════════════════════════════════════════════════════════════════ */

// ─── Timeline Entry (legible, single line) ──────────────────
function TimelineEntry({
  entry,
  isActive,
  isFirstInPhase,
  waveStart,
}: {
  entry: LiveActivityEntry;
  isActive: boolean;
  isFirstInPhase: boolean;
  waveStart: number;
}) {
  const relSec = Math.round((entry.timestamp - waveStart) / 1000);
  const timeStr = `${String(Math.floor(relSec / 60)).padStart(2, '0')}:${String(relSec % 60).padStart(2, '0')}`;
  const stateColor = getStateHex(entry.state);

  return (
    <>
      {isFirstInPhase && entry.phase && (
        <div className="flex items-center gap-2 pt-1.5 pb-0.5">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
            {entry.phase}
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
      )}
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded-md transition-colors duration-200',
          isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.03]',
        )}
      >
        <span className="shrink-0 text-[10px] font-mono text-zinc-600 w-9 text-right">
          {timeStr}
        </span>
        <div
          className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px]"
          style={{ backgroundColor: stateColor + '18', color: stateColor }}
        >
          {STATE_ICONS[entry.state] || '·'}
        </div>
        <p
          className={cn(
            'text-xs leading-snug truncate min-w-0',
            isActive ? 'text-zinc-200 font-medium' : 'text-zinc-400',
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const [speed, setSpeed] = useState(1500);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLoopingRef = useRef(isLooping);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);

  // Show last N entries that fit — no scroll needed
  const maxVisible = 20;
  const meaningfulActivities = useMemo(() => {
    return activities
      .filter(a => a.state !== 'idle' || (a.phase && a.phase.length > 0))
      .slice(0, maxVisible);
  }, [activities]);

  const waveStart = useMemo(() => {
    if (meaningfulActivities.length === 0) return Date.now();
    return meaningfulActivities[meaningfulActivities.length - 1].timestamp;
  }, [meaningfulActivities]);

  const waveEnd = useMemo(() => {
    if (meaningfulActivities.length === 0) return Date.now();
    return meaningfulActivities[0].timestamp;
  }, [meaningfulActivities]);

  const durationSec = Math.max(1, Math.round((waveEnd - waveStart) / 1000));

  const currentPhaseIdx = useMemo(() => {
    const idx = PHASE_STEPS.findIndex(p => p.key === phase);
    return idx >= 0 ? idx : 0;
  }, [phase]);

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
    let idx = meaningfulActivities.length - 1;
    setPlaybackIndex(idx);
    timerRef.current = setInterval(() => {
      idx--;
      if (idx < 0) {
        if (isLoopingRef.current) {
          idx = meaningfulActivities.length - 1;
        } else {
          stopPlayback();
          return;
        }
      }
      setPlaybackIndex(idx);
    }, speed);
  }, [meaningfulActivities, speed, stopPlayback]);

  const togglePlay = useCallback(() => {
    if (isPlaying) stopPlayback(); else startPlayback();
  }, [isPlaying, startPlayback, stopPlayback]);

  const skipToEnd = useCallback(() => {
    stopPlayback();
    setPlaybackIndex(0);
  }, [stopPlayback]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const speedOptions = [
    { label: '0.5x', value: 3000 },
    { label: '1x', value: 1500 },
    { label: '2x', value: 750 },
    { label: '4x', value: 375 },
  ];
  const currentSpeedIdx = speedOptions.findIndex(s => s.value === speed);

  const hasData = meaningfulActivities.length > 0;
  const isWaveActive = agentState !== 'idle' && agentState !== 'offline';

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      {/* ═══ CONTROLS ROW ═══ */}
      <div className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/[0.06]">
        <Waves className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span className="text-xs font-bold text-white shrink-0">
          {waveNumber > 0 ? `W${waveNumber}` : 'REPLAY'}
        </span>
        {isWaveActive && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse shrink-0"
            style={{ backgroundColor: getStateHex(agentState) + '20', color: getStateHex(agentState) }}
          >
            {agentState.toUpperCase()}
          </span>
        )}

        <div className="flex-1" />

        {/* Speed */}
        <button
          aria-label={`Playback speed: ${speedOptions[currentSpeedIdx >= 0 ? currentSpeedIdx : 1].label}. Click to change.`}
          onClick={() => {
            const next = (currentSpeedIdx + 1) % speedOptions.length;
            setSpeed(speedOptions[next].value);
          }}
          className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 px-1.5 py-1 rounded-md border border-white/[0.08] hover:border-white/[0.15] transition-colors shrink-0"
        >
          {speedOptions[currentSpeedIdx >= 0 ? currentSpeedIdx : 1].label}
        </button>

        <Button variant="ghost" size="sm" onClick={togglePlay} disabled={!hasData}
          aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
          className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] shrink-0">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={skipToEnd} disabled={!hasData}
          aria-label="Skip to latest activity"
          className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] shrink-0">
          <SkipForward className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsLooping(!isLooping)}
          aria-label={isLooping ? 'Disable loop' : 'Enable loop'}
          className={cn('h-7 w-7 p-0 rounded-lg transition-colors shrink-0',
            isLooping ? 'text-sky-400 bg-sky-400/10' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.08]'
          )}>
          <Repeat className="w-3.5 h-3.5" />
        </Button>

        {hasData && (
          <span className="text-[10px] font-mono text-zinc-500 shrink-0 w-16 text-right">
            {durationSec}s · {meaningfulActivities.length}
          </span>
        )}
      </div>

      {/* ═══ PHASE PROGRESS BAR (larger, with inline labels) ═══ */}
      <div className="shrink-0 flex items-stretch gap-[2px]">
        {PHASE_STEPS.map((p, i) => {
          const isCompleted = i < currentPhaseIdx;
          const isCurrent = i === currentPhaseIdx && isWaveActive;
          return (
            <div
              key={p.key}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors duration-500 flex items-center justify-center',
                isCompleted
                  ? ''
                  : isCurrent
                    ? ''
                    : '',
              )}
              style={{
                backgroundColor: isCompleted
                  ? p.barColor + '60'
                  : isCurrent
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(255,255,255,0.04)',
              }}
              title={p.label}
            >
              {/* Show label inside the bar for completed/current phases on wider screens */}
              <span
                className={cn(
                  'hidden lg:inline text-[8px] font-bold tracking-wider',
                  isCompleted ? 'text-white/70' : isCurrent ? 'text-white/50' : 'text-zinc-700',
                )}
              >
                {p.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ═══ MAIN: Graph + Timeline (NO SCROLL) ═══ */}
      <div className="flex-1 min-h-0 flex gap-2 overflow-hidden">
        {/* LEFT: Node Graph */}
        <div className="hidden sm:flex flex-col w-[38%] min-w-0">
          <div className="relative flex-1 min-h-0 rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden">
            <div className="absolute top-2 left-2.5 z-10 pointer-events-none">
              <span className="text-[9px] font-mono text-zinc-600 tracking-wider font-semibold">NETWORK</span>
            </div>
            <div className="absolute top-2 right-2.5 z-10 pointer-events-none">
              <span className="text-[9px] font-mono text-zinc-600 tracking-wider font-semibold">
                {networkNodes.length} NODE{networkNodes.length !== 1 ? 'S' : ''}
              </span>
            </div>
            <AgentNetworkGraph />
          </div>
        </div>

        {/* RIGHT: Timeline (NO ScrollArea — overflow-hidden) */}
        <div className="flex-1 min-w-0 flex flex-col rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Timeline</span>
            {isPlaying && <span className="text-[10px] font-mono text-sky-400 animate-pulse">▶ Playing</span>}
            {!isPlaying && hasData && <span className="text-[10px] font-mono text-zinc-600">{meaningfulActivities.length} actions</span>}
          </div>

          {/* NO ScrollArea — content fits viewport, clips if overflow */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {hasData ? (
              <div className="p-1.5 flex flex-col gap-0 h-full overflow-hidden">
                {meaningfulActivities
                  .slice()
                  .reverse()
                  .map((entry, displayIdx) => {
                    const originalIdx = meaningfulActivities.length - 1 - displayIdx;
                    const isActive = playbackIndex === originalIdx;
                    const isFirstInPhase =
                      displayIdx === 0 ||
                      entry.phase !== meaningfulActivities[meaningfulActivities.length - 1 - displayIdx + 1]?.phase;

                    return (
                      <div key={entry.id}>
                        <TimelineEntry
                          entry={entry}
                          isActive={isActive}
                          isFirstInPhase={isFirstInPhase}
                          waveStart={waveStart}
                        />
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/[0.04]">
                  <Waves className="w-5 h-5 text-zinc-700" />
                </div>
                <p className="text-zinc-600 text-xs text-center font-medium">
                  Waiting for the next wave...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}