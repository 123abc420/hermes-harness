'use client';

import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentLiveStore, type LiveActivityEntry, type AgentVisualState } from '@/store/agent-live-store';
import { useWaves, useDecisions } from '@/hooks/use-harness-data';
import { useWaveReplay } from '@/hooks/use-wave-replay';
import { useNextWaveCountdown } from '@/hooks/use-next-wave-countdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  WifiOff, Zap, Brain, TrendingUp, Waves, Shield, Sparkles,
  CheckCircle2, FileCode2, Play, Pause, Activity, Terminal,
  Network, X, Clock, Filter,
} from 'lucide-react';
import { HERMES_VERSION, getStateHex } from '@/lib/constants';
import { CATEGORY_TW } from '@/lib/category-colors';
import { AgentNetworkCanvas } from './agent-network-canvas';
import { PhaseTracker, STATE_COLORS, STATE_ICONS } from './agent-live-subcomponents';

// ─── State filter options for activity feed (W235) ─────────────
const ACTIVITY_FILTERS: Array<{ state: AgentVisualState | 'all'; label: string; icon: string }> = [
  { state: 'all', label: 'All', icon: '•' },
  { state: 'thinking', label: 'Think', icon: '🧠' },
  { state: 'executing', label: 'Exec', icon: '⚡' },
  { state: 'planning', label: 'Plan', icon: '📋' },
  { state: 'verifying', label: 'Verify', icon: '✅' },
  { state: 'celebrating', label: 'Done', icon: '🎉' },
  { state: 'error', label: 'Error', icon: '💥' },
];

// State → hex color (single source of truth from constants.ts)
const getStateRgb = getStateHex;

