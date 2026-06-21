import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';
import { getGitData } from '@/lib/git';
import { logError, logDebug } from '@/lib/logger';
import type { HarnessWave, HarnessMetric, HarnessDecision, HarnessExport, GitHubSync } from '@prisma/client';

// ── Dashboard response cache (typed with Prisma output shapes) ────
interface DashboardResponse {
  waves: (HarnessWave & { _count: { decisions: number } })[];
  totalStats: { totalWaves: number; totalDecisions: number; totalImprovements: number; totalErrors: number; githubCommits: number; waveSuccessRate: number; recentSuccessRate: number };
  metrics: (HarnessMetric | { metricKey: string; metricValue: number })[];
  latestMetrics: Record<string, number>;
  githubStatus: Omit<GitHubSync, 'id' | 'createdAt' | 'updatedAt'> | null;
  config: Record<string, string>;
  exports: HarnessExport[];
  recentDecisions: (HarnessDecision & { wave: { waveNumber: number; status: string } })[];
  errorTrend: { wave: number; errors: number; status: string }[];
  skillsCount: number;
  healthScore: number;
  healthScoreTrend: 'up' | 'down' | 'stable';
  healthBreakdown: { spec: number; success: number; errors: number; github: number };
}

let dashboardCache: { data: DashboardResponse; timestamp: number } | null = null;
const DASHBOARD_TTL = 12 * 1000; // 12 seconds — fast enough for live feel, reduces DB load

