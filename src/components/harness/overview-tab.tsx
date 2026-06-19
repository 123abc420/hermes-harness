'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsGrid } from './stats-grid';
import { WaveTimeline } from './wave-timeline';
import { MetricsChart } from './metrics-chart';
import { ResearchCard } from './research-card';
import { StatusBadge } from './status-badge';
import { useDashboard, useSpec } from '@/hooks/use-harness-data';
import { Check, X, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const SPEC_CHECKLIST = [
  { label: 'Spec-Driven Architecture', section: 'Architecture' },
  { label: 'Wave Lifecycle Management', section: 'Wave Lifecycle' },
  { label: 'Decision Tracking System', section: 'Decision Categories' },
  { label: 'GitHub Sync Integration', section: 'GitHub' },
  { label: 'Guardrails & Safety', section: 'Guardrails' },
  { label: 'Metrics & Observability', section: 'Metrics Tracked' },
  { label: 'Dashboard Control Plane', section: 'Dashboard' },
  { label: 'Memory & Context System', section: 'Memory' },
];

export function OverviewTab() {
  const { data: dash, isLoading: dashLoading } = useDashboard();
  const { data: specData } = useSpec();

  const stats = dash?.totalStats;
  const waves = dash?.waves ?? [];
  const githubStatus = dash?.githubStatus;
  const recentDecisions = dash?.recentDecisions ?? [];

  // Check which spec sections might be "implemented" based on data presence
  const hasWaves = (stats?.totalWaves ?? 0) > 0;
  const hasDecisions = (stats?.totalDecisions ?? 0) > 0;
  const hasGithub = githubStatus?.status === 'connected';

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glow-emerald-sm border-white/10 bg-gradient-to-r from-emerald-500/[0.08] via-transparent to-amber-500/[0.05]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge
                status="active"
                label="HARNESS ACTIVE"
                pulse
                className="text-xs sm:text-sm"
              />
              <span className="text-xs text-zinc-500">
                {stats?.totalWaves ?? 0} waves executed
              </span>
              {githubStatus && (
                <StatusBadge
                  status={githubStatus.status === 'connected' ? 'connected' : 'disconnected'}
                  label={githubStatus.status === 'connected' ? 'GITHUB LINKED' : 'GITHUB UNLINKED'}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Two-column: Spec Compliance + Metrics Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spec Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Spec Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SPEC_CHECKLIST.map((item) => {
                const implemented =
                  (item.section === 'Wave Lifecycle' && hasWaves) ||
                  (item.section === 'Decision Categories' && hasDecisions) ||
                  (item.section === 'GitHub' && hasGithub) ||
                  (item.section === 'Metrics Tracked' && (dash?.metrics?.length ?? 0) > 0) ||
                  (item.section === 'Dashboard' && true) ||
                  (item.section === 'Architecture' && true) ||
                  (item.section === 'Guardrails & Safety' && true) ||
                  (item.section === 'Memory & Context System' && true);

                return (
                  <div key={item.label} className="flex items-center gap-2.5">
                    {implemented ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    )}
                    <span
                      className={`text-xs ${
                        implemented ? 'text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="ml-auto text-[10px] font-mono text-zinc-700">
                      {item.section}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <MetricsChart />
        </motion.div>
      </div>

      {/* Two-column: Recent Activity + Research */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {dashLoading ? (
            <Card className="border-white/10 bg-white/[0.03]">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <WaveTimeline waves={waves} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <ResearchCard />
        </motion.div>
      </div>
    </div>
  );
}