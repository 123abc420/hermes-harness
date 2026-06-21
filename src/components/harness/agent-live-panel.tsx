'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { WaveReplayView } from './wave-replay-view';
import { HERMES_VERSION, getStateHex } from '@/lib/constants';
import {
  Waves, Activity, Heart, TrendingUp, Zap,
} from 'lucide-react';

/* ═════════════════════════════════════════════════════════════════════
   AGENT LIVE PANEL v6.0 — Counters + No-Scroll Layout

   Layout (fits viewport, zero scrollbars):
   ┌──────────────────────────────────────────────────┐
   │ LIVE ● IDLE  message...                   v0.3  │
   ├──────┬──────┬──────┬──────┬──────────────────────┤
   │  169 │   12 │    8 │  76↑ │  93.5%              │
   │ WAVES │ DECS │ IMPR │ HLTH │ SUCCESS             │
   ├──────┴──────┴──────┴──────┴──────────────────────┤
   │ W259 ▶ ⏭ 🔁 1x   ASSESS PLAN EXEC ...  45s·20  │
   │ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
   ├──────────────────┬───────────────────────────────┤
   │                  │                               │
   │   NODE GRAPH     │   TIMELINE (no scroll)        │
   │                  │                               │
   └──────────────────┴───────────────────────────────┘
   ═════════════════════════════════════════════════════════ */

// ─── Counter Card ──────────────────────────────────────────
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
    <div className="flex-1 min-w-0 flex flex-col items-center gap-0 py-1 px-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <span className="text-base font-bold tabular-nums leading-none" style={{ color }}>
        {value}
      </span>
      <div className="flex items-center gap-1 mt-0.5">
        <Icon className="w-2.5 h-2.5" style={{ color: color + '80' }} />
        <span className="text-[8px] font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
      </div>
      {sub && <span className="text-[7px] text-zinc-600">{sub}</span>}
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

  return (
    <motion.div
      key="agent-live"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1.5 h-full overflow-hidden"
    >
      {/* ═══ ROW 1: STATUS BAR ═══ */}
      <div className="shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/[0.06]">
        {/* LIVE indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
            style={{
              backgroundColor: isConnected ? '#22c55e' : '#71717a',
              boxShadow: isConnected ? '0 0 5px rgba(34,197,94,0.5)' : 'none',
            }}
          />
          <span className="text-[8px] font-mono font-bold tracking-widest" style={{ color: isConnected ? '#22c55e' : '#71717a' }}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* State */}
        <div className="shrink-0 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateHex }} />
          <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: stateHex }}>
            {agentState}
          </span>
        </div>

        {/* Decision counter for current wave */}
        {isWaveActive && decisionCountThisWave > 0 && (
          <span className="shrink-0 text-[8px] font-mono text-amber-400/70 bg-amber-400/10 px-1.5 py-0.5 rounded">
            {decisionCountThisWave} dec
          </span>
        )}

        {/* Message */}
        <span className="text-[10px] text-zinc-400 truncate min-w-0 flex-1">
          {message}
        </span>

        {/* Version */}
        <span className="shrink-0 text-[8px] font-mono text-zinc-700">{HERMES_VERSION}</span>
      </div>

      {/* ═══ ROW 2: COUNTERS ═══ */}
      <div className="shrink-0 grid grid-cols-5 gap-1.5">
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
          sub={healthScore > 0 ? `${healthScoreTrend === 'up' ? '↑' : healthScoreTrend === 'down' ? '↓' : '→'} /100` : undefined}
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