export async function GET() {
  try {
    // Return cached response if fresh
    const now = Date.now();
    if (dashboardCache && now - dashboardCache.timestamp < DASHBOARD_TTL) {
      return NextResponse.json(dashboardCache.data);
    }

    // Fire-and-forget: cleanup stale running waves (>15 min old)
    const staleCutoff = new Date(Date.now() - 15 * 60 * 1000);
    db.harnessWave.updateMany({
      where: { status: 'running', startedAt: { lt: staleCutoff } },
      data: { status: 'interrupted', completedAt: staleCutoff },
    }).catch((e) => { logError('DASHBOARD', 'Stale wave cleanup failed', { error: String(e) }); });

    // Also fix waves that have completedAt set but status still "running"
    db.harnessWave.updateMany({
      where: { status: 'running', completedAt: { not: null } },
      data: { status: 'completed' },
    }).catch((e) => { logError('DASHBOARD', 'CompletedAt cleanup failed', { error: String(e) }); });

    const [
      recentWaves,
      totalStats,
      metricsRaw,
      githubSync,
      configs,
      exportModules,
      recentDecisions,
      errorTrend,
      waveCounts,
      recentWavesForRate,
    ] = await Promise.all([
      // Fetch count-only instead of full decision objects (perf: avoids loading N decision rows per wave)
      db.harnessWave.findMany({
        orderBy: { waveNumber: 'desc' },
        take: 10,
        include: { _count: { select: { decisions: true } } },
      }),
      Promise.all([
        db.harnessWave.count(),
        db.harnessDecision.count(),
        db.harnessDecision.count({ where: { action: 'executed' } }),
        db.harnessDecision.count({ where: { action: 'failed' } }),
      ]),
      // Metrics: wrap in try/catch so bad rows can't crash the entire dashboard
      db.harnessMetric.findMany({
        orderBy: { recordedAt: 'desc' },
        take: 100,
      }).catch((e) => { logDebug('DASHBOARD', 'Metrics query failed (bad row)', { error: String(e) }); return [] as HarnessMetric[]; }),
      db.gitHubSync.findFirst(),
      db.harnessConfig.findMany(),
      db.harnessExport.findMany({ orderBy: { createdAt: 'desc' } }),
      db.harnessDecision.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { wave: { select: { waveNumber: true, status: true } } },
      }),
      // Error rate trend: errors per wave, last 20 waves
      db.harnessWave.findMany({
        orderBy: { waveNumber: 'asc' },
        select: { waveNumber: true, errorsCount: true, status: true },
        take: 20,
      }),
      // Wave status counts for success rate
      db.harnessWave.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Recent 5 waves for success rate (merged into batch — eliminates extra round-trip)
      db.harnessWave.findMany({
        orderBy: { waveNumber: 'desc' },
        take: 5,
        select: { status: true },
      }),
    ]);

    const waves = recentWaves as (HarnessWave & { _count: { decisions: number } })[];

    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }

    // Real git data from shared utility (async — no event loop blocking)
    const git = await getGitData();
    const gitCommitCount = git.count;
    const recentCommits = git.commits;
    const lastSha = git.lastSha ?? githubSync?.lastCommitSha ?? '';

    // Wave success rate (overall)
    const completedCount = waveCounts.find((w) => w.status === 'completed')?._count ?? 0;
    const totalWaveCount = waveCounts.reduce((s, w) => s + w._count, 0);
    const waveSuccessRate = totalWaveCount > 0 ? Math.round((completedCount / totalWaveCount) * 100) : 0;

    // Recent success rate (last 5 waves) — already fetched in batch above
    const recentCompleted = recentWavesForRate.filter((w) => w.status === 'completed').length;
    const recentSuccessRate = recentWavesForRate.length > 0
      ? Math.round((recentCompleted / recentWavesForRate.length) * 100)
      : 0;

    // Skills count (md files in gh-sync/skills/, excluding _template.md)
    let skillsCount = 0;
    try {
      const skillsDir = join(process.cwd(), 'gh-sync', 'skills');
      const files = (await readdir(skillsDir)).filter(f => f.endsWith('.md') && f !== '_template.md');
      skillsCount = files.length;
    } catch { /* skills dir not found */ }

    // Derive latest value per metricKey
    const latestMetrics: Record<string, number> = {};
    for (const m of metricsRaw) {
      if (!(m.metricKey in latestMetrics)) {
        latestMetrics[m.metricKey] = m.metricValue;
      }
    }

    // Health Score (0-100): weighted composite
    // - Spec compliance: 40% (all spec/memory files present = 40pts)
    // - Recent success rate: 30% (100% = 30pts)
    // - Error trend decreasing: 20% (0 errors in recent waves = 20pts)
    // - GitHub active: 10% (git repo has commits = 10pts)
    let specScore = 0;
    try {
      const specsDir = join(process.cwd(), 'gh-sync', 'specs');
      const specFiles = (await readdir(specsDir)).filter(f => f.endsWith('.md'));
      const memDir = join(process.cwd(), 'gh-sync', 'memory');
      const memFiles = (await readdir(memDir)).filter(f => f.endsWith('.md'));
      // SPEC.md at gh-sync root + specs/*.md + memory/*.md = expected files
      let expectedFiles = 0;
      try { await stat(join(process.cwd(), 'gh-sync', 'SPEC.md')); expectedFiles++; } catch { /* */ }
      expectedFiles += specFiles.length + memFiles.length;
      // Normalize: 7 total expected files (1 SPEC.md + 2 specs + 3 memory + 1 user_profile)
      specScore = Math.min(expectedFiles / 7, 1);
    } catch { /* dir not found */ }

    let errorScore = 0;
    if (errorTrend.length >= 2) {
      const recentErrors = errorTrend.slice(-5).reduce((s, w) => s + (w.errorsCount ?? 0), 0);
      errorScore = recentErrors === 0 ? 1 : Math.max(0, 1 - recentErrors / 5);
    } else if (errorTrend.length === 1 && (errorTrend[0].errorsCount ?? 0) === 0) {
      errorScore = 1;
    }

    const successScore = recentSuccessRate / 100;
    // GitHub score: use live git data (reliable) instead of stale DB status field
    const githubScore = gitCommitCount > 0 ? 1 : 0;
    const healthScore = Math.round(
      (specScore * 40) +
      (successScore * 30) +
      (errorScore * 20) +
      (githubScore * 10)
    );

    // Health score trend: derive from error trend + success rate signals
    let healthScoreTrend: 'up' | 'down' | 'stable' = 'stable';
    if (errorTrend.length >= 6) {
      const recent3Err = errorTrend.slice(-3).reduce((s, w) => s + (w.errorsCount ?? 0), 0);
      const prev3Err = errorTrend.slice(-6, -3).reduce((s, w) => s + (w.errorsCount ?? 0), 0);
      if (recent3Err < prev3Err) healthScoreTrend = 'up';
      else if (recent3Err > prev3Err) healthScoreTrend = 'down';
    }
    if (healthScoreTrend === 'stable') {
      if (recentSuccessRate > waveSuccessRate + 5) healthScoreTrend = 'up';
      else if (recentSuccessRate < waveSuccessRate - 5) healthScoreTrend = 'down';
    }

    const data = {
      waves,
      totalStats: {
        totalWaves: totalStats[0],
        totalDecisions: totalStats[1],
        totalImprovements: totalStats[2],
        totalErrors: totalStats[3],
        githubCommits: gitCommitCount,
        waveSuccessRate,
        recentSuccessRate,
      },
      metrics: metricsRaw,
      latestMetrics,
      githubStatus: {
        ...(githubSync ?? {
          status: 'disconnected',
          username: null,
          repoName: null,
          branch: 'main',
          totalCommits: 0,
          lastCommitSha: '',
          lastSyncAt: null,
          errorMessage: null,
        }),
        totalCommits: gitCommitCount,
        lastCommitSha: lastSha,
        recentCommits,
      },
      config: configMap,
      exports: exportModules,
      recentDecisions,
      errorTrend: errorTrend.map((w) => ({
        wave: w.waveNumber,
        errors: w.errorsCount ?? 0,
        status: w.status,
      })),
      skillsCount,
      healthScore,
      healthScoreTrend,
      healthBreakdown: {
        spec: Math.round(specScore * 40),
        success: Math.round(successScore * 30),
        errors: Math.round(errorScore * 20),
        github: Math.round(githubScore * 10),
      },

    };

    // Cache the response
    dashboardCache = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    logError('DASHBOARD', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}