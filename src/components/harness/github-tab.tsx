'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGithubStatus,
  useGithubSync,
  useHarnessDashboard,
} from '@/hooks/use-harness-data';
import type { ExportModule } from '@/store/harness-store';
import {
  GitBranch,
  Github,
  ExternalLink,
  RefreshCw,
  GitCommitHorizontal,
  Link2,
  Unlink,
  Package,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ErrorBlock } from './error-block';

/* ── Connection Status ───────────────────────────────── */
function ConnectionStatus() {
  const { data: github, isLoading, isError, error, refetch } = useGithubStatus();
  const { data: dash } = useHarnessDashboard();
  const sync = useGithubSync();

  const status = dash?.githubStatus ?? github;
  const isConnected = status?.status === 'connected';

  if (isError) {
    return <ErrorBlock message={error?.message} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-60" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`glass-card ${
        isConnected ? 'glow-emerald-sm' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isConnected
                  ? 'border border-emerald-500/20 bg-emerald-500/10'
                  : 'border border-white/[0.06] bg-white/[0.03]'
              }`}
            >
              {isConnected ? (
                <Link2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <Unlink className="h-5 w-5 text-zinc-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  GitHub Repository
                </h3>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-zinc-500/10 text-zinc-500'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isConnected ? 'animate-pulse bg-emerald-400' : 'bg-zinc-500'
                    }`}
                  />
                  {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                {isConnected
                  ? `@${status.username}/${status.repoName}`
                  : 'Not connected — connect to enable persistence'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-white/[0.08] bg-white/[0.03] text-xs text-zinc-400 hover:text-white"
              >
                <a
                  href={`https://github.com/${status.username}/${status.repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${status.username}/${status.repoName} on GitHub (opens in new tab)`}
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View Repo
                </a>
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => sync.mutate()}
              disabled={!isConnected || sync.isPending}
              aria-label="Sync to GitHub"
              className="gap-1.5 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${sync.isPending ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">
                {sync.isPending ? 'Syncing...' : 'Sync Now'}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Info Grid ────────────────────────────────────────── */
function InfoGrid() {
  const { data: dash } = useHarnessDashboard();
  const status = dash?.githubStatus;

  if (!status) return null;

  const cards = [
    {
      icon: GitBranch,
      label: 'Branch',
      value: status.branch ?? 'main',
      mono: true,
    },
    {
      icon: GitCommitHorizontal,
      label: 'Total Commits',
      value: String(status.totalCommits ?? 0),
      mono: true,
    },
    {
      icon: Github,
      label: 'Last Sync',
      value: status.lastSyncAt
        ? formatDistanceToNow(new Date(status.lastSyncAt), { addSuffix: true })
        : 'Never',
      mono: false,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                <Icon className="h-3.5 w-3.5" />
                {card.label}
              </div>
              <p
                className={`mt-1.5 text-sm font-semibold text-white ${
                  card.mono ? 'font-mono tabular-nums' : ''
                }`}
              >
                {card.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Commit History ──────────────────────────────────── */
function CommitHistory() {
  const { data: dash } = useHarnessDashboard();
  const status = dash?.githubStatus;
  const commits = status?.recentCommits ?? [];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Recent Commits
        </CardTitle>
      </CardHeader>
      <CardContent>
        {commits.length > 0 ? (
          <div className="space-y-2">
            {commits.map((commit) => (
              <div
                key={commit.sha}
                className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
              >
                <GitCommitHorizontal className="h-4 w-4 shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-300">
                    {commit.message}
                  </p>
                </div>
                <a
                  href={`https://github.com/${status?.username}/${status?.repoName}/commit/${commit.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View commit ${commit.sha.slice(0, 7)} on GitHub (opens in new tab)`}
                  className="shrink-0 font-mono text-[10px] text-zinc-600 transition-colors hover:text-emerald-400"
                >
                  {commit.sha.slice(0, 7)}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-xs text-zinc-600">No commits yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Export Modules ───────────────────────────────────── */
function ExportModules() {
  const { data: dash } = useHarnessDashboard();
  const modules = (dash?.exports ?? []) as ExportModule[];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Export Modules
            </CardTitle>
          </div>
          {modules.length > 0 && (
            <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-500">
              {modules.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {modules.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            <div className="text-center">
              <Package className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
              <p className="text-xs text-zinc-600">
                No export modules configured
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4 transition-colors hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white">
                        {mod.moduleName}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-600">
                        v{mod.version}
                      </span>
                    </div>
                    {mod.description && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {mod.description}
                      </p>
                    )}
                  </div>
                  {mod.isReady ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-zinc-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── GitHub Tab ──────────────────────────────────────── */
export function GithubTab() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ConnectionStatus />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <InfoGrid />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CommitHistory />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ExportModules />
        </motion.div>
      </div>
    </div>
  );
}