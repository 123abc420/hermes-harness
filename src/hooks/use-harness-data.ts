'use client';

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

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useHarnessDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['harness-dashboard'],
    queryFn: () => fetchJSON<DashboardData>('/api/harness/dashboard'),
    refetchInterval: 30_000,
  });
}

export function useWaves(page = 1, limit = 20, status = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return useQuery<{ waves: Wave[]; total: number; page: number; limit: number }>({
    queryKey: ['harness-waves', page, limit, status],
    queryFn: () => fetchJSON(`/api/harness/waves?${params}`),
  });
}

export function useWave(id: string | null) {
  return useQuery<Wave>({
    queryKey: ['harness-wave', id],
    queryFn: () => fetchJSON<Wave>(`/api/harness/waves/${id!}`),
    enabled: !!id,
  });
}

export function useCreateWave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (summary?: string) =>
      fetchJSON<Wave>('/api/harness/waves', {
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
  return useQuery<{ decisions: Decision[]; total: number; page: number; limit: number }>({
    queryKey: ['harness-decisions', page, limit, category],
    queryFn: () => fetchJSON(`/api/harness/decisions?${params}`),
  });
}

export function useMetrics(metricKey = '') {
  const params = metricKey ? `?metricKey=${metricKey}` : '';
  return useQuery<{ metrics: Metric[] }>({
    queryKey: ['harness-metrics', metricKey],
    queryFn: () => fetchJSON<{ metrics: Metric[] }>(`/api/harness/metrics${params}`),
  });
}

export function useGithubStatus() {
  return useQuery<GithubStatus>({
    queryKey: ['harness-github-status'],
    queryFn: () => fetchJSON<GithubStatus>('/api/harness/github/status'),
  });
}

export function useGithubSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJSON<GithubStatus>('/api/harness/github/sync', { method: 'POST' }),
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
    queryFn: () => fetchJSON<SpecData>('/api/harness/spec'),
  });
}

export function useSkills() {
  return useQuery<{ skills: Skill[] }>({
    queryKey: ['harness-skills'],
    queryFn: () => fetchJSON<{ skills: Skill[] }>('/api/harness/skills'),
  });
}

export function useMemory() {
  return useQuery<{ context: string; insights: string }>({
    queryKey: ['harness-memory'],
    queryFn: () => fetchJSON<{ context: string; insights: string }>('/api/harness/memory'),
  });
}