// ─── Shared state for 3D sandbox (avoids circular deps) ────────────
import type { AgentVisualState } from '@/store/agent-live-store';

/** Mouse position — written by MouseTracker, read inside useFrame only */
export const mousePosition = { x: 0, y: 0 };

/** World stations — where the character walks to based on state */
export const STATIONS: Record<AgentVisualState, { pos: [number, number, number]; rot: number; label: string }> = {
  idle:       { pos: [0, 0, 0],     rot: 0,     label: 'CASA' },
  thinking:   { pos: [-2.5, 0, -1.5], rot: 0.6,  label: 'BIBLIOTECA' },
  searching:  { pos: [2.5, 0, -1.5],  rot: -0.6, label: 'OBSERVATORIO' },
  planning:   { pos: [0, 0, -3],     rot: 0,     label: 'MAPA' },
  executing:  { pos: [2.8, 0, 1.5],  rot: -0.8, label: 'TALLER' },
  verifying:  { pos: [-2.8, 0, 1.5], rot: 0.8,  label: 'LABORATORIO' },
  celebrating:{ pos: [0, 0, 2],      rot: 0,     label: 'PLAZA' },
  error:      { pos: [0, 0, -0.5],   rot: 0,     label: '' },
  evolving:   { pos: [0, 0, 0],      rot: 0,     label: 'PORTAL' },
  offline:    { pos: [0, 0, 0],      rot: 0,     label: '' },
};