'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { WaveReplayView } from './wave-replay-view';
import { HERMES_VERSION } from '@/lib/constants';
import { getStateHex } from '@/lib/constants';
import {
  Waves, Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/* ═════════════════════════════════════════════════════════════════════
   AGENT LIVE PANEL v5.0 — Replay-First Design

   The panel is now a wave replay viewer:
   - Top: compact status bar (state, message, connection indicator)
   - Main: WaveReplayView (timeline + graph + controls)
   
   No more canvas animations, particle systems, or orbital mechanics.
   Just clear, timestamped replay of what the agent did.
   ═════════════════════════════════════════════════════════════════════ */

export function AgentLivePanel() {
  const agentState = useAgentLiveStore(s => s.agentState);
  const message = useAgentLiveStore(s => s.message);
  const isConnected = useAgentLiveStore(s => s.isConnected);
  const waveCount = useAgentLiveStore(s => s.waveCount);
  const totalDecisions = useAgentLiveStore(s => s.totalDecisions);

  const stateHex = getStateHex(agentState);

  return (
    <motion.div
      key="agent-live"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2.5 h-full"
    >
      {/* ═══ COMPACT STATUS BAR ═══ */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/[0.06]">
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{
              backgroundColor: isConnected ? '#22c55e' : '#71717a',
              boxShadow: isConnected ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
            }}
          />
          <span className="text-[9px] font-mono text-zinc-500 tracking-wider">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* State + Message */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="shrink-0 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: stateHex }}
          />
          <span
            className="text-[10px] font-medium truncate transition-colors duration-300"
            style={{ color: stateHex }}
          >
            {agentState.toUpperCase()}
          </span>
          <span className="text-[10px] text-zinc-500 truncate">
            {message}
          </span>
        </div>

        {/* Quick stats */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Waves className="w-3 h-3 text-sky-400/70" />
            <span className="text-[10px] font-mono text-zinc-500">{waveCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-400/70" />
            <span className="text-[10px] font-mono text-zinc-500">{totalDecisions}</span>
          </div>
          <Badge
            variant="outline"
            className="text-[8px] h-4 px-1.5 border-white/[0.06] text-zinc-600"
          >
            v{HERMES_VERSION}
          </Badge>
        </div>
      </div>

      {/* ═══ MAIN: Replay View ═══ */}
      <div className="flex-1 min-h-0">
        <WaveReplayView />
      </div>
    </motion.div>
  );
}