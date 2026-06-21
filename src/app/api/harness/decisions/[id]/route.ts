import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import {
  updateDecisionSchema,
  validationError,
} from '@/lib/schemas';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => null);
    const parsed = updateDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(updateDecisionSchema, body);
    }

    const data: Record<string, unknown> = { ...parsed.data };

    // Auto-set executedAt when action is 'executed'
    if (data.action === 'executed') {
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