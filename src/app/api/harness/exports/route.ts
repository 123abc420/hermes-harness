import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const exports = await db.harnessExport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ exports });
  } catch (error) {
    logError('EXPORTS', error);
    return NextResponse.json({ error: 'Failed to fetch exports' }, { status: 500 });
  }
}