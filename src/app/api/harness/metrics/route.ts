import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import { createMetricSchema, validationError } from '@/lib/schemas';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const metricKey = searchParams.get('metricKey') ?? '';
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));

    const where = metricKey ? { metricKey } : {};
    const metrics = await db.harnessMetric.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      take: limit,
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    logError('METRICS', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createMetricSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(createMetricSchema, body);
    }

    const { metricKey, metricValue, waveId } = parsed.data;

    const prev = await db.harnessMetric.findFirst({
      where: { metricKey },
      orderBy: { recordedAt: 'desc' },
    });

    const change = prev ? metricValue - prev.metricValue : null;
    const changePercent = prev && prev.metricValue !== 0 ? (change! / prev.metricValue) * 100 : null;

    const metric = await db.harnessMetric.create({
      data: {
        metricKey,
        metricValue,
        previousValue: prev?.metricValue ?? null,
        change,
        changePercent,
        waveId: waveId ?? null,
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    logError('METRICS', error, { method: 'POST' });
    return NextResponse.json({ error: 'Failed to record metric' }, { status: 500 });
  }
}