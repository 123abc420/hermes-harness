import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { logError } from '@/lib/logger';
import { createWaveSchema, validationErrorFromResult } from '@/lib/schemas';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const status = searchParams.get('status') ?? '';
    const search = searchParams.get('search')?.trim() ?? '';
    const skip = (page - 1) * limit;

    const where: Prisma.HarnessWaveWhereInput = {};
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
    const body = await req.json().catch(() => null);
    const parsed = createWaveSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorFromResult(parsed.error);
    }

    const { waveNumber, status, summary, decisionsCount, improvementsCount, errorsCount } = parsed.data;

    // If waveNumber is provided, upsert: update existing or create with that number.
    if (waveNumber != null) {
      const existing = await db.harnessWave.findFirst({
        where: { waveNumber },
      });

      if (existing) {
        // Update existing wave with provided fields
        const updateData: Prisma.HarnessWaveUpdateInput = {};
        if (status != null) {
          updateData.status = status;
        }
        if (summary != null) {
          updateData.summary = summary;
        }
        if (decisionsCount != null) {
          updateData.decisionsCount = decisionsCount;
        }
        if (improvementsCount != null) {
          updateData.improvementsCount = improvementsCount;
        }
        if (errorsCount != null) {
          updateData.errorsCount = errorsCount;
        }
        if ((status === 'completed' || status === 'failed') && !existing.completedAt) {
          updateData.completedAt = new Date();
        }

        // If nothing to update, return existing
        if (Object.keys(updateData).length === 0) {
          return NextResponse.json(existing);
        }

        const updated = await db.harnessWave.update({
          where: { id: existing.id },
          data: updateData,
        });
        return NextResponse.json(updated);
      }

      // No existing wave with this number — create with the specified number
      const wave = await db.harnessWave.create({
        data: {
          waveNumber,
          status: status ?? 'running',
          summary: summary ?? null,
          decisionsCount: decisionsCount ?? 0,
          improvementsCount: improvementsCount ?? 0,
          errorsCount: errorsCount ?? 0,
        },
      });
      return NextResponse.json(wave, { status: 201 });
    }

    // No waveNumber — auto-assign next number (original behavior)
    const lastWave = await db.harnessWave.findFirst({
      orderBy: { waveNumber: 'desc' },
      select: { waveNumber: true },
    });
    const nextNumber = (lastWave?.waveNumber ?? 0) + 1;

    const wave = await db.harnessWave.create({
      data: {
        waveNumber: nextNumber,
        status: status ?? 'running',
        summary: summary ?? null,
        decisionsCount: decisionsCount ?? 0,
        improvementsCount: improvementsCount ?? 0,
        errorsCount: errorsCount ?? 0,
      },
    });

    return NextResponse.json(wave, { status: 201 });
  } catch (error) {
    logError('WAVES', error, { method: 'POST' });
    return NextResponse.json({ error: 'Failed to create/update wave' }, { status: 500 });
  }
}