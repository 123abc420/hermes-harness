import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const SKILLS_DIR = join(process.cwd(), 'gh-sync', 'skills');

interface SkillMeta {
  name: string;
  version?: string;
  category?: string;
  trigger?: string;
  created?: string;
}

function parseFrontmatter(content: string): { meta: SkillMeta; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: { name: 'unknown' }, body: content };

  const meta: SkillMeta = { name: 'unknown' };
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (m) {
      const key = m[1] as keyof SkillMeta;
      (meta as Record<string, unknown>)[key] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return { meta, body: match[2] };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let files: string[];
    try {
      files = readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'));
    } catch {
      files = [];
    }

    const skills = files.map(filename => {
      const raw = readFileSync(join(SKILLS_DIR, filename), 'utf-8');
      const { meta, body } = parseFrontmatter(raw);
      const description = body.split('\n').find(l => l.trim().length > 0 && !l.startsWith('#'))?.trim() || '';
      return {
        name: meta.name || filename.replace('.md', ''),
        version: meta.version || null,
        category: meta.category || null,
        trigger: meta.trigger || null,
        created: meta.created || null,
        description: description.slice(0, 200),
        filename,
      };
    });

    const filtered = search
      ? skills.filter(s =>
          s.name.toLowerCase().includes(search) ||
          s.category?.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search),
        )
      : skills;

    return NextResponse.json({ skills: filtered.slice(0, limit) });
  } catch (error) {
    logError('SKILLS', error);
    return NextResponse.json({ error: 'Failed to read skills' }, { status: 500 });
  }
}