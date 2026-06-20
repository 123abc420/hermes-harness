'use client';

import {
  useGithubStatus,
  useHarnessDashboard,
} from '@/hooks/use-harness-data';
import type { ExportModule } from '@/store/harness-store';
import { ConnectionStatus, InfoGrid, CommitHistory, ExportModules } from './github-subcomponents';
import { AnimatedSection } from './animated-section';

/* ── GitHub Tab ──────────────────────────────────────── */
export function GithubTab() {
  const { data: dash } = useHarnessDashboard();
  const { data: github, isLoading, isError, error, refetch } = useGithubStatus();
  const githubStatus = dash?.githubStatus ?? github;
  const modules = (dash?.exports ?? []) as ExportModule[];

  return (
    <div className="space-y-6">
      <AnimatedSection variant="header">
        <ConnectionStatus
          githubStatus={githubStatus}
          isLoading={isLoading}
          isError={isError}
          error={error}
          refetch={refetch}
        />
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <InfoGrid githubStatus={githubStatus} />
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedSection delay={0.1}>
          <CommitHistory githubStatus={githubStatus} />
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <ExportModules modules={modules} />
        </AnimatedSection>
      </div>
    </div>
  );
}