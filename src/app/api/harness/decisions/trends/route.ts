import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    // Find the midpoint wave number to split early vs recent
    const waveStats = await db.harnessWave.aggregate({
      _min: { waveNumber: true },
      _max: { waveNumber: true },
      _count: true,
    });
    const minWave = waveStats._min.waveNumber ?? 1;
    const maxWave = waveStats._max.waveNumber ?? 1;
    const midWave = Math.floor((minWave + maxWave) / 2);

    // Get category distribution for both halves via raw query
    const trends = await db.$queryRaw<
      Array<{ category: string; recent_count: bigint; earlier_count: bigint }>
    >(Prisma.sql`
      SELECT d.category,
        CAST(SUM(CASE WHEN w."waveNumber" >= ${midWave} THEN 1 ELSE 0 END) AS INTEGER) as recent_count,
        CAST(SUM(CASE WHEN w."waveNumber" < ${midWave} THEN 1 ELSE 0 END) AS INTEGER) as earlier_count
      FROM "HarnessDecision" d
      JOIN "HarnessWave" w ON d."waveId" = w.id
      GROUP BY d.category
      ORDER BY recent_count DESC
    `);

    return NextResponse.json({
      trends: trends.map(t => ({
        category: t.category,
        recent: Number(t.recent_count),
        earlier: Number(t.earlier_count),
      })),
      range: {
        earlier: { min: minWave, max: midWave - 1 },
        recent: { min: midWave, max: maxWave },
      },
    });
  } catch (error) {
    logError('DECISIONS/TRENDS', error);
    return NextResponse.json({ error: 'Failed to fetch decision trends' }, { status: 500 });
  }
}