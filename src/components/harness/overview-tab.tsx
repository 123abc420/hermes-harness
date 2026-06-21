'use client';

import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import { AlertTriangle, ChevronDown, Activity } from 'lucide-react';
import { HeroStatusCard } from './hero-status-card';
import { QuickMetricsChart } from './quick-metrics-chart';
import { WaveDurationBars } from './wave-duration-bars';
import { SpecComplianceCard } from './spec-compliance-card';
import { MilestonesTimeline } from './milestones-timeline';
import { StatsGrid } from './stats-grid';
import { MiniWaveTimeline } from './mini-wave-timeline';
import { ErrorTrendChart } from './error-trend-chart';
import { RecentCommitsCard } from './recent-commits-card';
import { WaveComparisonCard } from './wave-comparison-card';
import { CategoryTrendsChart } from './category-trends-chart';
import { AnimatedSection } from './animated-section';
import { ActivityHeatmap } from './activity-heatmap';
import { isErrorsTrendingDown } from '@/lib/constants';

/* ── Collapsible section header ────────────────────────── */
function SectionHeader({
  title,
  icon: Icon,
  collapsed,
  onToggle,
  sectionId,
}: {
  title: string;
  icon: React.ElementType;
  collapsed: boolean;
  onToggle: () => void;
  sectionId: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 group w-full text-left mb-3"
      aria-expanded={!collapsed}
      aria-controls={sectionId}
    >
      <Icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-amber-400/70 transition-colors" />
      <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
        {title}
      </span>
      <ChevronDown
        className={cn('h-3 w-3 text-zinc-600 ml-auto transition-transform duration-200', !collapsed && 'rotate-180')}
      />
    </button>
  );
}

/* ── Overview Tab ─────────────────────────────────────── */
export function OverviewTab() {
  const { data: dash, isLoading, isError, refetch } = useHarnessDashboard();
  const [activityCollapsed, setActivityCollapsed] = useState(false);

  const stats = dash?.totalStats;
  const waves = dash?.waves ?? [];
  const githubStatus = dash?.githubStatus;
  const firstWave = waves.length > 0 ? waves[waves.length - 1] : undefined;
  const recentCommits = githubStatus?.recentCommits;

  // Memoize expensive derived values to avoid recompute on every render
  const isErrorsDecreasing = useMemo(
    () => isErrorsTrendingDown(dash?.errorTrend ?? []),
    [dash?.errorTrend],
  );
  const waveVelocity = useMemo(() => {
    if (waves.length < 2 || !firstWave?.startedAt || !waves[0]?.startedAt) return null;
    const ms = (new Date(waves[0].startedAt).getTime() - new Date(firstWave.startedAt).getTime()) / 3_600_000;
    return ms > 0 ? (waves.length / ms).toFixed(1) : null;
  }, [waves, firstWave, waves[0]]);

  // Compute dynamic error trend for spec compliance (already memoized above)

  // Extract npm_dependencies from metrics
  const npmDep = dash?.metrics?.find(m => m.metricKey === 'npm_dependencies');

  return (
    <div className="space-y-6">
      {isError && !isLoading && (
        <Card className="border-red-500/10 bg-red-500/[0.03]">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400/70 shrink-0" />
            <span className="min-w-0 flex-1 text-sm text-red-400/80">Failed to load dashboard data</span>
            <button onClick={() => refetch()} aria-label="Retry loading dashboard" className="text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
              Retry
            </button>
          </CardContent>
        </Card>
      )}

      {/* Hero Status Card */}
      <HeroStatusCard stats={stats} githubStatus={githubStatus} latestWave={waves[0]} firstWaveStart={firstWave?.startedAt} waveVelocity={waveVelocity} npmDeps={npmDep?.metricValue} healthScore={dash?.healthScore} healthScoreTrend={dash?.healthScoreTrend} healthBreakdown={dash?.healthBreakdown} isLoading={isLoading} waves={waves} />

      {/* Stats Grid */}
      <StatsGrid stats={stats} metrics={dash?.metrics} waves={waves} />

      {/* Wave Comparison — auto-compares 2 most recent completed waves */}
      <AnimatedSection delay={0.18}>
        {!isLoading && waves.length >= 2 ? (
          <WaveComparisonCard waves={waves} />
        ) : !isLoading ? null : (
          <Card className="glass-card"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.04]" /><div className="space-y-2"><div className="h-4 w-40 animate-pulse rounded bg-white/[0.04]" /><div className="h-3 w-60 animate-pulse rounded bg-white/[0.03]" /></div></div></CardContent></Card>
        )}
      </AnimatedSection>

      {/* Activity Heatmap — GitHub-style 12-week grid */}
      <AnimatedSection delay={0.16}>
        {!isLoading && waves.length > 0 ? (
          <ActivityHeatmap waves={waves} />
        ) : !isLoading ? null : (
          <Card className="glass-card shimmer-card"><CardContent className="p-6"><div className="h-24 w-full rounded bg-white/[0.03] animate-pulse" /></CardContent></Card>
        )}
      </AnimatedSection>

      {/* Four-column: Spec Compliance + Quick Metrics + Error Trend + Recent Commits */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <AnimatedSection delay={0.2}>
          <SpecComplianceCard skillsCount={dash?.skillsCount} errorTrendDecreasing={isErrorsDecreasing} />
        </AnimatedSection>

        <AnimatedSection delay={0.25}>
          <QuickMetricsChart metrics={dash?.metrics} isLoading={isLoading} />
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <ErrorTrendChart errorTrend={dash?.errorTrend} />
        </AnimatedSection>

        <AnimatedSection delay={0.35}>
          {isLoading ? (
            <Card className="glass-card">
              <div className="p-4">
                <Skeleton className="mb-3 h-4 w-28" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <RecentCommitsCard commits={recentCommits} />
          )}
        </AnimatedSection>
      </div>

      {/* Evolution Milestones */}
      <AnimatedSection delay={0.35}>
        {isLoading ? (
          <Card className="glass-card">
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-36" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <MilestonesTimeline waves={waves} totalWaves={stats?.totalWaves ?? 0} skillsCount={dash?.skillsCount} />
        )}
      </AnimatedSection>

      {/* Category Trends */}
      <AnimatedSection delay={0.38}>
        <CategoryTrendsChart />
      </AnimatedSection>

      {/* Activity & Health — collapsible section */}
      <AnimatedSection delay={0.42}>
        <SectionHeader
          title="Activity & Health"
          icon={Activity}
          collapsed={activityCollapsed}
          onToggle={() => setActivityCollapsed(v => !v)}
          sectionId="overview-activity-health"
        />
        {!activityCollapsed && (
          <div id="overview-activity-health" className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {isLoading ? (
              <Card className="glass-card">
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-3 w-8 rounded" />
                      <Skeleton className="h-3 flex-1 rounded-full" />
                      <Skeleton className="h-3 w-10 rounded" />
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <WaveDurationBars waves={waves} />
            )}

            {isLoading ? (
              <Card className="glass-card">
                <div className="p-4 space-y-4">
                  <Skeleton className="h-4 w-28" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <MiniWaveTimeline waves={waves} />
            )}

          </div>
        )}
      </AnimatedSection>
    </div>
  );
}