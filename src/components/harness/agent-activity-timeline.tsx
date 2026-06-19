'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAgentLiveStore, type LiveActivityEntry } from '@/store/agent-live-store';

// Recent activity snippets for the timeline
const ACTIVITY_ICONS: Record<string, string> = {
  'thinking': '💭',
  'planning': '📋',
  'executing': '⚡',
  'verifying': '✅',
  'celebrating': '🎉',
  'error': '💥',
  'searching': '🔍',
  'evolving': '🧬',
  'idle': '💤',
};

interface TimelineNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  icon: string;
  color: string;
  alpha: number;
  message: string;
  ts: number;
}

interface ActivityTimelineProps {
  size?: number;
  evolutionLevel: number;
  totalActivities: number;
}

export function ActivityTimeline({ size = 280, evolutionLevel = 1, totalActivities }: ActivityTimelineProps) {
  const { activities } = useAgentLiveStore((s) => s.activities);
  const recent = activities.slice(0, Math.min(totalActivities || 8, 20));

 8.5 orbital positions — inner close, mid, outer far
  const RING_POSITIONS = [
    { radius: 0.22, distance: 0.0 },
    { radius: 0.36, distance: 0.0 },
    { radius: 0.50, distance: 0.0 },
  ];

  const colorForState = (state: string): string => {
    switch (state) {
      case 'thinking':   return 'rgba(6,182,212,0.7)';
      case 'planning':   return 'rgba(167,139,250,0.7)';
      case 'searching':  return 'rgba(245,158,11,0.7)';
      case 'executing':   return 'rgba(244,63,94,0.7)';
      case 'verifying': return 'rgba(34,211,238,0.7)';
      case 'celebrating': return 'rgba(251,191,36,0.7)';
      case 'error':      return 'rgba(239,68,68,0.7)';
      case 'evolving':  return 'rgba(192,132,252,0.7)';
      default:        return 'rgba(16,185,129,0.7)';
    }
  };

  return (
    <div className="relative w-full aspect-square mx-auto mb-2">
      {/* Background glow based on current state */}
      <motion.div
        animate={{
          initial: { opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 }}
        className="absolute inset-0 bottom-0 left-1/2 bottom-1/2 w-full aspect-square"
        style={{ background: colorForState(useAgentLiveStore(s).agentState), opacity: 0.3 }}
      />

      {/* Timeline nodes — recent activities orbiting the avatar */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 top-0 left-1/2 top-1/2 w-full aspect-square pointer-events-none">
        <g className="animate-spin-slow" style={{ animationDuration: '20s' }}>
          <circle
            cx="50"
            cy="50"
            r={22}
            fill="none"
            stroke={colorForState(useAgentLiveStore(s).agentState)}
            strokeWidth={1.5}
            strokeOpacity={0.4}
          />
          {recent.slice(0, 8).map((a, i) => {
            const pos = RING_POSITIONS[Math.min(i, RING_POSITIONS.length - 1)];
            const angle = (Math.PI * 2 / pos.distance) * i + Math.PI / 2;
            const x = 50 + Math.cos(angle) * pos.radius;
            const y = 50 + Math.sin(angle) * pos.radius * 0.3;
            return (
              <motion.g
                key={`${a.id}-${i}`}
                initial={{ opacity: 0, scale: 0, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 }}
                className="absolute"
                style={{ left: `${x - pos.radius * 1.5 - 5}px`, top: `${y - pos.radius * 1.5 - 5}px`, width: 8, height: 8, borderRadius: 4 }}
                transition={{ type: 'layout' }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={2 + pos.radius}
                  fill={colorForState(a.state)}
                  stroke={colorForState(a.state)}
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                  className={a.ts < 10 ? 'opacity-0' : 'opacity-40'}
                />
                </motion.g>
                  <text
                    x={x - pos.radius - 1.5}
                    y={y + pos.radius * 0.4}
                    className="absolute text-[7px] font-mono font-bold text-white/50 opacity-70"
                    style={{ textShadow: '0 1px 3px 0px' }}
                  >
                    {a.label.slice(0, 8)}
                  </text>
                </motion.g>
              );
            })}
          </g>
        </svg>
      </motion.div>
    </div>
  );
}