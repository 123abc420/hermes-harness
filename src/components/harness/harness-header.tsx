'use client';

import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface HarnessHeaderProps {
  githubStatus?: { status: string; username: string | null; repoName: string | null };
  totalWaves?: number;
}

export function HarnessHeader({ githubStatus, totalWaves }: HarnessHeaderProps) {
  const isConnected = githubStatus?.status === 'connected';

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050a0e]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
              HERMES HARNESS
            </h1>
            <p className="hidden text-[10px] uppercase tracking-[0.15em] text-zinc-600 sm:block">
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
          {totalWaves !== undefined && (
            <span className="text-xs tabular-nums text-zinc-500">
              {totalWaves} waves
            </span>
          )}
          {githubStatus && (
            <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium tracking-wider">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected
                    ? 'animate-pulse bg-emerald-400'
                    : 'bg-zinc-500'
                }`}
              />
              <span
                className={
                  isConnected
                    ? 'text-emerald-400'
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