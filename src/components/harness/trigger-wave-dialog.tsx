'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateWave } from '@/hooks/use-harness-data';

export function TriggerWaveDialog() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const createWave = useCreateWave();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
          aria-label="Trigger new wave"
        >
          <Play className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Trigger Wave</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/[0.08] bg-[#0f172a] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Trigger New Wave</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Optional summary for this wave..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-600"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                createWave.mutate(summary || undefined);
                setSummary('');
                setOpen(false);
              }}
              disabled={createWave.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {createWave.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Start Wave
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}