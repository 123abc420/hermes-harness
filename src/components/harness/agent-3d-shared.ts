import type { AgentVisualState } from '@/store/agent-live-store';

export const mousePosition = { x: 0, y: 0 };

export const STATION_COLORS: Record<AgentVisualState, string> = {
  idle: '#6366f1', thinking: '#06b6d4', searching: '#f97316',
  planning: '#a855f7', executing: '#ef4444', verifying: '#22c55e',
  celebrating: '#eab308', error: '#dc2626', evolving: '#d946ef', offline: '#71717a',
};

export const STATIONS: Record<AgentVisualState, { pos: [number, number, number]; rot: number; label: string }> = {
  idle:       { pos: [0, 0, 0],     rot: 0,     label: 'HOME' },
  thinking:   { pos: [-3, 0, -2],   rot: 0.5,   label: 'LIBRARY' },
  searching:  { pos: [3, 0, -2],    rot: -0.5,  label: 'OBSERVATORY' },
  planning:   { pos: [0, 0, -3.5],  rot: 0,     label: 'MAP' },
  executing:  { pos: [3.5, 0, 1.5], rot: -0.8,  label: 'WORKSHOP' },
  verifying:  { pos: [-3.5, 0, 1.5],rot: 0.8,   label: 'LAB' },
  celebrating:{ pos: [0, 0, 3],     rot: 0,     label: 'PLAZA' },
  error:      { pos: [0, 0, -0.5],  rot: 0,     label: '' },
  evolving:   { pos: [0, 0, 0],     rot: 0,     label: 'PORTAL' },
  offline:    { pos: [0, 0, 0],     rot: 0,     label: '' },
};