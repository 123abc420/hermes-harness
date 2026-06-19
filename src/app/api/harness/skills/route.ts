import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface SkillFrontmatter {
  name?: string;
  title?: string;
  version?: string;
  created?: string;
  category?: string;
  trigger?: string;
}

function parseFrontmatter(raw: string): { frontmatter: SkillFrontmatter; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };

  const fm: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  return {
    frontmatter: fm as unknown as SkillFrontmatter,
    content: match[2].trim(),
  };
}

export async function GET() {
  try {
    const skillsDir = path.join(process.cwd(), 'gh-sync', 'skills');
    let files: string[];
    try {
      files = (await fs.readdir(skillsDir)).filter(
        (f) => f.endsWith('.md') && !f.startsWith('_')
      );
    } catch {
      return NextResponse.json({ skills: [] });
    }

    const skills = [];
    for (const file of files) {
      const raw = await fs.readFile(path.join(skillsDir, file), 'utf-8');
      const { frontmatter, content } = parseFrontmatter(raw);

      // Derive title from name if not in frontmatter
      const name = frontmatter.name ?? file.replace('.md', '');
      const title = frontmatter.title ?? name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      skills.push({
        name,
        title,
        content,
        version: frontmatter.version ?? undefined,
        created: frontmatter.created ?? undefined,
        category: frontmatter.category ?? undefined,
        trigger: frontmatter.trigger ?? undefined,
      });
    }

    // Sort by name for consistent ordering
    skills.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('[SKILLS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}