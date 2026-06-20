'use client';

import { useHarnessDashboard } from '@/hooks/use-harness-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { MemorySection } from './memory-section';
import { SkillsSection } from './skills-section';
import { DecisionDistribution, OutcomeDistribution } from './distribution-charts';
import { WaveCategoryBreakdown } from './wave-category-breakdown';
import { DecisionTimeline } from './decision-timeline';
import { ErrorBlock } from './error-block';
import { AnimatedSection } from './animated-section';

/* ── Analytics Tab ─────────────────────────────────────── */
export function ResearchTab() {
  const { data: dash, isLoading, isError, error, refetch } = useHarnessDashboard();

  if (isError && !isLoading) {
    return <ErrorBlock message={error?.message} onRetry={() => refetch()} />;
  }

  if (isLoading || !dash) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-36" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedSection delay={0.05}>
        <MemorySection />
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedSection delay={0.1}>
          <SkillsSection />
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <DecisionDistribution recentDecisions={dash?.recentDecisions} />
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.2}>
        <OutcomeDistribution recentDecisions={dash?.recentDecisions} />
      </AnimatedSection>

      <AnimatedSection delay={0.25}>
        <WaveCategoryBreakdown waves={dash?.waves} decisions={dash?.recentDecisions} />
      </AnimatedSection>

      <AnimatedSection delay={0.3}>
        <DecisionTimeline decisions={dash?.recentDecisions} />
      </AnimatedSection>
    </div>
  );
}