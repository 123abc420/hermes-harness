import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import { updateConfigSchema, validationError } from '@/lib/schemas';

export async function GET() {
  try {
    const configs = await db.harnessConfig.findMany();
    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }
    return NextResponse.json({ config: configMap });
  } catch (error) {
    logError('CONFIG', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = updateConfigSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(updateConfigSchema, body);
    }

    const { key, value, description } = parsed.data;
    const config = await db.harnessConfig.upsert({
      where: { key },
      update: { value, description: description ?? null },
      create: { key, value, description: description ?? null },
    });
    return NextResponse.json(config);
  } catch (error) {
    logError('CONFIG', error, { method: 'POST' });
    return NextResponse.json({ error: 'Failed to upsert config' }, { status: 500 });
  }
}