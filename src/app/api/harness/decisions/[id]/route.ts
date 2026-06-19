import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const decision = await db.harnessDecision.update({
      where: { id },
      data: {
        ...body,
        executedAt: body.action === 'executed' ? new Date() : undefined,
      },
    });

    return NextResponse.json(decision);
  } catch (error) {
    console.error('[DECISION] Error:', error);
    return NextResponse.json({ error: 'Failed to update decision' }, { status: 500 });
  }
}