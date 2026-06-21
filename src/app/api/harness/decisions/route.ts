import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { logError } from '@/lib/logger';
import {
  createDecisionSchema,
  validationError,
} from '@/lib/schemas';

/** Derive a decision outcome from its action + wave status */
function deriveOutcome(action: string, waveStatus: string): string | null {
  if (waveStatus === 'completed' && action === 'executed') return 'success_verified';
  if (waveStatus === 'completed' && action === 'skipped') return 'skipped';
  if (waveStatus === 'failed' || waveStatus === 'error') return 'failed_wave';
  if (waveStatus === 'interrupted') return 'interrupted';
  if (action === 'failed') return 'failed';
  return null; // wave still running — leave null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const category = searchParams.get('category') ?? '';
    const action = searchParams.get('action') ?? '';
    const search = searchParams.get('search')?.trim() ?? '';
    const skip = (page - 1) * limit;

    const where: Prisma.HarnessDecisionWhereInput = {};
    if (category) where.category = category;
    if (action) where.action = action;
    if (search) where.description = { contains: search };

    const [decisions, total, categoryCounts, actionCounts] = await Promise.all([
      db.harnessDecision.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { wave: { select: { waveNumber: true, status: true } } },
      }),
      db.harnessDecision.count({ where }),
      db.harnessDecision.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
      }),
      db.harnessDecision.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
      }),
    ]);

    const countsByCategory: Record<string, number> = {};
    for (const c of categoryCounts) {
      countsByCategory[c.category] = c._count.category;
    }

    const countsByAction: Record<string, number> = {};
    for (const a of actionCounts) {
      countsByAction[a.action] = a._count.action;
    }

    return NextResponse.json({ decisions, total, page, limit, countsByCategory, countsByAction });
  } catch (error) {
    logError('DECISIONS', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(createDecisionSchema, body);
    }

    const { waveId, category, priority, action, description, reasoning, targetFile, targetModule, outcome } = parsed.data;

    const wave = await db.harnessWave.findUnique({ where: { id: waveId } });
    if (!wave) {
      return NextResponse.json({ error: 'Wave not found' }, { status: 404 });
    }

    // Auto-derive outcome if not provided: based on wave status + action
    const derivedOutcome = outcome ?? deriveOutcome(action, wave.status);

    const decision = await db.harnessDecision.create({
      data: {
        waveId,
        category,
        priority,
        action,
        description,
        reasoning: reasoning ?? null,
        targetFile: targetFile ?? null,
        targetModule: targetModule ?? null,
        outcome: derivedOutcome,
      },
    });

    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    logError('DECISIONS', error, { method: 'POST' });
    return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
  }
}