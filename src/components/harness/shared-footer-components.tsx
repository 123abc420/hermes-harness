'use client';

import { useId } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

/* ── Wave Activity Sparkline (inline SVG, no Recharts) ─────────── */
export function WaveSparkline({ waves }: { waves: { status: string }[] }) {
  const gradId = useId();
  const last10 = waves.slice(0, 10).reverse();
  if (last10.length < 2) return null;
  // Encode status as height: completed=1, failed=0.3, others=0.5
  const heights = last10.map(w =>
    w.status === 'completed' ? 1 : w.status === 'failed' ? 0.3 : 0.5
  );
  const W = 60, H = 16;
  const step = W / (heights.length - 1);
  const points = heights.map((h, i) => `${i * step},${H - h * H}`).join(' ');
  const areaPoints = `${points} ${W},${H} 0,${H}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0" aria-label="Wave activity sparkline">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradId})`} points={areaPoints} />
      <polyline fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" points={points} opacity="0.7" />
      <circle cx={(heights.length - 1) * step} cy={H - ((heights[heights.length - 1] - 0.3) / (Math.max(...heights) - Math.min(...heights) || 1)) * (H - 2) - 1} r="1.5" fill="#f59e0b" opacity="0.9" />
    </svg>
  );
}

/* ── Success Rate Pulse Bar ── */
export function SuccessRatePulse({ rate }: { rate: number }) {
  const barColor = rate >= 90 ? '#10b981' : rate >= 70 ? '#f59e0b' : '#ef4444';
  const pulseSpeed = rate >= 90 ? '1.5s' : rate >= 70 ? '2.5s' : '1s';

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono text-zinc-600">health</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${rate}%`,
            backgroundColor: barColor,
            animation: `pulse-health ${pulseSpeed} ease-in-out infinite`,
          }}
        />
      </div>
      <span className="text-[10px] font-mono tabular-nums" style={{ color: barColor }}>{rate}%</span>
    </div>
  );
}

/* ── Uptime Display ── */
export function UptimeDisplay({ firstWaveStart }: { firstWaveStart?: string }) {
  if (!firstWaveStart) return null;
  const uptimeStr = formatDistanceToNow(new Date(firstWaveStart), { addSuffix: false });
  return (
    <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
      <span className="text-zinc-500">uptime</span>
      <span className="text-amber-500/40">{uptimeStr}</span>
    </span>
  );
}

/* ── Last Wave Badge ── */
export function LastWaveBadge({ wave }: { wave?: { waveNumber: number; status: string; completedAt?: string } }) {
  if (!wave) return null;
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
      <Activity className="h-2.5 w-2.5 text-emerald-500/40" />
      <span className="text-zinc-500">#{String(wave.waveNumber).padStart(3, '0')}</span>
      <span className="text-zinc-700">{wave.status === 'completed' ? 'completed' : wave.status}</span>
      {wave.completedAt && (
        <span className="text-zinc-700">{formatDistanceToNow(new Date(wave.completedAt), { addSuffix: true })}</span>
      )}
    </span>
  );
}