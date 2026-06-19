import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sync = await db.gitHubSync.findFirst();
    if (!sync) {
      return NextResponse.json({
        status: 'disconnected',
        username: null,
        repoName: null,
        branch: 'main',
        totalCommits: 0,
        lastSyncAt: null,
        lastCommitSha: null,
      });
    }
    return NextResponse.json(sync);
  } catch (error) {
    console.error('[GITHUB STATUS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub status' }, { status: 500 });
  }
}