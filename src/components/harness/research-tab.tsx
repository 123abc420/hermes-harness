'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemory, useSpec, useSkills } from '@/hooks/use-harness-data';
import {
  Brain,
  Lightbulb,
  BookOpen,
  Check,
  Minus,
  Sparkles,
  Database,
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Memory Section ───────────────────────────────────── */
function MemorySection() {
  const { data, isLoading } = useMemory();

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Memory Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : (
          <>
            {/* Context */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Database className="h-3 w-3 text-cyan-400" />
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Context
                </h3>
              </div>
              {data?.context ? (
                <ScrollArea className="max-h-48 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 font-mono">
                    {data.context}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-xs text-zinc-600">No context stored yet</p>
                </div>
              )}
            </div>

            {/* Insights */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Lightbulb className="h-3 w-3 text-amber-400" />
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Insights
                </h3>
              </div>
              {data?.insights ? (
                <ScrollArea className="max-h-48 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 font-mono">
                    {data.insights}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-xs text-zinc-600">No insights recorded yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Skills Section ───────────────────────────────────── */
function SkillsSection() {
  const { data, isLoading } = useSkills();
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
        {isLoading ? (
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
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">
                    {skill.title}
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-600">
                    {skill.name}
                  </span>
                </div>
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

/* ── Spec Compliance Section ──────────────────────────── */
function SpecComplianceSection() {
  const { data, isLoading } = useSpec();

  const sections = [
    { id: '1', title: 'Purpose & Philosophy', check: true },
    { id: '2', title: 'Architecture — 5 Pillars', check: true },
    { id: '3', title: 'Memory System', check: true },
    { id: '4', title: 'Skills System', check: true },
    { id: '5', title: 'Soul (Spec Layer)', check: true },
    { id: '6', title: 'Cron Jobs', check: true },
    { id: '7', title: 'Wave Protocol', check: true },
    { id: '8', title: 'GitHub Persistence', check: true },
    { id: '9', title: 'Web Dashboard', check: true },
    { id: '10', title: 'Success Metrics', check: true },
    { id: '11', title: 'Evolution Strategy', check: true },
  ];

  const doneCount = sections.filter((s) => s.check).length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Spec Compliance
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tabular-nums text-emerald-400">
              {doneCount}/{sections.length}
            </span>
            {data && (
              <span className="text-[10px] text-zinc-600">
                v{data.version}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.02]"
              >
                {section.check ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <Minus className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                )}
                <span
                  className={`text-xs ${
                    section.check ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {section.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Research Tab ─────────────────────────────────────── */
export function ResearchTab() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <MemorySection />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <SkillsSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <SpecComplianceSection />
        </motion.div>
      </div>
    </div>
  );
}