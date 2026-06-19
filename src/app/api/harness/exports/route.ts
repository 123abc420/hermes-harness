import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const exports = await db.harnessExport.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ exports });
  } catch (error) {
    console.error('[EXPORTS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch exports' }, { status: 500 });
  }
}