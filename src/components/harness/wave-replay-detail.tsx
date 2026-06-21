'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import {
  generateWaveReplay,
  type ReplayStep,
  type StepType,
} from '@/lib/wave-replay-simulator';
import { Button } from '@/components/ui/button';
import {
  Play, Pause, SkipForward, Repeat, X, ChevronRight,
  Terminal, FileText, Radio, Brain, Search, Edit3, GitBranch, Zap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   WAVE REPLAY DETAIL v1.0 — Sims-style step-by-step replay
   
   Shows every granular action the agent took during a wave:
   - Thinking (🧠)
   - Broadcasting to dashboard (📡)
   - Reading files (📄)
   - Writing/editing files (✏️)
   - Running commands (⌨️)
   - API calls (🔗)
   - Code search (🔎)
   - Node spawn/remove (💠/🗑️)
   - Results (✅)
   
   Auto-plays through steps with typing animations.
   ═══════════════════════════════════════════════════════════════ */

// ─── Step type → Lucide icon ───────────────────────────────────
const TYPE_ICON_MAP: Record<StepType, React.ReactNode> = {
  'think': <Brain className="w-3.5 h-3.5" />,
  'broadcast': <Radio className="w-3.5 h-3.5" />,
  'read-file': <FileText className="w-3.5 h-3.5" />,
  'write-file': <Edit3 className="w-3.5 h-3.5" />,
  'run-command': <Terminal className="w-3.5 h-3.5" />,
  'api-call': <Zap className="w-3.5 h-3.5" />,
  'grep': <Search className="w-3.5 h-3.5" />,
  'node-spawn': <ChevronRight className="w-3.5 h-3.5" />,
  'node-remove': <X className="w-3.5 h-3.5" />,
  'phase-start': <Zap className="w-3.5 h-3.5" />,
  'result': <Zap className="w-3.5 h-3.5" />,
  'wait': <Pause className="w-3.5 h-3.5" />,
  'git-sync': <GitBranch className="w-3.5 h-3.5" />,
};

// ─── Phase colors ──────────────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  assess: '#06b6d4',
  plan: '#a855f7',
  execute: '#f43f5e',
  verify: '#22c55e',
  persist: '#f59e0b',
  report: '#38bdf8',
};

// ─── Typing animation hook ─────────────────────────────────────
function useTypingText(text: string, isActive: boolean, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!isActive) {
      idxRef.current = 0;
      lastTimeRef.current = 0;
      // Schedule reset via rAF to avoid synchronous setState in effect
      rafRef.current = requestAnimationFrame(() => setDisplayed(''));
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
    if (reducedMotion) {
      // Schedule via rAF to avoid synchronous setState in effect
      rafRef.current = requestAnimationFrame(() => setDisplayed(text));
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    idxRef.current = 0;
    lastTimeRef.current = 0;

    const animate = (time: number) => {
      // First frame: reset display, then start timing from next frame
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        setDisplayed('');
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      if (time - lastTimeRef.current >= speed) {
        lastTimeRef.current = time;
        idxRef.current = Math.min(idxRef.current + 1, text.length);
        setDisplayed(text.slice(0, idxRef.current));
      }
      if (idxRef.current < text.length) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, text, speed, reducedMotion]);

  return displayed;
}

