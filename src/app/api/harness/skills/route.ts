import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const skillsDir = path.join(process.cwd(), 'skills');
    let files: string[] = [];
    try {
      files = await fs.readdir(skillsDir);
    } catch {
      // skills directory doesn't exist yet
    }

    const skills = await Promise.all(
      files
        .filter((f) => f.endsWith('.md'))
        .map(async (f) => {
          const content = await fs.readFile(path.join(skillsDir, f), 'utf-8');
          const titleMatch = content.match(/^#\s+(.+)/m);
          return {
            name: f,
            title: titleMatch?.[1] ?? f.replace('.md', ''),
            content,
          };
        })
    );

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('[SKILLS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}