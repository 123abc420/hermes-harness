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