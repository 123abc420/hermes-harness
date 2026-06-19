'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemory, useSaveMemory } from '@/hooks/use-harness-data';
import { Brain, Lightbulb, Save, Loader2 } from 'lucide-react';

export function MemoryTab() {
  const { data, isLoading } = useMemory();
  const saveMemory = useSaveMemory();
  const [editContext, setEditContext] = useState(false);
  const [editInsights, setEditInsights] = useState(false);
  const [contextDraft, setContextDraft] = useState('');
  const [insightsDraft, setInsightsDraft] = useState('');

  const context = data?.context ?? '';
  const insights = data?.insights ?? '';

  const handleSaveContext = () => {
    saveMemory.mutate({ context: contextDraft });
    setEditContext(false);
  };

  const handleSaveInsights = () => {
    saveMemory.mutate({ insights: insightsDraft });
    setEditInsights(false);
  };

  const startEditContext = () => {
    setContextDraft(context);
    setEditContext(true);
  };

  const startEditInsights = () => {
    setInsightsDraft(insights);
    setEditInsights(true);
  };

  return (
    <div className="space-y-6">
      {/* Context Card */}
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-sm font-medium text-zinc-400">
                Agent Context
              </CardTitle>
            </div>
            {!editContext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditContext}
                className="h-7 text-xs text-zinc-500 hover:text-white"
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : editContext ? (
            <div className="space-y-3">
              <Textarea
                value={contextDraft}
                onChange={(e) => setContextDraft(e.target.value)}
                rows={10}
                className="border-white/10 bg-white/5 font-mono text-xs text-white"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditContext(false)}
                  className="text-zinc-400"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveContext}
                  disabled={saveMemory.isPending}
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  {saveMemory.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          ) : context ? (
            <ScrollArea className="max-h-60">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
                {context}
              </pre>
            </ScrollArea>
          ) : (
            <div className="flex h-24 items-center justify-center">
              <p className="text-xs text-zinc-600">No context stored yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm font-medium text-zinc-400">
                Insights & Learning
              </CardTitle>
            </div>
            {!editInsights && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditInsights}
                className="h-7 text-xs text-zinc-500 hover:text-white"
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : editInsights ? (
            <div className="space-y-3">
              <Textarea
                value={insightsDraft}
                onChange={(e) => setInsightsDraft(e.target.value)}
                rows={10}
                className="border-white/10 bg-white/5 font-mono text-xs text-white"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditInsights(false)}
                  className="text-zinc-400"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveInsights}
                  disabled={saveMemory.isPending}
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  {saveMemory.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          ) : insights ? (
            <ScrollArea className="max-h-60">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
                {insights}
              </pre>
            </ScrollArea>
          ) : (
            <div className="flex h-24 items-center justify-center">
              <p className="text-xs text-zinc-600">No insights recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}