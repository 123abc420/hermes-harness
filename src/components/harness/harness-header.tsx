'use client';

import { Zap, ArrowRight, CircleDot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHarnessStore, type Wave } from '@/store/harness-store';
import { StatusBadge } from './status-badge';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface HarnessHeaderProps {
  githubStatus?: { status: string; username: string | null; repoName: string | null };
  totalWaves?: number;
}

export function HarnessHeader({ githubStatus, totalWaves }: HarnessHeaderProps) {
  const { activeTab, setActiveTab } = useHarnessStore();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Zap },
    { id: 'spec', label: 'Spec', icon: CircleDot },
    { id: 'waves', label: 'Waves', icon: ArrowRight },
    { id: 'decisions', label: 'Decisions', icon: CircleDot },
    { id: 'skills', label: 'Skills', icon: CircleDot },
    { id: 'memory', label: 'Memory', icon: CircleDot },
    { id: 'github', label: 'GitHub', icon: CircleDot },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top banner */}
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
                HERMES HARNESS
              </h1>
              <p className="hidden text-[10px] uppercase tracking-widest text-zinc-500 sm:block">
                Self-Evolving Agent System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalWaves !== undefined && (
              <span className="text-xs tabular-nums text-zinc-500">
                {totalWaves} waves
              </span>
            )}
            {githubStatus && (
              <StatusBadge
                status={githubStatus.status === 'connected' ? 'connected' : 'disconnected'}
                label={githubStatus.status === 'connected' ? 'LINKED' : 'UNLINKED'}
                pulse={githubStatus.status === 'connected'}
              />
            )}
          </div>
        </div>
        {/* Tab bar */}
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Dashboard tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors sm:text-sm ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}