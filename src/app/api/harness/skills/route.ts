import { NextResponse } from 'next/server';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const skillsDir = join(process.cwd(), 'gh-sync', 'skills');
    let files: string[];
    try {
      files = readdirSync(skillsDir).filter(
        (f) => f.endsWith('.md') && f !== '_template.md'
      );
    } catch {
      return NextResponse.json({ skills: [] });
    }

    const skills = files.map((filename) => {
      const raw = readFileSync(join(skillsDir, filename), 'utf-8');

      // Parse YAML frontmatter
      const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
      const frontmatter: Record<string, string> = {};
      if (frontmatterMatch) {
        for (const line of frontmatterMatch[1].split('\n')) {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            const value = line.slice(colonIdx + 1).trim();
            frontmatter[key] = value;
          }
        }
      }

      // Content is everything after frontmatter
      const contentStart = frontmatterMatch
        ? frontmatterMatch[0].length
        : 0;
      const content = raw.slice(contentStart).trim();

      // Derive title from first H1 or filename
      const h1Match = content.match(/^#\s+(.+)$/m);
      const title = h1Match ? h1Match[1].trim() : filename.replace('.md', '').replace(/-/g, ' ');

      return {
        name: frontmatter.name ?? filename.replace('.md', ''),
        title,
        content,
        version: frontmatter.version,
        created: frontmatter.created,
        category: frontmatter.category,
        trigger: frontmatter.trigger,
      };
    });

    return NextResponse.json({ skills });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read skills' },
      { status: 500 }
    );
  }
}