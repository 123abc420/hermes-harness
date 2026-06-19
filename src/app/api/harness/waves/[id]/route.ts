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

    const wave = await db.harnessWave.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.completedAt && { completedAt: new Date(body.completedAt) }),
        ...(body.summary !== undefined && { summary: body.summary }),
        ...(body.decisionsCount !== undefined && { decisionsCount: body.decisionsCount }),
        ...(body.improvementsCount !== undefined && { improvementsCount: body.improvementsCount }),
        ...(body.errorsCount !== undefined && { errorsCount: body.errorsCount }),
        ...(body.metricsSnapshot && { metricsSnapshot: body.metricsSnapshot }),
      },
    });

    return NextResponse.json(wave);
  } catch (error) {
    console.error('[WAVE PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update wave' }, { status: 500 });
  }
}