'use client';

import { Zap, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAgentLiveStore } from '@/store/agent-live-store';

interface HarnessHeaderProps {
  githubStatus?: { status: string; username: string | null; repoName: string | null };
  totalWaves?: number;
}

const STATE_COLORS_MAP: Record<string, string> = {
  idle: '#f59e0b', thinking: '#06b6d4', searching: '#fb923c',
  planning: '#c084fc', executing: '#f43f5e', verifying: '#34d399',
  celebrating: '#fde047', error: '#f87171', evolving: '#e879f9', offline: '#71717a',
};

export function HarnessHeader({ githubStatus, totalWaves }: HarnessHeaderProps) {
  const isConnected = githubStatus?.status === 'connected';
  const { agentState, isConnected: isLiveConnected } = useAgentLiveStore();
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
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}