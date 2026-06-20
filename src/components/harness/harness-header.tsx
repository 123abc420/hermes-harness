'use client';

import { useState, useCallback } from 'react';
import { Zap, Eye, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAgentLiveStore } from '@/store/agent-live-store';

interface HealthBreakdown {
  spec: number;
  success: number;
  errors: number;
  github: number;
}

interface HarnessHeaderProps {
  githubStatus?: { status: string; username: string | null; repoName: string | null; lastSyncAt: string | null };
  totalWaves?: number;
  healthScore?: number;
  healthScoreTrend?: 'up' | 'down' | 'stable';
  healthBreakdown?: HealthBreakdown;
  onSearch?: () => void;
}

const STATE_COLORS_MAP: Record<string, string> = {
  idle: '#f59e0b', thinking: '#06b6d4', searching: '#fb923c',
  planning: '#c084fc', executing: '#f43f5e', verifying: '#34d399',
  celebrating: '#fde047', error: '#f87171', evolving: '#e879f9', offline: '#71717a',
};

const HEALTH_COLOR = (score: number) => {
  if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
  if (score >= 50) return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
  return 'text-red-400 border-red-500/20 bg-red-500/10';
};

const BREAKDOWN_ITEMS: { key: keyof HealthBreakdown; label: string; max: number; color: string }[] = [
  { key: 'spec', label: 'Spec', max: 40, color: 'bg-violet-400' },
  { key: 'success', label: 'Success', max: 30, color: 'bg-emerald-400' },
  { key: 'errors', label: 'Errors', max: 20, color: 'bg-rose-400' },
  { key: 'github', label: 'GitHub', max: 10, color: 'bg-sky-400' },
];

export function HarnessHeader({ githubStatus, totalWaves, healthScore, healthScoreTrend, healthBreakdown, onSearch }: HarnessHeaderProps) {
  const [healthOpen, setHealthOpen] = useState(false);
  const isConnected = githubStatus?.status === 'connected';
  const agentState = useAgentLiveStore(s => s.agentState);
  const isLiveConnected = useAgentLiveStore(s => s.isConnected);
  const stateColor = STATE_COLORS_MAP[agentState] || '#f59e0b';

  return (
    <header className="sticky top-0 z-50 border-b border-amber-900/[0.12] bg-[#0d0906]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {/* State color dot */}
            <div
              className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-[#0d0906] transition-colors duration-700"
              style={{
                backgroundColor: stateColor,
                boxShadow: `0 0 8px ${stateColor}`,
              }}
            />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-amber-50 sm:text-base">
              HERMES HARNESS
            </h1>
            <p className="hidden text-[10px] uppercase tracking-[0.15em] text-amber-800/50 sm:block font-mono">
              Self-Evolving Agent System
            </p>
          </div>
        </motion.div>

        {/* Search trigger */}
        {onSearch && (
          <button
            onClick={onSearch}
            aria-label="Open command palette (Cmd+K)"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <Search className="h-3 w-3" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex items-center justify-center h-4 px-1 rounded text-[9px] font-mono text-zinc-600 bg-white/[0.04] border border-white/[0.06]">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Right status indicators */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          {/* Agent live status */}
          <div className="flex items-center gap-1.5">
            {isLiveConnected ? (
              <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </span>
                <span className="text-[9px] font-mono text-amber-400 font-medium">LIVE</span>
                <Eye className="h-2.5 w-2.5 text-amber-400/60" />
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full border border-zinc-700/30 bg-zinc-800/20 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                <span className="text-[9px] font-mono text-zinc-600">OFFLINE</span>
              </div>
            )}
          </div>

          {totalWaves !== undefined && (
            <span className="hidden sm:inline text-xs tabular-nums text-amber-700/60 font-mono">
              {totalWaves} waves
            </span>
          )}
          {healthScore !== undefined && (
            <div className="relative hidden md:block">
              <button
                type="button"
                aria-label={`Health score: ${healthScore}/100. Press to show breakdown.`}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium tabular-nums ${HEALTH_COLOR(healthScore)} hover:brightness-125 transition-all focus-visible:outline-2 focus-visible:outline-amber-400/50 focus-visible:outline-offset-1`}
                onMouseEnter={() => setHealthOpen(true)}
                onMouseLeave={() => setHealthOpen(false)}
                onFocus={() => setHealthOpen(true)}
                onBlur={() => setHealthOpen(false)}
              >
                <span>{healthScore}</span>
                <span className="text-[8px] opacity-50">/100</span>
                {healthScoreTrend === 'up' && <span className="text-[8px]">↑</span>}
                {healthScoreTrend === 'down' && <span className="text-[8px]">↓</span>}
              </button>
              {/* Health breakdown tooltip — visible on hover and focus */}
              {healthBreakdown && (
                <div
                  role="tooltip"
                  className={`absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/[0.08] bg-[#1a1510] p-3 shadow-2xl transition-all duration-150 z-50 ${healthOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                >
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2.5">Health Breakdown</p>
                  <div className="space-y-2">
                    {BREAKDOWN_ITEMS.map(({ key, label, max, color }) => {
                      const val = healthBreakdown[key];
                      const pct = Math.round((val / max) * 100);
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400">{label}</span>
                            <span className="text-[10px] font-mono tabular-nums text-zinc-300">{val}<span className="text-zinc-600">/{max}</span></span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                            <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {githubStatus && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-900/[0.15] px-2.5 py-1 text-[10px] font-mono font-medium tracking-wider">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected
                    ? 'animate-pulse bg-amber-400'
                    : 'bg-zinc-500'
                }`}
              />
              <span
                className={
                  isConnected
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }
              >
                {isConnected ? 'LINKED' : 'UNLINKED'}
              </span>
              {isConnected && githubStatus.lastSyncAt && (
                <span className="flex items-center gap-1 text-[9px] text-amber-500/40 font-mono">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDistanceToNow(new Date(githubStatus.lastSyncAt), { addSuffix: true })}
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}