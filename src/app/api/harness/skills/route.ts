import { NextResponse } from 'next/server';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface ParsedSkill {
  name: string;
  title: string;
  content: string;
  version?: string;
  created?: string;
  category?: string;
  trigger?: string;
}

function parseYamlFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const yamlLines = match[1];
  const body = match[2];
  const meta: Record<string, string> = {};

  for (const line of yamlLines.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // Strip surrounding quotes (single or double)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }

  return { meta, body: body.trim() };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') ?? '').toLowerCase().trim();
    const limit = parseInt(searchParams.get('limit') ?? '100', 10);
    const skillsDir = join(process.cwd(), 'gh-sync', 'skills');
    let files: string[];
    try {
      files = readdirSync(skillsDir).filter(f => f.endsWith('.md') && f !== '_template.md');
    } catch {
      return NextResponse.json({ skills: [] });
    }

    const skills: ParsedSkill[] = files.map(filename => {
      const raw = readFileSync(join(skillsDir, filename), 'utf-8');
      const { meta, body } = parseYamlFrontmatter(raw);
      const name = meta.name ?? filename.replace('.md', '');
      // Derive title from first H1 or from name
      const h1Match = body.match(/^#\s+(.+)$/m);
      const title = h1Match ? h1Match[1].trim() : name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      return {
        name,
        title,
        content: body,
        version: meta.version,
        created: meta.created,
        category: meta.category,
        trigger: meta.trigger,
      };
    });

    // Sort by category then name
    skills.sort((a, b) => {
      const catA = a.category ?? '';
      const catB = b.category ?? '';
      if (catA !== catB) return catA.localeCompare(catB);
      return a.name.localeCompare(b.name);
    });

    // Filter by search term
    const filtered = search
      ? skills.filter(s =>
          s.title.toLowerCase().includes(search) ||
          s.name.toLowerCase().includes(search) ||
          s.category?.toLowerCase().includes(search) ||
          s.trigger?.toLowerCase().includes(search)
        )
      : skills;

    return NextResponse.json({ skills: filtered.slice(0, limit) });
  } catch (error) {
    console.error('[SKILLS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}