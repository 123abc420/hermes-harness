import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGitData } from '@/lib/git';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const sync = await db.gitHubSync.findFirst();
    const git = await getGitData();

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
    logError('GITHUB_STATUS', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub status' }, { status: 500 });
  }
}