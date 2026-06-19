import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

    return NextResponse.json({ context, insights, userProfile });
  } catch (error) {
    console.error('[MEMORY] Error:', error);
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
    console.error('[MEMORY] Error:', error);
    return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
  }
}