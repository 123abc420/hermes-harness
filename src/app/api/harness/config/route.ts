import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const configs = await db.harnessConfig.findMany();
    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }
    return NextResponse.json({ config: configMap });
  } catch (error) {
    console.error('[CONFIG] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, description } = body;
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value required' }, { status: 400 });
    }
    const config = await db.harnessConfig.upsert({
      where: { key },
      update: { value, description: description ?? null },
      create: { key, value, description: description ?? null },
    });
    return NextResponse.json(config);
  } catch (error) {
    console.error('[CONFIG] Error:', error);
    return NextResponse.json({ error: 'Failed to upsert config' }, { status: 500 });
  }
}