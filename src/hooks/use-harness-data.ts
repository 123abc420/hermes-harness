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
  Skill,
} from '@/store/harness-store';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { fetchJSON } from '@/lib/fetch-json';

const API_BASE = '/api/harness';

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

export function useWaves(page = 1, limit = 20, status = '', search = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  return useQuery<{ waves: Wave[]; total: number; page: number; limit: number; countsByStatus: Record<string, number> }>({
    queryKey: ['harness-waves', page, limit, status, search],
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

export function useDecisions(page = 1, limit = 50, category = '', search = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  return useQuery<{ decisions: Decision[]; total: number; page: number; limit: number; countsByCategory: Record<string, number>; countsByAction: Record<string, number> }>({
    queryKey: ['harness-decisions', page, limit, category, search],
    queryFn: () => fetchJSON(`${API_BASE}/decisions?${params}`),
  });
}

export function useGithubStatus() {
  return useQuery<GithubStatus>({
    queryKey: ['harness-github-status'],
    queryFn: () => fetchJSON<GithubStatus>(`${API_BASE}/github/status`),
    staleTime: 60_000,
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

export function useSkills() {
  return useQuery<{ skills: Skill[] }>({
    queryKey: ['harness-skills'],
    queryFn: () => fetchJSON<{ skills: Skill[] }>(`${API_BASE}/skills`),
    staleTime: 60_000,
  });
}

interface TrendsData {
  trends: { category: string; recent: number; earlier: number }[];
  range: { earlier: { min: number; max: number }; recent: { min: number; max: number } };
}

export type { TrendsData };

export function useDecisionTrends() {
  return useQuery<TrendsData>({
    queryKey: ['decision-trends'],
    queryFn: () => fetchJSON<TrendsData>(`${API_BASE}/decisions/trends`),
    staleTime: 5 * 60_000,
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
    staleTime: 30_000,
  });
}