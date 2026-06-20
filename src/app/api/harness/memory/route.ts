import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { logError } from '@/lib/logger';

async function readFileSafe(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export async function GET() {
  try {
    const memoryDir = path.join(process.cwd(), 'gh-sync', 'memory');
    const context = await readFileSafe(path.join(memoryDir, 'context.md'));
    const insights = await readFileSafe(path.join(memoryDir, 'insights.md'));
    const userProfile = await readFileSafe(path.join(memoryDir, 'user_profile.md'));

    // Token caps from SPEC: context ~800 tokens (~3200 chars), insights ~2000 tokens (~8000 chars)
    const CONTEXT_CAP = 3200;
    const INSIGHTS_CAP = 8000;

    return NextResponse.json({
      context,
      insights,
      userProfile,
      health: {
        context: { chars: context.length, cap: CONTEXT_CAP, pct: Math.round((context.length / CONTEXT_CAP) * 100) },
        insights: { chars: insights.length, cap: INSIGHTS_CAP, pct: Math.round((insights.length / INSIGHTS_CAP) * 100) },
        userProfile: { chars: userProfile.length },
      },
    });
  } catch (error) {
    logError('MEMORY', error);
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { context, insights } = body;
    const memoryDir = path.join(process.cwd(), 'gh-sync', 'memory');

    await fs.mkdir(memoryDir, { recursive: true });

    if (context !== undefined) {
      await fs.writeFile(path.join(memoryDir, 'context.md'), context, 'utf-8');
    }
    if (insights !== undefined) {
      await fs.writeFile(path.join(memoryDir, 'insights.md'), insights, 'utf-8');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('MEMORY', error, { method: 'POST' });
    return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
  }
}