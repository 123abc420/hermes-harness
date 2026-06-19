import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const skillsDir = path.join(process.cwd(), 'gh-sync', 'skills');
    if (!fs.existsSync(skillsDir)) {
      return NextResponse.json({ skills: [] });
    }

    const files = fs
      .readdirSync(skillsDir)
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

    const skills = files.map((filename) => {
      const filePath = path.join(skillsDir, filename);
      const raw = fs.readFileSync(filePath, 'utf-8');

      // Parse YAML frontmatter — handles `key: value` and `key: "quoted value"`
      const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
      const meta: Record<string, string> = {};
      if (frontmatterMatch) {
        for (const line of frontmatterMatch[1].split('\n')) {
          const m = line.match(/^(\w+):\s*(.+)$/);
          if (m) {
            let val = m[2].trim();
            // Strip surrounding quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            meta[m[1]] = val;
          }
        }
      }

      const content = raw.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();

      return {
        name: meta.name ?? filename.replace('.md', ''),
        title: meta.name ? `${meta.name[0].toUpperCase()}${meta.name.slice(1).replace(/-/g, ' ')}` : filename.replace('.md', ''),
        content,
        version: meta.version,
        created: meta.created,
        category: meta.category,
        trigger: meta.trigger,
      };
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('[SKILLS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}