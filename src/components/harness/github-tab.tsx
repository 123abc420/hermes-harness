'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  useGithubStatus,
  useGithubSync,
  useDashboard,
} from '@/hooks/use-harness-data';
import { StatusBadge } from './status-badge';
import {
  GitBranch,
  Github,
  ExternalLink,
  RefreshCw,
  User,
  GitCommitHorizontal,
  Link2,
  Unlink,
  Shield,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function GithubTab() {
  const { data: github, isLoading, error } = useGithubStatus();
  const { data: dash } = useDashboard();
  const sync = useGithubSync();

  const status = dash?.githubStatus ?? github;
  const isLoadingGh = isLoading;

  const isConnected = status?.status === 'connected';

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card
        className={`border ${
          isConnected
            ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
            : 'border-white/10 bg-white/[0.03]'
        }`}
      >
        <CardContent className="p-6">
          {isLoadingGh ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    isConnected ? 'bg-emerald-500/15' : 'bg-zinc-500/15'
                  }`}
                >
                  {isConnected ? (
                    <Link2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Unlink className="h-6 w-6 text-zinc-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">GitHub Repository</h3>
                    <StatusBadge
                      status={isConnected ? 'connected' : 'disconnected'}
                      pulse={isConnected}
                    />
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {isConnected
                      ? `@${status.username}/${status.repoName}`
                      : 'Not connected — connect to enable sync'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-white/10 bg-white/5 text-xs text-zinc-400 hover:text-white"
                >
                  <a
                    href="https://github.com/123abc420/hermes-harness"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    View Repo
                  </a>
                </Button>
                <Button
                  size="sm"
                  onClick={() => sync.mutate()}
                  disabled={!isConnected || sync.isPending}
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${sync.isPending ? 'animate-spin' : ''}`}
                  />
                  {sync.isPending ? 'Syncing...' : 'Sync to GitHub'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Grid */}
      {status && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <GitBranch className="h-3.5 w-3.5" />
                Branch
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-white">
                {status.branch ?? 'main'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <GitCommitHorizontal className="h-3.5 w-3.5" />
                Total Commits
              </div>
              <p className="mt-1 text-sm font-bold tabular-nums text-white">
                {status.totalCommits ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Shield className="h-3.5 w-3.5" />
                Last Sync
              </div>
              <p className="mt-1 text-sm text-white">
                {status.lastSyncAt
                  ? formatDistanceToNow(new Date(status.lastSyncAt), { addSuffix: true })
                  : 'Never'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent commits placeholder */}
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Recent Commits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status && status.totalCommits > 0 ? (
              Array.from({ length: Math.min(status.totalCommits, 5) }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <GitCommitHorizontal className="h-4 w-4 shrink-0 text-emerald-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-300">
                      Wave {i + 1} sync — automated improvements
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      {formatDistanceToNow(new Date(Date.now() - (i + 1) * 600000), { addSuffix: true })}
                    </p>
                  </div>
                  <code className="shrink-0 text-[10px] font-mono text-zinc-600">
                    abc{i}def
                  </code>
                </div>
              ))
            ) : (
              <div className="flex h-24 items-center justify-center">
                <p className="text-xs text-zinc-600">No commits yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}