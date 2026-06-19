'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatusCardProps {
  status: 'ALIVE' | 'DORMANT' | 'ERROR'
  waveNumber: number
  uptime?: string
  decisionsInWave?: number
}

const statusConfig = {
  ALIVE: {
    color: 'emerald',
    label: 'ALIVE',
    description: 'Harness is actively evolving',
    glow: 'glow-emerald',
  },
  DORMANT: {
    color: 'amber',
    label: 'DORMANT',
    description: 'Waiting for next wave trigger',
    glow: '',
  },
  ERROR: {
    color: 'red',
    label: 'ERROR',
    description: 'An error occurred in the last wave',
    glow: '',
  },
}

export function StatusCard({
  status,
  waveNumber,
  uptime,
  decisionsInWave,
}: StatusCardProps) {
  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'relative rounded-2xl p-6 sm:p-8 gradient-border glass-strong overflow-hidden',
        config.glow
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10">
        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className={cn(
              'relative flex h-3 w-3',
              status === 'ALIVE' && 'animate-pulse-slow'
            )}
          >
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75',
                status === 'ALIVE' && 'animate-ping bg-emerald-400',
                status === 'DORMANT' && 'bg-amber-400',
                status === 'ERROR' && 'bg-red-400'
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full h-3 w-3',
                status === 'ALIVE' && 'bg-emerald-500',
                status === 'DORMANT' && 'bg-amber-500',
                status === 'ERROR' && 'bg-red-500'
              )}
            />
          </span>
          <span
            className={cn(
              'text-sm font-bold tracking-[0.2em] uppercase',
              status === 'ALIVE' && 'text-emerald-400',
              status === 'DORMANT' && 'text-amber-400',
              status === 'ERROR' && 'text-red-400'
            )}
          >
            {config.label}
          </span>
        </div>

        {/* Main status content */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Current Wave
            </p>
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              #{waveNumber}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {uptime ? 'Uptime' : 'Decisions'}
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground/90">
              {uptime || `${decisionsInWave ?? 0}`}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">{config.description}</p>
      </div>
    </motion.div>
  )
}
