'use client';

import { ExternalLink, BookOpen, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResearch } from '@/hooks/use-harness-data';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ResearchCard() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useResearch();

  if (isLoading) return null;

  const research = data?.research ?? [];
  if (research.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-white/10 bg-white/[0.03]">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none pb-2 transition-colors hover:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Research Sources
                </CardTitle>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-zinc-500 transition-transform',
                  open && 'rotate-180'
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-80">
              <div className="space-y-3 pr-2">
                {research.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-white">{r.title}</h4>
                        <p className="mt-0.5 text-xs text-zinc-500">{r.source}</p>
                      </div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-zinc-500 transition-colors hover:text-emerald-400"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {r.summary}
                    </p>
                    <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/5 px-2 py-1.5">
                      <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                      <p className="text-[11px] leading-relaxed text-amber-300/70">
                        {r.keyInsight}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}