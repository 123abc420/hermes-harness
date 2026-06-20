import { NextRequest, NextResponse } from 'next/server';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface SkillFile {
  id: string;
  name: string;
  title: string;
  content: string;
  version: string;
  created: string;
  category: string;
  trigger: string;
}

function parseSkillFile(filename: string, filepath: string): SkillFile | null {
  try {
    const raw = readFileSync(filepath, 'utf-8');
    // Extract YAML frontmatter (between --- delimiters)
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const frontmatter: Record<string, string> = {};
    if (match) {
      for (const line of match[1].split('\n')) {
        const m = line.match(/^(\w+)\s*:\s*(.+)$/);
        if (m) frontmatter[m[1]] = m[2].trim();
      }
    }
    // Title: first H1 in body, or fall back to name from frontmatter
    const body = match ? raw.slice(match[0].length).trim() : raw;
    const h1Match = body.match(/^#\s+(.+)/m);
    const title = h1Match ? h1Match[1].trim() : frontmatter.name ?? filename.replace('.md', '');

    return {
      id: filename.replace('.md', ''),
      name: frontmatter.name ?? filename.replace('.md', ''),
      title,
      content: body,
      version: frontmatter.version ?? '',
      created: frontmatter.created ?? '',
      category: frontmatter.category ?? '',
      trigger: frontmatter.trigger ?? '',
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') ?? '').toLowerCase().trim();
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);

    const skillsDir = join(process.cwd(), 'gh-sync', 'skills');
    let files: string[];
    try {
      files = readdirSync(skillsDir).filter(f => f.endsWith('.md') && f !== '_template.md');
    } catch {
      return NextResponse.json({ skills: [] });
    }

    const skills: SkillFile[] = [];
    for (const f of files) {
      const skill = parseSkillFile(f, join(skillsDir, f));
      if (!skill) continue;
      if (search) {
        const haystack = `${skill.name} ${skill.title} ${skill.category} ${skill.trigger}`.toLowerCase();
        if (!haystack.includes(search)) continue;
      }
      skills.push(skill);
    }

    // Sort by name
    skills.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ skills: skills.slice(0, limit) });
  } catch (error) {
    console.error('[SKILLS API] Error:', error);
    return NextResponse.json({ skills: [] }, { status: 500 });
  }
}