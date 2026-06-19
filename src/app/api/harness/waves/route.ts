import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const status = searchParams.get('status') ?? '';
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [waves, total] = await Promise.all([
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
    ]);

    return NextResponse.json({ waves, total, page, limit });
  } catch (error) {
    console.error('[WAVES] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch waves' }, { status: 500 });
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
    console.error('[WAVES] Error:', error);
    return NextResponse.json({ error: 'Failed to create wave' }, { status: 500 });
  }
}