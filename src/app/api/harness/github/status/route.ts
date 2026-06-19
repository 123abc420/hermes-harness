import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { db } from '@/lib/db';

function getGitData() {
  try {
    const count = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10);
    const log = execSync('git log --oneline -5', { encoding: 'utf-8' }).trim();
    const commits = log.split('\n').map((line) => {
      const spaceIdx = line.indexOf(' ');
      const sha = line.slice(0, spaceIdx > 0 ? spaceIdx : 7);
      const message = line.slice(spaceIdx + 1);
      return { sha, message };
    });
    const lastSha = commits[0]?.sha ?? null;
    return { count, commits, lastSha };
  } catch {
    return { count: 0, commits: [], lastSha: null };
  }
}

export async function GET() {
  try {
    const sync = await db.gitHubSync.findFirst();
    const git = getGitData();

    if (!sync) {
      return NextResponse.json({
        status: 'disconnected',
        username: null,
        repoName: null,
        branch: 'main',
        totalCommits: git.count,
        lastSyncAt: null,
        lastCommitSha: git.lastSha,
        recentCommits: git.commits,
      });
    }
    return NextResponse.json({
      ...sync,
      totalCommits: git.count,
      lastCommitSha: git.lastSha,
      recentCommits: git.commits,
    });
  } catch (error) {
    console.error('[GITHUB STATUS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub status' }, { status: 500 });
  }
}