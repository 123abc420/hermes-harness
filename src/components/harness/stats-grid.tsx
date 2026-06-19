'use client';

import { type LucideIcon, Activity, Brain, TrendingUp, GitBranch } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

function StatCard({ label, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                {value ?? 0}
              </p>
            </div>
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                color
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatsGridProps {
  stats?: {
    totalWaves: number;
    totalDecisions: number;
    totalImprovements: number;
    githubCommits: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-3 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items: StatCardProps[] = [
    { label: 'Total Waves', value: stats.totalWaves, icon: Activity, color: 'bg-emerald-500/15 text-emerald-400' },
    { label: 'Decisions', value: stats.totalDecisions, icon: Brain, color: 'bg-amber-500/15 text-amber-400' },
    { label: 'Improvements', value: stats.totalImprovements, icon: TrendingUp, color: 'bg-teal-500/15 text-teal-400' },
    { label: 'GitHub Commits', value: stats.githubCommits, icon: GitBranch, color: 'bg-orange-500/15 text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <StatCard key={item.label} {...item} delay={i * 0.08} />
      ))}
    </div>
  );
}