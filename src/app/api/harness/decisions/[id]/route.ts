import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

// Allowed fields for decision PATCH — prevents unrestricted body spread
const ALLOWED_FIELDS = new Set([
  'action', 'category', 'priority', 'description',
  'reasoning', 'targetFile', 'targetModule', 'outcome',
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Build safe update object with only whitelisted fields
    const data: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }
    // Special field: auto-set executedAt when action is 'executed'
    if (body.action === 'executed') {
      data.executedAt = new Date();
    }

    const decision = await db.harnessDecision.update({
      where: { id },
      data,
    });

    return NextResponse.json(decision);
  } catch (error) {
    logError('DECISION', error, { method: 'PATCH', decisionId: id });
    return NextResponse.json({ error: 'Failed to update decision' }, { status: 500 });
  }
}