'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitCommitHorizontal } from 'lucide-react';

export function RecentCommitsCard({ commits }: { commits?: { sha: string; message: string }[] }) {
  if (!commits?.length) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Recent Commits
            </CardTitle>
          </div>
          <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-500">
            {commits.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {commits.map((c) => (
          <div key={c.sha} className="flex items-start gap-2.5">
            <code className="mt-0.5 shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-cyan-400/80">
              {c.sha}
            </code>
            <span className="truncate text-xs text-zinc-400">{c.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}