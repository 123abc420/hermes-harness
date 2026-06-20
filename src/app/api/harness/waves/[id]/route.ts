import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    console.error('[WAVE] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch wave' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {
      ...(body.status && { status: body.status }),
      ...(body.completedAt && { completedAt: new Date(body.completedAt) }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.decisionsCount !== undefined && { decisionsCount: body.decisionsCount }),
      ...(body.improvementsCount !== undefined && { improvementsCount: body.improvementsCount }),
      ...(body.errorsCount !== undefined && { errorsCount: body.errorsCount }),
      ...(body.metricsSnapshot && { metricsSnapshot: body.metricsSnapshot }),
    };

    const wave = await db.harnessWave.update({
      where: { id },
      data: updateData,
    });

    // Cascade: when wave is completed/failed/interrupted, backfill outcomes for its decisions
    if (body.status && body.status !== 'running' && body.status !== 'pending') {
      await db.harnessDecision.updateMany({
        where: { waveId: id, outcome: null },
        data: {
          outcome:
            body.status === 'completed' ? 'success_verified' :
            body.status === 'failed' || body.status === 'error' ? 'failed_wave' :
            'interrupted',
        },
      }).catch(() => { /* non-critical */ });
    }

    return NextResponse.json(wave);
  } catch (error) {
    console.error('[WAVE PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update wave' }, { status: 500 });
  }
}