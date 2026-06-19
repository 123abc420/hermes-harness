'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_HEX } from '@/lib/category-colors';
import type { DashboardData } from '@/store/harness-store';

/* ── Decision Timeline ──────────────────────────────── */
export function DecisionTimeline({ decisions }: { decisions?: DashboardData['recentDecisions'] }) {
  const items = decisions ?? [];
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-teal-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Recent Decisions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex h-24 items-center justify-center">
          <div className="text-center">
            <ListChecks className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
            <p className="text-xs text-zinc-600">No decisions recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const shown = items.slice(0, 8);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-teal-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Recent Decisions
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-zinc-600">
            {items.length} total
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-72 space-y-0 overflow-y-auto scrollbar-dark px-5 pb-4">
          {shown.map((d, i) => {
            const color = CATEGORY_HEX[d.category] ?? '#71717a';
            const isOpen = expanded.has(d.id);
            return (
              <div key={d.id} className="relative flex gap-3 py-2.5">
                {i < shown.length - 1 && (
                  <div className="absolute left-[5px] top-6 h-full w-px bg-white/[0.06]" />
                )}
                <div
                  className="relative z-10 mt-1 h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => toggle(d.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(d.id); }}
                  >
                    <span className="text-[10px] font-mono text-zinc-500">
                      W{d.wave?.waveNumber ?? '?'}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-mono"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {d.category.replace('_', ' ')}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${
                      d.action === 'executed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : d.action === 'failed'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {d.action}
                    </span>
                    {(d.reasoning || d.targetFile) && (
                      <ChevronDown className={`ml-auto h-3 w-3 shrink-0 text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  <p className={`mt-0.5 text-xs text-zinc-400 ${isOpen ? '' : 'truncate'}`}>{d.description}</p>
                  {d.targetFile && (
                    <p className="mt-0.5 text-[10px] text-zinc-600 font-mono truncate">{d.targetFile}</p>
                  )}
                  <AnimatePresence>
                    {isOpen && d.reasoning && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-1.5 rounded-md border border-white/[0.04] bg-white/[0.02] px-2.5 py-2 text-[11px] leading-relaxed text-zinc-500 italic">
                          {d.reasoning}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}