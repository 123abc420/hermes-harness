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
  ResearchItem,
} from '@/store/harness-store';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Dashboard (main aggregation) ──────────────────────────
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['harness', 'dashboard'],
    queryFn: () => fetchJSON<DashboardData>('/api/harness/dashboard'),
    refetchInterval: 15_000,
  });
}

// ── Waves ────────────────────────────────────────────────
export function useWaves(page = 1, limit = 20, status = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return useQuery<{ waves: Wave[]; total: number; page: number; limit: number }>({
    queryKey: ['harness', 'waves', page, limit, status],
    queryFn: () => fetchJSON(`/api/harness/waves?${params}`),
  });
}

export function useWave(id: string | null) {
  return useQuery<Wave>({
    queryKey: ['harness', 'wave', id],
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

// ── Decisions ────────────────────────────────────────────
export function useDecisions(page = 1, limit = 20, category = '', action = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set('category', category);
  if (action) params.set('action', action);
  return useQuery<{ decisions: Decision[]; total: number; page: number; limit: number }>({
    queryKey: ['harness', 'decisions', page, limit, category, action],
    queryFn: () => fetchJSON(`/api/harness/decisions?${params}`),
  });
}

export function useCreateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Decision> & { waveId: string }) =>
      fetchJSON<Decision>('/api/harness/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['harness'] });
      toast.success('Decision created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Metrics ──────────────────────────────────────────────
export function useMetrics(metricKey = '') {
  const params = metricKey ? `?metricKey=${metricKey}` : '';
  return useQuery<{ metrics: Metric[] }>({
    queryKey: ['harness', 'metrics', metricKey],
    queryFn: () => fetchJSON<{ metrics: Metric[] }>(`/api/harness/metrics${params}`),
  });
}

// ── GitHub ───────────────────────────────────────────────
export function useGithubStatus() {
  return useQuery<GithubStatus>({
    queryKey: ['harness', 'github-status'],
    queryFn: () => fetchJSON<GithubStatus>('/api/harness/github/status'),
  });
}

export function useGithubSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJSON<GithubStatus>('/api/harness/github/sync', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['harness', 'github-status'] });
      qc.invalidateQueries({ queryKey: ['harness', 'dashboard'] });
      toast.success('Sync triggered to GitHub');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Spec ─────────────────────────────────────────────────
export function useSpec() {
  return useQuery<SpecData>({
    queryKey: ['harness', 'spec'],
    queryFn: () => fetchJSON<SpecData>('/api/harness/spec'),
  });
}

// ── Skills ───────────────────────────────────────────────
export function useSkills() {
  return useQuery<{ skills: Skill[] }>({
    queryKey: ['harness', 'skills'],
    queryFn: () => fetchJSON<{ skills: Skill[] }>('/api/harness/skills'),
  });
}

// ── Memory ───────────────────────────────────────────────
export function useMemory() {
  return useQuery<{ context: string; insights: string }>({
    queryKey: ['harness', 'memory'],
    queryFn: () => fetchJSON<{ context: string; insights: string }>('/api/harness/memory'),
  });
}

export function useSaveMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { context?: string; insights?: string }) =>
      fetchJSON('/api/harness/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['harness', 'memory'] });
      toast.success('Memory saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Research ─────────────────────────────────────────────
export function useResearch() {
  return useQuery<{ research: ResearchItem[] }>({
    queryKey: ['harness', 'research'],
    queryFn: () => fetchJSON<{ research: ResearchItem[] }>('/api/harness/research'),
  });
}

// ── Config ───────────────────────────────────────────────
export function useConfig() {
  return useQuery<{ config: Record<string, string> }>({
    queryKey: ['harness', 'config'],
    queryFn: () => fetchJSON<{ config: Record<string, string> }>('/api/harness/config'),
  });
}