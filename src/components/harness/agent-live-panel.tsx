'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { WaveReplayView } from './wave-replay-view';
import { HERMES_VERSION, getStateHex } from '@/lib/constants';
import {
  Waves, Activity, Heart, TrendingUp, Zap,
} from 'lucide-react';

/* ═════════════════════════════════════════════════════════════════════
   AGENT LIVE PANEL v7.0 — Bold Counters + No-Scroll + Maximum Clarity

   Layout (fits viewport, zero scrollbars):
   ┌──────────────────────────────────────────────────┐
   │ LIVE ● IDLE  message...                   v0.3  │
   ├──────┬──────┬──────┬──────┬──────────────────────┤
   │  169 │   12 │    8 │  76↑ │  93.5%              │
   │ WAVES │ DECS │ IMPR │ HLTH │ SUCCESS             │
   ├──────┴──────┴──────┴──────┴──────────────────────┤
   │ Controls + Phase Bar                            │
   ├──────────────────┬───────────────────────────────┤
   │                  │                               │
   │   NODE GRAPH     │   TIMELINE (no scroll)        │
   │                  │                               │
   └──────────────────┴───────────────────────────────┘
   ═════════════════════════════════════════════════════════ */

// ─── Counter Card (bigger, bolder, with colored accent) ──────────
function CounterCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-lg bg-white/[0.03] border border-white/[0.05] relative overflow-hidden"
    >
      {/* Colored left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ backgroundColor: color }}
      />
      <span
        className="text-xl font-bold tabular-nums leading-none tracking-tight"
        style={{ color }}
      >
        {value}
      </span>
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3" style={{ color: color + '99' }} />
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      {sub && (
        <span className="text-[9px] text-zinc-500 font-mono">{sub}</span>
      )}
    </div>
  );
}

// ─── Main Panel ────────────────────────────────────────────
export function AgentLivePanel() {
  const agentState = useAgentLiveStore(s => s.agentState);
  const message = useAgentLiveStore(s => s.message);
  const isConnected = useAgentLiveStore(s => s.isConnected);
  const waveCount = useAgentLiveStore(s => s.waveCount);
  const totalDecisions = useAgentLiveStore(s => s.totalDecisions);
  const totalImprovements = useAgentLiveStore(s => s.totalImprovements);
  const healthScore = useAgentLiveStore(s => s.healthScore);
  const recentSuccessRate = useAgentLiveStore(s => s.recentSuccessRate);
  const healthScoreTrend = useAgentLiveStore(s => s.healthScoreTrend);
  const waveNumber = useAgentLiveStore(s => s.waveNumber);
  const decisionCountThisWave = useAgentLiveStore(s => s.decisionCountThisWave);

  const stateHex = getStateHex(agentState);
  const isWaveActive = agentState !== 'idle' && agentState !== 'offline';
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      key="agent-live"
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.3 }}
      className="flex flex-col gap-2 h-full overflow-hidden"
    >
      {/* ═══ ROW 1: STATUS BAR ═══ */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/[0.06]">
        {/* LIVE indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{
              backgroundColor: isConnected ? '#22c55e' : '#71717a',
              boxShadow: isConnected ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
            }}
          />
          <span
            className="text-[10px] font-mono font-bold tracking-widest"
            style={{ color: isConnected ? '#22c55e' : '#71717a' }}
          >
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* State */}
        <div className="shrink-0 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stateHex }} />
          <span
            className="text-xs font-bold tracking-wider uppercase"
            style={{ color: stateHex }}
          >
            {agentState}
          </span>
        </div>

        {/* Decision counter for current wave */}
        {isWaveActive && decisionCountThisWave > 0 && (
          <span className="shrink-0 text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
            {decisionCountThisWave} decisions
          </span>
        )}

        {/* Message */}
        <span className="text-xs text-zinc-400 truncate min-w-0 flex-1">
          {message}
        </span>

        {/* Version */}
        <span className="shrink-0 text-[10px] font-mono text-zinc-600">{HERMES_VERSION}</span>
      </div>

      {/* ═══ ROW 2: COUNTERS (bigger, bolder) ═══ */}
      <div className="shrink-0 grid grid-cols-5 gap-2">
        <CounterCard
          icon={Waves}
          label="Waves"
          value={waveCount || '—'}
          sub={waveNumber > 0 ? `#${waveNumber}` : undefined}
          color="#38bdf8"
        />
        <CounterCard
          icon={Activity}
          label="Decisions"
          value={totalDecisions || '—'}
          color="#f59e0b"
        />
        <CounterCard
          icon={Zap}
          label="Improved"
          value={totalImprovements || '—'}
          color="#a855f7"
        />
        <CounterCard
          icon={Heart}
          label="Health"
          value={healthScore > 0 ? healthScore : '—'}
          sub={
            healthScore > 0
              ? `${healthScoreTrend === 'up' ? '↑' : healthScoreTrend === 'down' ? '↓' : '→'} /100`
              : undefined
          }
          color={healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#f59e0b' : '#ef4444'}
        />
        <CounterCard
          icon={TrendingUp}
          label="Success"
          value={recentSuccessRate > 0 ? `${recentSuccessRate}%` : '—'}
          color="#06b6d4"
        />
      </div>

      {/* ═══ ROW 3+: REPLAY VIEW (no scroll) ═══ */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <WaveReplayView />
      </div>
    </motion.div>
  );
}