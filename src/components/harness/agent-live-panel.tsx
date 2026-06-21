'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAgentLiveStore, type LiveActivityEntry, type AgentVisualState } from '@/store/agent-live-store';
import { useWaves, useDecisions } from '@/hooks/use-harness-data';
import { useWaveReplay } from '@/hooks/use-wave-replay';
import { useNextWaveCountdown } from '@/hooks/use-next-wave-countdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  WifiOff, Zap, Brain, TrendingUp, Waves, Shield, Sparkles,
  CheckCircle2, Play, Pause, Activity, Terminal,
  Radio, Clock, Filter, Cpu, GitBranch, BarChart3, Heart,
} from 'lucide-react';
import { HERMES_VERSION, getStateHex } from '@/lib/constants';
import { AgentNetworkCanvas } from './agent-network-canvas';
import { PhaseTracker, STATE_COLORS, STATE_ICONS } from './agent-live-subcomponents';

// ─── Activity filters ──────────────────────────────────────────
const ACTIVITY_FILTERS: Array<{ state: AgentVisualState | 'all'; label: string; icon: string }> = [
  { state: 'all', label: 'All', icon: '•' },
  { state: 'thinking', label: 'Think', icon: STATE_ICONS.thinking },
  { state: 'executing', label: 'Exec', icon: STATE_ICONS.executing },
  { state: 'planning', label: 'Plan', icon: STATE_ICONS.planning },
  { state: 'verifying', label: 'Verify', icon: STATE_ICONS.verifying },
  { state: 'celebrating', label: 'Done', icon: STATE_ICONS.celebrating },
  { state: 'error', label: 'Error', icon: STATE_ICONS.error },
];

