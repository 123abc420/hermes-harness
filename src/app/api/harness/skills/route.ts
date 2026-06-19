import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SKILLS_DIR = join(process.cwd(), 'gh-sync', 'skills');

interface ParsedSkill {
  name: string;
  title: string;
  content: string;
  version?: string;
  created?: string;
  category?: string;
  trigger?: string;
}

function parseYamlFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) frontmatter[key] = val;
    }
  }
  return { frontmatter, body: match[2] };
}

function titleFromContent(name: string, body: string): string {
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1];
  return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function GET() {
  try {
    let files: string[];
    try {
      files = readdirSync(SKILLS_DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
    } catch {
      return NextResponse.json({ skills: [] });
    }

    const skills: ParsedSkill[] = files
      .map((filename) => {
        const raw = readFileSync(join(SKILLS_DIR, filename), 'utf-8');
        const { frontmatter, body } = parseYamlFrontmatter(raw);
        const name = frontmatter.name || filename.replace('.md', '');
        return {
          name,
          title: titleFromContent(name, body),
          content: body.trim(),
          version: frontmatter.version,
          created: frontmatter.created,
          category: frontmatter.category,
          trigger: frontmatter.trigger,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('[SKILLS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}