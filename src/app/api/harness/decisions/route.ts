import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const category = searchParams.get('category') ?? '';
    const action = searchParams.get('action') ?? '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (action) where.action = action;

    const [decisions, total, categoryCounts] = await Promise.all([
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
        _count: { category: true },
      }),
    ]);

    const countsByCategory: Record<string, number> = {};
    for (const c of categoryCounts) {
      countsByCategory[c.category] = c._count.category;
    }

    return NextResponse.json({ decisions, total, page, limit, countsByCategory });
  } catch (error) {
    console.error('[DECISIONS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { waveId, category, priority, action, description, reasoning, targetFile, targetModule } = body;

    if (!waveId || !category || !description) {
      return NextResponse.json({ error: 'waveId, category, and description are required' }, { status: 400 });
    }

    const wave = await db.harnessWave.findUnique({ where: { id: waveId } });
    if (!wave) {
      return NextResponse.json({ error: 'Wave not found' }, { status: 404 });
    }

    const decision = await db.harnessDecision.create({
      data: {
        waveId,
        category,
        priority: priority ?? 'medium',
        action: action ?? 'planned',
        description,
        reasoning: reasoning ?? null,
        targetFile: targetFile ?? null,
        targetModule: targetModule ?? null,
      },
    });

    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    console.error('[DECISIONS] Error:', error);
    return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
  }
}