'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BuildHealth {
  lintPassed: boolean | null;
  lintErrors: number;
  lintWarnings: number;
  checkedAt: string | null;
}

export function BuildHealthCard({ health, isLoading }: { health?: BuildHealth; isLoading?: boolean }) {
  // Null means "never checked" (lint cannot run in sandbox)
  const isHealthy = health?.lintPassed === true;
  const isUnhealthy = health?.lintPassed === false;
  const isUnknown = !health || health.lintPassed === null;

  const statusColor = isHealthy
    ? 'text-emerald-400'
    : isUnhealthy
      ? 'text-red-400'
      : 'text-zinc-500';

  const StatusIcon = isHealthy
    ? CheckCircle2
    : isUnhealthy
      ? XCircle
      : Clock;

  const statusLabel = isHealthy
    ? 'Lint Clean'
    : isUnhealthy
      ? `${health.lintErrors} error${health.lintErrors !== 1 ? 's' : ''}${health.lintWarnings > 0 ? `, ${health.lintWarnings} warning${health.lintWarnings !== 1 ? 's' : ''}` : ''}`
      : 'Not Yet Checked';

  const borderGlow = isHealthy
    ? 'border-emerald-500/20'
    : isUnhealthy
      ? 'border-red-500/20'
      : '';

  return (
    <Card className={`glass-card ${borderGlow}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-zinc-500" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Build Health
            </CardTitle>
          </div>
          {!isLoading && (
            <motion.span
              className={`text-xs font-medium ${statusColor}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {statusLabel}
            </motion.span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-36 rounded bg-white/[0.06] animate-pulse" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Status row */}
            <div className="flex items-center gap-2.5">
              <StatusIcon className={`h-4 w-4 shrink-0 ${statusColor}`} />
              <span className={`text-sm ${statusColor}`}>
                {isHealthy && 'All checks passing'}
                {isUnhealthy && 'Issues detected — see details'}
                {isUnknown && 'Awaiting first lint check'}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Errors</div>
                <div className={`text-lg font-bold tabular-nums ${health && health.lintErrors > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {health?.lintErrors ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Warnings</div>
                <div className={`text-lg font-bold tabular-nums ${health && health.lintWarnings > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {health?.lintWarnings ?? 0}
                </div>
              </div>
            </div>

            {/* Last checked timestamp */}
            {health?.checkedAt && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
                <Clock className="h-3 w-3" />
                <span>Last checked: {new Date(health.checkedAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}