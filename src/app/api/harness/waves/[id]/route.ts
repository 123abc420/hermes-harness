import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { logError, logDebug } from '@/lib/logger';
import {
  patchWaveSchema,
  validationErrorFromResult,
} from '@/lib/schemas';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wave = await db.harnessWave.findUnique({
      where: { id },
      include: { decisions: { orderBy: { createdAt: 'asc' } } },
    });

    if (!wave) {
      return NextResponse.json({ error: 'Wave not found' }, { status: 404 });
    }

    return NextResponse.json(wave);
  } catch (error) {
    logError('WAVE', error);
    return NextResponse.json({ error: 'Failed to fetch wave' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = patchWaveSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorFromResult(parsed.error);
    }

    const data = parsed.data;

    const updateData: Prisma.HarnessWaveUpdateInput = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.decisionsCount !== undefined) updateData.decisionsCount = data.decisionsCount;
    if (data.improvementsCount !== undefined) updateData.improvementsCount = data.improvementsCount;
    if (data.errorsCount !== undefined) updateData.errorsCount = data.errorsCount;
    if (data.metricsSnapshot !== undefined) updateData.metricsSnapshot = data.metricsSnapshot;

    const wave = await db.harnessWave.update({
      where: { id },
      data: updateData,
    });

    // Cascade: when wave is completed/failed/interrupted, backfill outcomes for its decisions
    if (data.status && data.status !== 'running' && data.status !== 'pending') {
      await db.harnessDecision.updateMany({
        where: { waveId: id, outcome: null },
        data: {
          outcome:
            data.status === 'completed' ? 'success_verified' :
            data.status === 'failed' || data.status === 'error' ? 'failed_wave' :
            'interrupted',
        },
      }).catch((e) => { logDebug('WAVE', 'Decision outcome backfill failed', { waveId: id, error: String(e) }); });
    }

    return NextResponse.json(wave);
  } catch (error) {
    logError('WAVE', error, { method: 'PATCH' });
    return NextResponse.json({ error: 'Failed to update wave' }, { status: 500 });
  }
}