import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const status = searchParams.get('status') ?? '';
    const search = searchParams.get('search')?.trim() ?? '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.summary = { contains: search };

    const [waves, total, statusCounts] = await Promise.all([
      db.harnessWave.findMany({
        where,
        orderBy: { waveNumber: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { decisions: true } },
        },
      }),
      db.harnessWave.count({ where }),
      db.harnessWave.groupBy({ by: ['status'], _count: true }),
    ]);

    const countsByStatus: Record<string, number> = Object.fromEntries(
      statusCounts.map(s => [s.status, s._count])
    );

    return NextResponse.json({ waves, total, page, limit, countsByStatus });
  } catch (error) {
    logError('WAVES', error);
    return NextResponse.json({ error: 'Failed to fetch waves' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Clean up stale "running" waves older than 15 minutes
    const staleThreshold = new Date(Date.now() - 15 * 60 * 1000);
    const result = await db.harnessWave.updateMany({
      where: {
        status: 'running',
        startedAt: { lt: staleThreshold },
      },
      data: {
        status: 'interrupted',
        completedAt: staleThreshold,
        errorsCount: { increment: 0 },
      },
    });

    // Also update any "running" waves that have completedAt set (wave finished but status not updated)
    const finishedButStuck = await db.harnessWave.updateMany({
      where: {
        status: 'running',
        completedAt: { not: null },
      },
      data: { status: 'completed' },
    });

    const totalFixed = result.count + finishedButStuck.count;

    return NextResponse.json({
      message: 'Stale wave cleanup complete',
      interrupted: result.count,
      completedFromStuck: finishedButStuck.count,
      totalFixed,
    });
  } catch (error) {
    logError('WAVES', error, { method: 'PATCH' });
    return NextResponse.json({ error: 'Failed to cleanup waves' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lastWave = await db.harnessWave.findFirst({
      orderBy: { waveNumber: 'desc' },
      select: { waveNumber: true },
    });
    const nextNumber = (lastWave?.waveNumber ?? 0) + 1;

    const wave = await db.harnessWave.create({
      data: {
        waveNumber: nextNumber,
        status: 'running',
        summary: body.summary ?? null,
      },
    });

    return NextResponse.json(wave, { status: 201 });
  } catch (error) {
    logError('WAVES', error, { method: 'POST' });
    return NextResponse.json({ error: 'Failed to create wave' }, { status: 500 });
  }
}