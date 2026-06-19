import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      recentWaves,
      totalStats,
      latestMetrics,
      githubSync,
      configs,
      exportModules,
      recentDecisions,
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
    ]);

    const waves = recentWaves.map((w) => ({
      ...w,
      _count: { decisions: w.decisions.length },
    }));

    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }

    return NextResponse.json({
      waves,
      totalStats: {
        totalWaves: totalStats[0],
        totalDecisions: totalStats[1],
        totalImprovements: totalStats[2],
        totalErrors: totalStats[3],
        githubCommits: githubSync?.totalCommits ?? 0,
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
    });
  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}