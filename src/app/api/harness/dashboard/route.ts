import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
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
      latestMetrics,
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
        take: 50,
      }),
      db.gitHubSync.findFirst(),
      db.harnessConfig.findMany(),
      db.harnessExport.findMany({ orderBy: { createdAt: 'desc' } }),
      db.harnessDecision.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
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
    try {
      gitCommitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10);
    } catch { /* git not available */ }

    // Wave success rate
    const completedCount = waveCounts.find((w) => w.status === 'completed')?._count ?? 0;
    const totalWaveCount = waveCounts.reduce((s, w) => s + w._count, 0);
    const waveSuccessRate = totalWaveCount > 0 ? Math.round((completedCount / totalWaveCount) * 100) : 0;

    return NextResponse.json({
      waves,
      totalStats: {
        totalWaves: totalStats[0],
        totalDecisions: totalStats[1],
        totalImprovements: totalStats[2],
        totalErrors: totalStats[3],
        githubCommits: gitCommitCount,
        waveSuccessRate,
      },
      metrics: latestMetrics,
      githubStatus: githubSync ?? {
        status: 'disconnected',
        username: null,
        repoName: null,
        branch: 'main',
        totalCommits: 0,
      },
      config: configMap,
      exports: exportModules,
      recentDecisions,
      errorTrend: errorTrend.map((w) => ({
        wave: w.waveNumber,
        errors: w.errorsCount ?? 0,
        status: w.status,
      })),
    });
  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}