// ─── Mission Control Panel ─────────────────────────────────────
export function AgentLivePanel() {
  const [activityFilter, setActivityFilter] = useState<AgentVisualState | 'all'>('all');

  // Store state
  const {
    agentState, message, phase, progress, waveNumber,
    isConnected, waveCount, totalImprovements, totalDecisions,
    decisionCountThisWave, recentSuccessRate, healthScore,
    level, levelName, xp, xpToNext,
    activities, networkNodes, selectedNodeId,
  } = useAgentLiveStore();

  // Data hooks
  const { data: wavesData } = useWaves(1, 1);
  const { data: decisionsData } = useDecisions(1, 3);
  const { toggleReplay, isReplaying } = useWaveReplay();

  const latestWave = wavesData?.waves?.[0];
  const countdown = useNextWaveCountdown(latestWave?.waveNumber ?? 0, latestWave ?? null);
  const stateHex = getStateHex(agentState);

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return activities;
    return activities.filter(a => a.state === activityFilter);
  }, [activities, activityFilter]);

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 h-full animate-in fade-in duration-500">
      
      {/* ═══ TOP BAR: Mission Control Header ═══ */}
      <div className="flex flex-col gap-2">
        {/* Connection + Wave Status Bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.06]">
          <div className="flex items-center gap-3">
            {/* LIVE Indicator */}
            <div className="flex items-center gap-1.5">
              <div className={cn('relative w-2 h-2 rounded-full', isConnected ? 'bg-emerald-400' : 'bg-zinc-600')}>
                {isConnected && (
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
                )}
              </div>
              <span className={cn('text-[10px] font-bold tracking-widest', isConnected ? 'text-emerald-400' : 'text-zinc-500')}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            {/* Agent State Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ backgroundColor: `${stateHex}18`, border: `1px solid ${stateHex}30` }}>
              <span className="text-xs">{STATE_ICONS[agentState]}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: stateHex }}>
                {agentState}
              </span>
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-300">LV {level}</span>
              <span className="text-[9px] text-amber-400/60">{levelName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Wave Number */}
            {waveNumber > 0 && (
              <div className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] font-semibold text-sky-300">W{waveNumber}</span>
              </div>
            )}

            {/* Next wave countdown */}
            {(countdown != null && countdown > 0 && countdown < 600) && !isReplaying && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-mono text-zinc-400">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Version */}
            <span className="text-[9px] font-mono text-zinc-600">{HERMES_VERSION}</span>
          </div>
        </div>

        {/* Phase Tracker */}
        <PhaseTracker phase={phase} progress={progress} />

        {/* Current Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3 text-zinc-500 shrink-0" />
              <p className="text-[11px] text-zinc-300 truncate">{message || 'Waiting for activity...'}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ MAIN AREA: Agent World Canvas ═══ */}
      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/[0.06] bg-[#060a14]">
        {/* Scanline overlay for that mission control feel */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />
        {/* Corner decorations */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          <span className="text-[8px] font-mono text-zinc-600 tracking-wider">AGENT NETWORK</span>
        </div>
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <span className="text-[8px] font-mono text-zinc-600 tracking-wider">
            {networkNodes.length} NODE{networkNodes.length !== 1 ? 'S' : ''} ACTIVE
          </span>
        </div>

        <AgentNetworkCanvas />

        {/* Node Popup (selected) */}
        <AnimatePresence>
          {selectedNodeId && (() => {
            const node = networkNodes.find(n => n.id === selectedNodeId);
            if (!node) return null;
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-3 left-3 z-20 max-w-xs p-3 rounded-xl bg-black/80 backdrop-blur-xl border border-white/[0.08]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color }} />
                  <span className="text-xs font-bold text-white">{node.name}</span>
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/10 text-zinc-400">
                    {node.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px]">{STATE_ICONS[node.state]}</span>
                  <span className="text-[10px] font-medium" style={{ color: getStateHex(node.state) }}>
                    {node.state}
                  </span>
                </div>
                {node.message && (
                  <p className="text-[10px] text-zinc-400 leading-relaxed">{node.message}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-white/[0.06]">
                  <span className="text-[9px] text-zinc-500">
                    {node.connections.length} connection{node.connections.length !== 1 ? 's' : ''}
                  </span>
                  {node.connections.length > 0 && (
                    <span className="text-[9px] text-zinc-600">
                      → {node.connections.slice(0, 3).map(id => {
                        const cn = networkNodes.find(n => n.id === id);
                        return cn ? cn.name : id;
                      }).join(', ')}{node.connections.length > 3 ? '...' : ''}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* ═══ BOTTOM: Stats + Activity Feed ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0 max-h-[45vh]">
        
        {/* ─── Left: Mission Stats ─── */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={<Waves className="w-3.5 h-3.5" />} label="Waves" value={waveCount} color="text-sky-400" />
            <StatCard icon={<Zap className="w-3.5 h-3.5" />} label="Decisions" value={totalDecisions} color="text-amber-400" />
            <StatCard icon={<TrendingUp className="w-3.5 h-3.5" />} label="Improved" value={totalImprovements} color="text-emerald-400" />
            <StatCard icon={<Shield className="w-3.5 h-3.5" />} label="Health" value={`${healthScore}%`} color={healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400'} />
            <StatCard icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Success" value={`${recentSuccessRate}%`} color="text-emerald-400" />
            <StatCard icon={<Brain className="w-3.5 h-3.5" />} label="This Wave" value={decisionCountThisWave} color="text-violet-400" />
          </div>

          {/* XP Bar */}
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300">LV {level} — {levelName}</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">{xp}/{xpToNext} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                animate={{ width: `${(xp / xpToNext) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Replay Button */}
          {latestWave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleReplay}
              disabled={isReplaying}
              className="h-8 text-[10px] gap-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.06] rounded-lg"
            >
              {isReplaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isReplaying ? 'Replaying...' : 'Replay Last Wave'}
            </Button>
          )}
        </div>

        {/* ─── Right: Activity Feed ─── */}
        <div className="lg:col-span-2 flex flex-col min-h-0 rounded-xl bg-black/50 border border-white/[0.06] overflow-hidden">
          {/* Feed header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-300 tracking-wide">ACTIVITY FEED</span>
              <span className="text-[9px] font-mono text-zinc-600">({activities.length})</span>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.04] overflow-x-auto">
            {ACTIVITY_FILTERS.map(f => (
              <button
                key={f.state}
                onClick={() => setActivityFilter(f.state)}
                className={`
                  flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wide
                  transition-all duration-200 shrink-0
                  ${activityFilter === f.state
                    ? 'bg-white/10 text-white border border-white/[0.15]'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-white/[0.06]'
                  }
                `}
              >
                <span>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Feed entries */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-px p-1">
              <AnimatePresence initial={false}>
                {filteredActivities.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-zinc-600 text-xs">
                    {isConnected ? 'Waiting for activity...' : 'Disconnected — reconnecting...'}
                  </div>
                ) : (
                  filteredActivities.slice(0, 50).map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`
                        flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors
                        ${Date.now() - entry.timestamp < 3000 ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}
                      `}
                    >
                      {/* State icon */}
                      <div
                        className="w-1 h-full min-h-[20px] rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: getStateHex(entry.state) }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{STATE_ICONS[entry.state]}</span>
                          <span className="text-[10px] text-zinc-300 truncate">{entry.message}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-zinc-600">{entry.timestampAR}</span>
                          {entry.phase && (
                            <span className="text-[8px] font-bold tracking-wider text-zinc-500 uppercase">
                              {entry.phase}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card Mini Component ──────────────────────────────────
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/[0.05]">
      <div className={cn(color, 'opacity-70')}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">{label}</div>
        <div className={cn('text-sm font-bold tabular-nums', color)}>{value}</div>
      </div>
    </div>
  );
}