'use client';

import {
  useGithubStatus,
  useHarnessDashboard,
} from '@/hooks/use-harness-data';
import type { ExportModule } from '@/store/harness-store';
import { motion } from 'framer-motion';
import { ConnectionStatus, InfoGrid, CommitHistory, ExportModules } from './github-subcomponents';

/* ── GitHub Tab ──────────────────────────────────────── */
export function GithubTab() {
  const { data: dash } = useHarnessDashboard();
  const { data: github, isLoading, isError, error, refetch } = useGithubStatus();
  const githubStatus = dash?.githubStatus ?? github;
  const modules = (dash?.exports ?? []) as ExportModule[];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ConnectionStatus
          githubStatus={githubStatus}
          isLoading={isLoading}
          isError={isError}
          error={error}
          refetch={refetch}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <InfoGrid githubStatus={githubStatus} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CommitHistory githubStatus={githubStatus} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ExportModules modules={modules} />
        </motion.div>
      </div>
    </div>
  );
}