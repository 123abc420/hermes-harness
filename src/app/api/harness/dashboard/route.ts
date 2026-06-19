import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fire-and-forget: cleanup stale running waves (>15 min old)
    db.harnessWave.updateMany({
      where: { status: 'running', startedAt: { lt: new Date(Date.now() - 15 * 60 * 1000) } },
      data: { status: 'interrupted', completedAt: new Date(Date.now() - 15 * 60 * 1000) },
    }).catch(() => {});

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
      db.harnessMetric.findMany({
        orderBy: { recordedAt: 'desc' },
        take: 100,
      }),
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

    // Real git commit count
    let gitCommitCount = githubSync?.totalCommits ?? 0;
    let recentCommits: { sha: string; message: string }[] = [];
    let lastSha = githubSync?.lastCommitSha ?? '';
    try {
      gitCommitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10);
      const logRaw = execSync('git log --oneline -5', { encoding: 'utf-8' }).trim();
      recentCommits = logRaw.split('\n').map((line) => {
        const sha = line.slice(0, 7);
        const message = line.slice(8).trim();
        return { sha, message };
      });
      if (recentCommits.length > 0) lastSha = recentCommits[0].sha;
    } catch { /* git not available */ }

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
    const recentSuccessRate = Math.round((recentCompleted / recentWavesForRate.length) * 100);

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
    // - Spec compliance: 40% (all 15 items done = 40pts)
    // - Recent success rate: 30% (100% = 30pts)
    // - Error trend decreasing: 20% (0 errors in recent waves = 20pts)
    // - GitHub connected: 10%
    let specScore = 0;
    try {
      const statsDir = join(process.cwd(), 'gh-sync', 'specs');
      const specFiles = readdirSync(statsDir).filter(f => f.endsWith('.md'));
      const memDir = join(process.cwd(), 'gh-sync', 'memory');
      const memFiles = readdirSync(memDir).filter(f => f.endsWith('.md'));
      // 15 spec items → count files + dynamic checks
      const fileScore = Math.min((specFiles.length + memFiles.length) / 6, 1); // ~6 spec/memory files
      specScore = fileScore;
    } catch { /* dir not found */ }

    let errorScore = 0;
    if (errorTrend.length >= 2) {
      const recentErrors = errorTrend.slice(-5).reduce((s, w) => s + w.errors, 0);
      errorScore = recentErrors === 0 ? 1 : Math.max(0, 1 - recentErrors / 5);
    } else if (errorTrend.length === 1 && errorTrend[0].errors === 0) {
      errorScore = 1;
    }

    const githubScore = githubSync?.status === 'connected' ? 1 : 0;
    const healthScore = Math.round(
      (specScore * 40) +
      ((recentSuccessRate / 100) * 30) +
      (errorScore * 20) +
      (githubScore * 10)
    );

    // Health score trend: derive from error trend + success rate signals
    let healthScoreTrend: 'up' | 'down' | 'stable' = 'stable';
    if (errorTrend.length >= 6) {
      const recent3Err = errorTrend.slice(-3).reduce((s, w) => s + w.errors, 0);
      const prev3Err = errorTrend.slice(-6, -3).reduce((s, w) => s + w.errors, 0);
      if (recent3Err < prev3Err) healthScoreTrend = 'up';
      else if (recent3Err > prev3Err) healthScoreTrend = 'down';
    }
    if (healthScoreTrend === 'stable') {
      if (recentSuccessRate > waveSuccessRate + 5) healthScoreTrend = 'up';
      else if (recentSuccessRate < waveSuccessRate - 5) healthScoreTrend = 'down';
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}