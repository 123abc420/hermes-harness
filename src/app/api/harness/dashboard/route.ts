import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { db } from '@/lib/db';
import { getGitData } from '@/lib/git';
import { logError, logDebug } from '@/lib/logger';

const execFileAsync = promisify(execFile);

// ── Build health cache (module-level, survives between requests) ────
let buildHealthCache: {
  lintPassed: boolean;
  lintErrors: number;
  lintWarnings: number;
  checkedAt: string;
} | null = null;
let buildHealthCheckedAt = 0;
const BUILD_HEALTH_TTL = 5 * 60 * 1000; // 5 minutes

// ── Full dashboard response cache ────
let dashboardCache: { data: unknown; timestamp: number } | null = null;
const DASHBOARD_TTL = 12 * 1000; // 12 seconds — fast enough for live feel, reduces DB load

async function getBuildHealth() {
  const now = Date.now();
  if (buildHealthCache && now - buildHealthCheckedAt < BUILD_HEALTH_TTL) {
    return buildHealthCache;
  }
  let output = '';
  let exitCode = 0;
  try {
    const { stdout } = await execFileAsync('bun', ['run', 'lint'], {
      encoding: 'utf-8',
      timeout: 60_000,
    });
    output = stdout;
  } catch (err: unknown) {
    // bun run lint exits with code 1 when lint errors are found
    output = (err instanceof Error ? (err as { stdout?: string }).stdout || err.message : '') || String(err);
    exitCode = (err as { status?: number })?.status ?? 1;
  }
  const hasErrors = exitCode !== 0 && output.length > 0;
  buildHealthCache = {
    lintPassed: !hasErrors,
    lintErrors: hasErrors ? (output.match(/\berror\b/gi)?.length ?? 1) : 0,
    lintWarnings: (output.match(/\bwarning\b/gi)?.length ?? 0),
    checkedAt: new Date().toISOString(),
  };
  buildHealthCheckedAt = now;
  return buildHealthCache;
}

export async function GET() {
  try {
    // Return cached response if fresh
    const now = Date.now();
    if (dashboardCache && now - dashboardCache.timestamp < DASHBOARD_TTL) {
      return NextResponse.json(dashboardCache.data);
    }

    // Fire-and-forget: cleanup stale running waves (>15 min old)
    db.harnessWave.updateMany({
      where: { status: 'running', startedAt: { lt: new Date(Date.now() - 15 * 60 * 1000) } },
      data: { status: 'interrupted', completedAt: new Date(Date.now() - 15 * 60 * 1000) },
    }).catch((e) => { logDebug('DASHBOARD', 'Stale wave cleanup failed', { error: String(e) }); });

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
    ] = await Promise.all([
      db.harnessWave.findMany({
        orderBy: { waveNumber: 'desc' },
        take: 10,
        include: { decisions: true },
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
      }).catch(() => [] as unknown[]),
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
    ]);

    const waves = recentWaves.map((w) => ({
      ...w,
      _count: { decisions: w.decisions.length },
    }));

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

    // Recent success rate (last 5 waves)
    const recentWavesForRate = await db.harnessWave.findMany({
      orderBy: { waveNumber: 'desc' },
      take: 5,
      select: { status: true },
    });
    const recentCompleted = recentWavesForRate.filter((w) => w.status === 'completed').length;
    const recentSuccessRate = recentWavesForRate.length > 0
      ? Math.round((recentCompleted / recentWavesForRate.length) * 100)
      : 0;

    // Skills count (md files in gh-sync/skills/, excluding _template.md)
    let skillsCount = 0;
    try {
      const skillsDir = join(process.cwd(), 'gh-sync', 'skills');
      const files = readdirSync(skillsDir).filter(f => f.endsWith('.md') && f !== '_template.md');
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
      const specFiles = readdirSync(specsDir).filter(f => f.endsWith('.md'));
      const memDir = join(process.cwd(), 'gh-sync', 'memory');
      const memFiles = readdirSync(memDir).filter(f => f.endsWith('.md'));
      // SPEC.md at gh-sync root + specs/*.md + memory/*.md = expected files
      let expectedFiles = 0;
      try { statSync(join(process.cwd(), 'gh-sync', 'SPEC.md')); expectedFiles++; } catch { /* */ }
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
      buildHealth: await getBuildHealth(),
    };

    // Cache the response
    dashboardCache = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    logError('DASHBOARD', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}