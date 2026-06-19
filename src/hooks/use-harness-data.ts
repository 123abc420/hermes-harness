'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  DashboardData,
  Wave,
  Decision,
  Metric,
  GithubStatus,
  SpecData,
  Skill,
} from '@/store/harness-store';
import { useAgentLiveStore } from '@/store/agent-live-store';

const API_BASE = '/api/harness';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useHarnessDashboard() {
  const { setStatus } = useAgentLiveStore();

  const query = useQuery<DashboardData>({
    queryKey: ['harness-dashboard'],
    queryFn: () => fetchJSON<DashboardData>(`${API_BASE}/dashboard`),
    refetchInterval: 30_000,
  });

  // Sync dashboard stats to agent live store
  useEffect(() => {
    if (query.data) {
      const { totalStats, healthScore, healthScoreTrend } = query.data;
      if (totalStats) {
        setStatus({
          waveCount: totalStats.totalWaves,
          totalImprovements: totalStats.totalImprovements,
          totalDecisions: totalStats.totalDecisions,
          recentSuccessRate: totalStats.recentSuccessRate,
          ...(healthScore != null && { healthScore }),
          ...(healthScoreTrend && { healthScoreTrend }),
        });
      }
    }
  }, [query.data, setStatus]);

  return query;
}

export function useWaves(page = 1, limit = 20, status = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return useQuery<{ waves: Wave[]; total: number; page: number; limit: number }>({
    queryKey: ['harness-waves', page, limit, status],
    queryFn: () => fetchJSON(`${API_BASE}/waves?${params}`),
  });
}

export function useWave(id: string | null) {
  return useQuery<Wave>({
    queryKey: ['harness-wave', id],
    queryFn: () => fetchJSON<Wave>(`${API_BASE}/waves/${id!}`),
    enabled: !!id,
  });
}

export function useCreateWave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (summary?: string) =>
      fetchJSON<Wave>(`${API_BASE}/waves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summary ?? undefined }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['harness'] });
      toast.success('Wave triggered successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDecisions(page = 1, limit = 50, category = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set('category', category);
  return useQuery<{ decisions: Decision[]; total: number; page: number; limit: number; countsByCategory: Record<string, number>; countsByAction: Record<string, number> }>({
    queryKey: ['harness-decisions', page, limit, category],
    queryFn: () => fetchJSON(`${API_BASE}/decisions?${params}`),
  });
}

export function useMetrics(metricKey = '') {
  const params = metricKey ? `?metricKey=${metricKey}` : '';
  return useQuery<{ metrics: Metric[] }>({
    queryKey: ['harness-metrics', metricKey],
    queryFn: () => fetchJSON<{ metrics: Metric[] }>(`${API_BASE}/metrics${params}`),
  });
}

export function useGithubStatus() {
  return useQuery<GithubStatus>({
    queryKey: ['harness-github-status'],
    queryFn: () => fetchJSON<GithubStatus>(`${API_BASE}/github/status`),
  });
}

export function useGithubSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJSON<GithubStatus>(`${API_BASE}/github/sync`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['harness-github-status'] });
      qc.invalidateQueries({ queryKey: ['harness-dashboard'] });
      toast.success('Sync triggered to GitHub');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSpec() {
  return useQuery<SpecData>({
    queryKey: ['harness-spec'],
    queryFn: () => fetchJSON<SpecData>(`${API_BASE}/spec`),
  });
}

export function useSkills() {
  return useQuery<{ skills: Skill[] }>({
    queryKey: ['harness-skills'],
    queryFn: () => fetchJSON<{ skills: Skill[] }>(`${API_BASE}/skills`),
  });
}

interface MemoryHealth {
  chars: number;
  cap?: number;
  pct?: number;
}

export function useMemory() {
  return useQuery<{ context: string; insights: string; userProfile: string; health: { context: MemoryHealth; insights: MemoryHealth; userProfile: MemoryHealth } }>({
    queryKey: ['harness-memory'],
    queryFn: () => fetchJSON<{ context: string; insights: string; userProfile: string; health: { context: MemoryHealth; insights: MemoryHealth; userProfile: MemoryHealth } }>(`${API_BASE}/memory`),
  });
}