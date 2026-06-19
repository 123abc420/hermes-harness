'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorBlockProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorBlock({ message, onRetry }: ErrorBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="glass-card border-red-500/10">
        <CardContent className="flex h-48 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              Failed to load data
            </p>
            {message && (
              <p className="mt-1 max-w-xs text-xs text-zinc-500">{message}</p>
            )}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3 gap-1.5 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}