// ─── Single Replay Step Row ────────────────────────────────────
function ReplayStepRow({
  step,
  isActive,
  isDone,
  isExpanded,
  onToggle,
}: {
  step: ReplayStep;
  isActive: boolean;
  isDone: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const phaseColor = PHASE_COLORS[step.phase] || '#71717a';
  const typedDetail = useTypingText(step.detail, isActive && isExpanded, 20);
  const reducedMotion = usePrefersReducedMotion();

  const isPhaseMarker = step.type === 'phase-start';

  return (
    <div className="group">
      {/* Phase divider */}
      {isPhaseMarker && (
        <div className="flex items-center gap-2 pt-2 pb-1">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-md"
            style={{ color: phaseColor, backgroundColor: phaseColor + '12' }}
          >
            {step.phase}
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
      )}

      {/* Step row */}
      {!isPhaseMarker && (
        <button
          onClick={onToggle}
          aria-label={`${step.title}: ${step.detail}. ${isExpanded ? 'Collapse' : 'Expand'} for details.`}
          className={cn(
            'w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-300',
            isActive
              ? 'bg-white/[0.07] ring-1 ring-white/[0.08]'
              : isDone
                ? 'hover:bg-white/[0.03] opacity-70'
                : 'opacity-40',
          )}
        >
          {/* Left: icon + color bar */}
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <div
              className="w-1 h-6 rounded-full transition-colors duration-300"
              style={{ backgroundColor: isActive ? step.color : isDone ? step.color + '60' : '#3f3f46' }}
            />
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300"
              style={{
                backgroundColor: isActive ? step.color + '20' : isDone ? step.color + '10' : 'transparent',
                color: isActive ? step.color : isDone ? step.color + '90' : '#52525b',
              }}
            >
              {TYPE_ICON_MAP[step.type]}
            </div>
          </div>

          {/* Center: title + detail */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-[11px] font-medium leading-tight transition-colors duration-300',
                isActive ? 'text-zinc-100' : isDone ? 'text-zinc-300' : 'text-zinc-500',
              )}
            >
              {step.title}
            </p>

            {/* Expanded detail with typing animation */}
            {(isExpanded || (isActive && step.detail.length < 60)) && (
              <div
                className={cn(
                  'mt-1.5 rounded-md px-2.5 py-2 text-[10px] leading-relaxed font-mono transition-all duration-300',
                  'bg-black/40 border',
                )}
                style={{
                  borderColor: step.color + '20',
                  color: isActive ? step.color + 'dd' : isDone ? '#a1a1aa' : '#52525b',
                }}
              >
                {/* Show typing animation when active, full text when done */}
                {isActive ? (
                  <span>
                    {typedDetail}
                    <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-current animate-pulse align-middle" />
                  </span>
                ) : (
                  <span>{step.detail}</span>
                )}
              </div>
            )}

            {/* Result line */}
            {isExpanded && step.result && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: '#22c55e' }}>→</span>
                <span className="text-[10px] font-mono text-emerald-400/80 truncate">
                  {step.result}
                </span>
              </div>
            )}
          </div>

          {/* Right: expand indicator */}
          {!isPhaseMarker && step.detail.length >= 60 && (
            <div className="shrink-0 pt-1">
              <ChevronRight
                className={cn(
                  'w-3 h-3 text-zinc-600 transition-transform duration-200',
                  isExpanded && 'rotate-90',
                )}
              />
            </div>
          )}

          {/* Active pulse indicator */}
          {isActive && !reducedMotion && (
            <div
              className="absolute right-2 top-2 w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: step.color }}
            />
          )}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
interface WaveReplayDetailProps {
  waveNumber: number;
  isMaintenance: boolean;
  onClose: () => void;
}

export function WaveReplayDetail({ waveNumber, isMaintenance, onClose }: WaveReplayDetailProps) {
  const steps = useMemo(
    () => generateWaveReplay(waveNumber, isMaintenance),
    [waveNumber, isMaintenance],
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [speed, setSpeed] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);
  const currentIdxRef = useRef(-1);
  const isLoopingRef = useRef(false);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);

  // Helper: advance to a step and auto-expand it
  const advanceToStep = useCallback((idx: number) => {
    setCurrentIdx(idx);
    if (idx >= 0) {
      setExpandedSteps(prev => new Set(prev).add(idx));
    }
  }, []);

  // Auto-scroll to active step
  useEffect(() => {
    if (currentIdx < 0) return;
    const el = containerRef.current?.querySelector(`[data-step-idx="${currentIdx}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIdx]);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    advanceToStep(0);

    const tick = () => {
      if (!isPlayingRef.current) return;
      const nextIdx = currentIdxRef.current + 1;
      if (nextIdx >= steps.length) {
        if (isLoopingRef.current) {
          advanceToStep(0);
          currentIdxRef.current = -1; // will become 0
          timerRef.current = setTimeout(tick, 600);
        } else {
          setIsPlaying(false);
          advanceToStep(-1);
        }
        return;
      }
      advanceToStep(nextIdx);
      const stepDuration = steps[nextIdx].duration / speed;
      timerRef.current = setTimeout(tick, Math.max(100, stepDuration));
    };

    timerRef.current = setTimeout(tick, 300);
  }, [steps, speed, advanceToStep]);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) stopPlayback(); else startPlayback();
  }, [isPlaying, startPlayback, stopPlayback]);

  const skipToEnd = useCallback(() => {
    stopPlayback();
    advanceToStep(steps.length - 1);
    // expand all
    setExpandedSteps(new Set(steps.map(s => s.id)));
  }, [stopPlayback, steps, advanceToStep]);

  const toggleExpand = useCallback((id: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Calculate progress
  const progress = currentIdx >= 0 ? (currentIdx / (steps.length - 1)) * 100 : 0;
  const currentPhase = currentIdx >= 0 ? steps[currentIdx]?.phase : '';
  const currentStep = currentIdx >= 0 ? steps[currentIdx] : null;

  const speedOptions = [
    { label: '0.5×', value: 0.5 },
    { label: '1×', value: 1 },
    { label: '2×', value: 2 },
    { label: '4×', value: 4 },
  ];
  const currentSpeedIdx = speedOptions.findIndex(s => s.value === speed);

  return (
    <div className="absolute inset-0 z-50 bg-[#0a0a0a]/98 backdrop-blur-md flex flex-col overflow-hidden">
      {/* ═══ HEADER ═══ */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-sm font-bold text-white tracking-wide">WAVE REPLAY</span>
        </div>

        <div className="h-4 w-px bg-white/[0.08]" />

        <span className="text-xs font-mono text-zinc-400">
          W{waveNumber}
        </span>

        {isMaintenance && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-white/[0.06]">
            MAINTENANCE
          </span>
        )}

        {currentPhase && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
            style={{
              color: PHASE_COLORS[currentPhase],
              backgroundColor: PHASE_COLORS[currentPhase] + '15',
            }}
          >
            {currentPhase}
          </span>
        )}

        <div className="flex-1" />

        {/* Speed selector */}
        <button
          aria-label={`Playback speed: ${speedOptions[currentSpeedIdx >= 0 ? currentSpeedIdx : 1].label}`}
          onClick={() => {
            const next = (currentSpeedIdx + 1) % speedOptions.length;
            setSpeed(speedOptions[next].value);
          }}
          className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-md border border-white/[0.08] hover:border-white/[0.15] transition-colors"
        >
          {speedOptions[currentSpeedIdx >= 0 ? currentSpeedIdx : 1].label}
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={togglePlay}
            className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08]">
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={skipToEnd}
            className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08]">
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsLooping(!isLooping)}
            className={cn('h-7 w-7 p-0 rounded-lg transition-colors',
              isLooping ? 'text-sky-400 bg-sky-400/10' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.08]'
            )}>
            <Repeat className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Step counter */}
        <span className="text-[10px] font-mono text-zinc-600 w-16 text-right">
          {currentIdx + 1}/{steps.length}
        </span>

        {/* Close */}
        <Button variant="ghost" size="sm" onClick={onClose}
          className="h-7 w-7 p-0 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] ml-1">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* ═══ PROGRESS BAR ═══ */}
      <div className="shrink-0 px-4 py-2">
        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: currentPhase ? PHASE_COLORS[currentPhase] : '#3f3f46',
            }}
          />
        </div>
        {/* Phase segments */}
        <div className="flex gap-px mt-1">
          {Object.entries(PHASE_COLORS).map(([key, color]) => (
            <div
              key={key}
              className="h-0.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: currentPhase === key ? color + '80' : color + '15',
              }}
            />
          ))}
        </div>
      </div>

      {/* ═══ STEP LIST ═══ */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto px-2 py-1 custom-scrollbar-thin">
        <div className="max-w-3xl mx-auto flex flex-col gap-0.5 pb-8">
          {steps.map((s) => {
            const isActive = currentIdx === steps.indexOf(s);
            const isDone = currentIdx > steps.indexOf(s);
            const isExpanded = expandedSteps.has(s.id);
            return (
              <div key={s.id} data-step-idx={steps.indexOf(s)}>
                <ReplayStepRow
                  step={s}
                  isActive={isActive}
                  isDone={isDone}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpand(s.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ FOOTER: Current step detail ═══ */}
      {currentStep && (
        <div
          className="shrink-0 px-4 py-3 border-t border-white/[0.06] bg-black/50"
          style={{ borderTopColor: currentStep.color + '20' }}
        >
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <span className="text-sm">{currentStep.icon}</span>
            <span className="text-xs font-medium text-zinc-200 truncate">
              {currentStep.title}
            </span>
            <div className="flex-1" />
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-md"
              style={{
                color: currentStep.color,
                backgroundColor: currentStep.color + '10',
                borderColor: currentStep.color + '20',
                border: '1px solid',
              }}
            >
              {currentStep.type.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}