// ─── Activity Entry (W237: left accent stripe + new-item glow flash, memoized) ─
const ActivityEntry = memo(function ActivityEntry({ entry, isNew }: { entry: LiveActivityEntry; isNew: boolean }) {
  const stateRgb = getStateRgb(entry.state);
  const ageMs = Date.now() - entry.timestamp;
  const isVeryNew = ageMs < 3000;
  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -12 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.03] transition-all duration-500 group ${
        isVeryNew ? 'bg-white/[0.04]' : ''
      }`}
      style={isVeryNew ? {
        borderLeft: `2px solid ${stateRgb}60`,
        boxShadow: `inset 3px 0 8px -3px ${stateRgb}20`,
      } : undefined}
    >
      {/* Left accent stripe */}
      <div
        className={`w-[2px] rounded-full shrink-0 mt-0.5 transition-opacity ${isVeryNew ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}
        style={{ backgroundColor: getStateRgb(entry.state), height: '28px' }}
      />
      <span className="text-sm mt-0.5 shrink-0">{STATE_ICONS[entry.state] || '•'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] leading-relaxed break-all ${isVeryNew ? 'text-white' : 'text-zinc-200'}`}>{entry.message}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-zinc-600 font-mono">{entry.timestampAR || '—'}</span>
          {entry.phase && (
            <span className="text-[9px] text-zinc-600 font-mono uppercase bg-white/[0.04] px-1.5 py-0.5 rounded">
              {entry.phase}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// ─── Node Popup (W235: color accent top bar, glow shadow, memoized) ───────
const NodePopup = memo(function NodePopup() {
  const { selectedNodeId, networkNodes, selectNode } = useAgentLiveStore();
  const node = networkNodes.find(n => n.id === selectedNodeId);

  if (!node) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-4 left-4 z-20 w-72 rounded-xl bg-black/75 backdrop-blur-2xl overflow-hidden"
      style={{
        border: `1px solid ${node.color}20`,
        boxShadow: `0 0 30px ${node.color}15, 0 20px 60px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Top accent bar matching node color */}
      <div className="h-[2px]" style={{ backgroundColor: node.color }} />

      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: node.color, boxShadow: `0 0 12px ${node.color}80` }}
          />
          <span className="text-sm font-semibold text-white font-mono">{node.name}</span>
          <Badge variant="outline" className={`${STATE_COLORS[node.state]} text-[9px] px-1.5 py-0`}>
            {STATE_ICONS[node.state]} {node.state}
          </Badge>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="p-1.5 rounded-md hover:bg-white/[0.08] transition-colors"
        >
          <X className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Type</span>
            <p className="text-xs text-zinc-300 mt-0.5 font-mono">{node.type}</p>
          </div>
          <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Size</span>
            <p className="text-xs text-zinc-300 mt-0.5 font-mono">{node.size.toFixed(1)}x</p>
          </div>
          <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Glow</span>
            <p className="text-xs text-zinc-300 mt-0.5 font-mono">{node.glowIntensity.toFixed(1)}</p>
          </div>
        </div>
        <div>
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Current Task</span>
          <p className="text-xs text-zinc-200 mt-0.5 leading-relaxed">{node.message || 'Idle'}</p>
        </div>
        {node.connections.length > 0 && (
          <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Connected To</span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {node.connections.map(cId => {
                const connected = networkNodes.find(n => n.id === cId);
                return (
                  <span
                    key={cId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: connected?.color || '#666', boxShadow: `0 0 6px ${connected?.color || '#666'}` }}
                    />
                    <span className="text-[9px] font-mono text-zinc-300">{connected?.name || cId}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-mono pt-1">
          <Clock className="h-2.5 w-2.5" />
          <span>Spawned {new Date(node.spawnTime).toLocaleTimeString('es-AR')}</span>
        </div>
      </div>
    </motion.div>
  );
});

// ─── Wave Overview Bar (W235: gradient glow on progress) ───────
function WaveOverviewBar() {
  const { waveNumber, progress, phase } = useAgentLiveStore();

  if (waveNumber === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur-xl border border-white/[0.08]">
      <div className="flex items-center gap-2">
        <Waves className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-mono text-amber-300 font-bold tracking-wide">WAVE {waveNumber}</span>
      </div>
      <div className="flex-1 h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
            boxShadow: '0 0 8px rgba(245,158,11,0.4)',
          }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-mono text-zinc-400 tabular-nums min-w-[30px] text-right">
        {Math.round(progress * 100)}%
      </span>
      {phase && (
        <Badge variant="outline" className="text-[9px] px-2.5 py-0.5 text-cyan-300 border-cyan-500/20 bg-cyan-500/10 font-medium">
          {phase.toUpperCase()}
        </Badge>
      )}
    </div>
  );
}

// ─── Stat Chip (W235: shared glassmorphism wrapper) ─────────────
function StatChip({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/45 backdrop-blur-xl border border-white/[0.07] hover:border-white/[0.12] transition-colors"
    >
      {children}
    </motion.div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────
export function AgentLivePanel() {
  const {
    agentState, message, phase, waveNumber, progress, isConnected,
    waveCount, totalImprovements, totalDecisions, decisionCountThisWave,
    healthScore, healthScoreTrend, level, levelName, xp, xpToNext,
    activities, subAgents, networkNodes, selectedNodeId,
  } = useAgentLiveStore();

  const { isReplaying, lastTurnActivities, toggleReplay } = useWaveReplay();
  const { data: latestWavesData, isError: wavesError } = useWaves(1, 1);
  const latestWave = latestWavesData?.waves?.[0] ?? null;
  const { data: recentDecisionsData, isError: decisionsError } = useDecisions(1, 3);
  const recentDecisions = recentDecisionsData?.decisions ?? [];
  const countdownMin = useNextWaveCountdown(waveNumber, latestWave);

  // W235: Activity feed state filter
  const [activeFilter, setActiveFilter] = useState<AgentVisualState | 'all'>('all');
  const [showFilter, setShowFilter] = useState(false);

  const filteredActivities = useMemo(() => {
    const list = isReplaying ? activities.slice(0, 30) : activities;
    if (activeFilter === 'all') return list;
    return list.filter(a => a.state === activeFilter);
  }, [activities, activeFilter, isReplaying]);

  // Count per state for filter badges
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of activities) {
      counts[a.state] = (counts[a.state] || 0) + 1;
    }
    return counts;
  }, [activities]);

  const xpPercent = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="flex flex-col lg:flex-row gap-0 -mx-4 -mt-1 sm:-mx-6 sm:-mt-2">
      {/* ═══ LEFT: NETWORK CANVAS + HUD OVERLAYS ═══ */}
      <div className="relative flex-1 lg:flex-[3] min-h-[55vh] lg:min-h-0 lg:h-[calc(100vh-220px)] overflow-hidden rounded-none lg:rounded-l-xl">
        <div className="absolute inset-0">
          <AgentNetworkCanvas />
        </div>

        {/* ── HUD: Top Bar ── */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-amber-500/25">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span className="text-xs font-mono text-amber-300 font-semibold tracking-wider">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-zinc-700/30">
                <WifiOff className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs font-mono text-zinc-500 font-medium">OFFLINE</span>
              </div>
            )}

            <motion.div
              animate={{
                boxShadow: [
                  `0 0 8px ${getStateRgb(agentState)}25, 0 0 16px ${getStateRgb(agentState)}10`,
                  `0 0 14px ${getStateRgb(agentState)}45, 0 0 28px ${getStateRgb(agentState)}20`,
                  `0 0 8px ${getStateRgb(agentState)}25, 0 0 16px ${getStateRgb(agentState)}10`,
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-lg"
            >
              <Badge
                variant="outline"
                className={`${STATE_COLORS[agentState]} text-xs px-3 py-1.5 font-semibold backdrop-blur-xl bg-black/40 border-opacity-50`}
              >
                {STATE_ICONS[agentState]} {agentState.toUpperCase()}
              </Badge>
            </motion.div>

            {networkNodes.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xl border border-white/[0.07]">
                <Network className="h-3 w-3 text-cyan-400/70" />
                <span className="text-[10px] font-mono text-zinc-300">{networkNodes.length} nodes</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/[0.07]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-mono text-amber-300 font-bold">LV.{level}</span>
              <span className="hidden sm:inline text-[10px] font-mono text-zinc-400">{levelName}</span>
            </div>
          </div>
        </div>

        {/* ── HUD: Wave Overview Bar ── */}
        {waveNumber > 0 && (
          <div className="absolute top-14 sm:top-16 left-4 right-4 sm:left-6 sm:right-6 z-10">
            <WaveOverviewBar />
          </div>
        )}

        <AnimatePresence>
          {selectedNodeId && <NodePopup />}
        </AnimatePresence>

        {/* ── HUD: Phase Tracker ── */}
        {waveNumber > 0 && (
          <div className="absolute bottom-[76px] sm:bottom-[84px] left-1/2 -translate-x-1/2 z-10">
            <PhaseTracker phase={phase} progress={progress} />
          </div>
        )}

        {/* W237: Canvas bottom-left overlay — Wave number + active agent count */}
        <div className="absolute bottom-[76px] sm:bottom-[84px] left-4 sm:left-6 z-10 pointer-events-none">
          {waveNumber > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1"
            >
              <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">Wave</p>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-white/[0.12] tabular-nums leading-none">
                {String(waveNumber).padStart(3, '0')}
              </p>
            </motion.div>
          )}
          <div className="mt-2">
            <p className={`text-[9px] font-mono tracking-wider uppercase ${
              networkNodes.length > 1 ? 'text-cyan-500/50' : 'text-zinc-700'
            }`}>
              {networkNodes.length > 1 ? `${networkNodes.length - 1} agents active` : 'standby'}
            </p>
          </div>
        </div>

        {/* ── HUD: Bottom Bar ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Message bar */}
          <div className="px-4 sm:px-6 pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, type: 'spring', damping: 30 }}
                className="px-4 py-2.5 rounded-xl bg-black/55 backdrop-blur-xl border border-white/[0.08] max-w-xl"
              >
                <p className="text-sm text-zinc-200 italic leading-relaxed truncate">
                  &ldquo;{message}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* W235: Glassmorphism stats strip with stagger animation */}
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {healthScore >= 0 && (
                <StatChip index={0}>
                  <Shield className="h-3 w-3 text-zinc-500" />
                  <div className="w-14 h-1.5 rounded-full bg-white/[0.08] overflow-hidden relative">
                    <motion.div
                      className={`h-full rounded-full ${
                        healthScore >= 90 ? 'bg-emerald-500/80' :
                        healthScore >= 70 ? 'bg-amber-500/80' : 'bg-red-500/80'
                      }`}
                      initial={false}
                      animate={{ width: `${healthScore}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ x: ['-100%', '250%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)' }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono font-bold tabular-nums ${
                    healthScore >= 90 ? 'text-emerald-400' :
                    healthScore >= 70 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {healthScoreTrend === 'up' && <span className="text-[8px]">&#9650;</span>}
                    {healthScoreTrend === 'down' && <span className="text-[8px] opacity-70">&#9660;</span>}
                    {healthScore}
                  </span>
                </StatChip>
              )}

              <StatChip index={1}>
                <Zap className="h-3 w-3 text-amber-500/60" />
                <div className="w-12 h-1.5 rounded-full bg-white/[0.08] overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full bg-amber-500/70"
                    initial={false}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ x: ['-100%', '250%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)' }}
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 tabular-nums">{xp}/{xpToNext}</span>
              </StatChip>

              <StatChip index={2}>
                <Waves className="h-3 w-3 text-cyan-500/60" />
                <span className="text-[10px] font-mono text-zinc-300 font-bold tabular-nums">{waveCount}</span>
                <span className="text-[10px] font-mono text-zinc-600 hidden sm:inline">waves</span>
              </StatChip>

              <StatChip index={3}>
                <TrendingUp className="h-3 w-3 text-emerald-500/60" />
                <span className="text-[10px] font-mono text-zinc-300 font-bold tabular-nums">{totalImprovements}</span>
              </StatChip>

              <StatChip index={4}>
                <Brain className="h-3 w-3 text-violet-500/60" />
                <span className="text-[10px] font-mono text-zinc-300 font-bold tabular-nums">{totalDecisions}</span>
                {decisionCountThisWave > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[9px] font-mono text-violet-400 font-bold"
                  >
                    +{decisionCountThisWave}
                  </motion.span>
                )}
              </StatChip>

              {waveNumber === 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500/30 animate-ping" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {countdownMin !== null ? `Next wave ~${countdownMin}m` : 'Awaiting wave'}
                  </span>
                </div>
              )}

              {subAgents.length > 0 && (
                <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                  {subAgents.map(sa => (
                    <motion.div
                      key={sa.id}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xl border border-white/[0.07]"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sa.color, boxShadow: `0 0 8px ${sa.color}` }} />
                      <span className="text-[9px] font-mono text-zinc-300">{sa.name}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Activity Feed + Details ═══ */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col border-l border-white/[0.06] bg-white/[0.015] backdrop-blur-sm rounded-none lg:rounded-r-xl">
        {/* Feed header with W235 filter toggle */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-zinc-200">Activity</span>
            <span className="text-xs text-zinc-500 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
              {filteredActivities.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* W235: Filter toggle */}
            <button
              onClick={() => setShowFilter(f => !f)}
              className={`p-1.5 rounded-md transition-colors ${
                showFilter ? 'bg-white/[0.08] text-zinc-300' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]'
              }`}
              aria-label="Toggle activity filter"
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
            {isConnected && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            )}
            {lastTurnActivities.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleReplay}
                className={`h-7 px-2 text-xs gap-1 ${
                  isReplaying
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                {isReplaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span className="font-mono text-[10px]">REPLAY</span>
              </Button>
            )}
          </div>
        </div>

        {/* W235: Filter pills row */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-white/[0.04]"
            >
              <div className="px-3 py-2 flex flex-wrap gap-1.5">
                {ACTIVITY_FILTERS.map(f => {
                  const count = f.state === 'all' ? activities.length : (stateCounts[f.state] || 0);
                  const isActive = activeFilter === f.state;
                  return (
                    <button
                      key={f.state}
                      onClick={() => setActiveFilter(f.state)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono transition-all ${
                        isActive
                          ? 'bg-white/[0.1] text-white border border-white/[0.15]'
                          : 'bg-white/[0.03] text-zinc-500 border border-transparent hover:text-zinc-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="relative flex h-2 w-2 shrink-0">
                        {isActive && f.state !== 'all' && (
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
                            style={{ backgroundColor: getStateRgb(f.state) }}
                          />
                        )}
                        <span
                          className="relative inline-flex rounded-full h-2 w-2"
                          style={{ backgroundColor: f.state === 'all' ? '#71717a' : getStateRgb(f.state) }}
                        />
                      </span>
                      <span>{f.label}</span>
                      {count > 0 && (
                        <span className={`text-[9px] ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed list */}
        <ScrollArea className="flex-1 h-[250px] sm:h-[350px] lg:h-auto">
          <div className="p-2 space-y-0.5" role="list" aria-label="Agent activity feed">
            <AnimatePresence initial={false}>
              {filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Network className="h-12 w-12 text-zinc-800 mb-4" />
                  </motion.div>
                  <p className="text-sm text-zinc-500 mb-1">
                    {activeFilter !== 'all' ? `No ${activeFilter} activities` : 'Network waiting for agents...'}
                  </p>
                  <p className="text-xs text-zinc-600 max-w-[260px]">
                    {activeFilter !== 'all'
                      ? 'Try a different filter or wait for new events'
                      : 'Nodes appear and connect when the agent executes evolution waves'}
                  </p>
                  {activeFilter !== 'all' && (
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="mt-3 text-[10px] font-mono text-amber-400/60 hover:text-amber-400 transition-colors"
                    >
                      Show all activities
                    </button>
                  )}
                </div>
              ) : (
                filteredActivities.map((entry, i) => (
                  <ActivityEntry key={entry.id} entry={entry} isNew={i === 0 && activeFilter === 'all'} />
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Bottom details */}
        <div className="border-t border-white/[0.06] shrink-0">
          {wavesError ? (
            <div className="px-4 py-3 flex items-center gap-2">
              <WifiOff className="h-3.5 w-3.5 text-red-400/70 shrink-0" />
              <span className="text-[11px] text-red-400/70 font-mono">Unable to load wave data</span>
            </div>
          ) : latestWave ? (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono text-zinc-400 tracking-wider">LAST WAVE</span>
                <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0 text-emerald-400/70 border-emerald-500/20">
                  #{latestWave.waveNumber}
                </Badge>
              </div>
              {latestWave.summary && (
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{latestWave.summary}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-zinc-500 font-mono">
                <span>{latestWave.decisionsCount} decisions</span>
                <span className="text-zinc-700">|</span>
                <span>{latestWave.improvementsCount} improvements</span>
                {latestWave.errorsCount > 0 && (
                  <>
                    <span className="text-zinc-700">|</span>
                    <span className="text-red-400/70">{latestWave.errorsCount} errors</span>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {!decisionsError && recentDecisions.length > 0 && (
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[11px] font-mono text-zinc-400 tracking-wider">RECENT DECISIONS</span>
              </div>
              <div className="space-y-1.5">
                {recentDecisions.map((d) => (
                  <div key={d.id} className="flex items-start gap-2">
                    <span className={`mt-0.5 shrink-0 inline-flex rounded px-1 py-0.5 text-[8px] font-mono font-medium ${
                      CATEGORY_TW[d.category] ?? 'bg-violet-500/10 text-violet-400'
                    }`}>
                      {d.category.replace('_', ' ')}
                    </span>
                    <p className="min-w-0 text-[11px] text-zinc-400 leading-relaxed line-clamp-1 flex-1">{d.description}</p>
                    {d.targetFile && (
                      <FileCode2 className="h-3 w-3 shrink-0 text-zinc-600 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3 text-amber-500/30" />
              <span className="text-[10px] font-mono text-zinc-600">HERMES {HERMES_VERSION}</span>
            </div>
            <span className="text-[10px] text-zinc-700 font-mono">SPEC-DRIVEN</span>
          </div>
        </div>
      </div>
    </div>
  );
}