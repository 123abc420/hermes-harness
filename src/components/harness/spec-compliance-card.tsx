'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const SPEC_CHECKLIST = (skillsCount?: number) => [
  { label: 'Spec-Driven Architecture', done: true },
  { label: 'Wave Lifecycle Protocol', done: true },
  { label: 'Decision Tracking System', done: true },
  { label: 'GitHub Persistence Layer', done: true },
  { label: 'Guardrails & Safety Rules', done: true },
  { label: 'Metrics & Observability', done: true },
  { label: 'Dashboard Control Plane', done: true },
  { label: 'Memory & Context System', done: true },
  { label: `Skills System (${skillsCount ?? '...'} skills)`, done: (skillsCount ?? 0) > 0 },
  { label: 'Export Contract (src/index.ts)', done: true },
  { label: 'Agent Live Panel (SVG node graph + SSE)', done: true },
  { label: 'Cron Jobs (2 active)', done: true },
  { label: 'user_profile.md', done: true },
  { label: 'wave_protocol.md', done: true },
  { label: 'Turborepo Package Layout', done: true },
  { label: 'Error Rate Decreasing Trend', done: null as boolean | null },
];

export function SpecComplianceCard({ skillsCount, errorTrendDecreasing }: { skillsCount?: number; errorTrendDecreasing?: boolean }) {
  const checklist = SPEC_CHECKLIST(skillsCount).map((item) => {
    if (item.label === 'Error Rate Decreasing Trend') {
      return errorTrendDecreasing !== undefined
        ? { ...item, done: errorTrendDecreasing }
        : item;
    }
    return item.done !== null ? item : { ...item, done: false };
  });
  const doneCount = checklist.filter((s) => s.done).length;
  const totalCount = checklist.length;
  const percent = Math.round((doneCount / totalCount) * 100);
  const isComplete = percent === 100;

  return (
    <Card className={cn('glass-card', isComplete && 'border-emerald-500/20')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Spec Compliance
          </CardTitle>
          <span className={cn('text-sm font-bold tabular-nums', isComplete ? 'text-amber-400' : 'text-emerald-400')}>
            {percent}%
            {isComplete && (
              <motion.span
                className="ml-1.5 inline-block"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                &#9733;
              </motion.span>
            )}
          </span>
        </div>
        {isComplete && (
          <motion.p
            className="text-[10px] text-amber-400/70"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            All spec requirements implemented
          </motion.p>
        )}
      </CardHeader>
      <CardContent className="space-y-2" role="list" aria-label="Spec compliance checklist">
        {checklist.map((item, i) => (
          <motion.div
            key={item.label}
            role="listitem"
            aria-checked={item.done === true ? true : item.done === false ? false : undefined}
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            {item.done === true ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : item.done === null ? (
              <span className="h-3.5 w-3.5 shrink-0 flex items-center justify-center text-[10px] font-mono text-zinc-600">—</span>
            ) : (
              <Minus className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
            )}
            <span
              className={cn(
                'text-xs',
                item.done === true && 'text-zinc-300',
                item.done === null && 'text-zinc-500 italic',
                item.done === false && 'text-zinc-600'
              )}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}