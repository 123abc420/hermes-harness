'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { useSkills } from '@/hooks/use-harness-data';
import { ErrorBlock } from './error-block';

/* ── Skills Section ───────────────────────────────────── */
export function SkillsSection() {
  const { data, isLoading, isError, error, refetch } = useSkills();
  const skills = data?.skills ?? [];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Skills
            </CardTitle>
          </div>
          {skills.length > 0 && (
            <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-500">
              {skills.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <ErrorBlock message={error?.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
              <p className="text-xs text-zinc-500">No skills learned yet</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">
                Skills are acquired as the agent evolves through waves
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:border-white/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-white">
                    {skill.title}
                  </h4>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {skill.category && (
                      <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-mono text-cyan-400">
                        {skill.category}
                      </span>
                    )}
                    {skill.version && (
                      <span className="text-[9px] font-mono text-zinc-600">
                        v{skill.version}
                      </span>
                    )}
                  </div>
                </div>
                {skill.trigger && (
                  <p className="mt-1 text-[10px] italic text-zinc-600">
                    Trigger: {skill.trigger}
                  </p>
                )}
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                  {skill.content.slice(0, 200)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}