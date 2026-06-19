import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const sync = await db.gitHubSync.findFirst();
    if (!sync || sync.status === 'disconnected') {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
    }

    // Get real git data
    let commitCount = sync.totalCommits;
    let lastSha = sync.lastCommitSha;
    try {
      commitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10);
      const sha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
      if (sha) lastSha = sha;
    } catch {
      // git not available, keep DB values
    }

    const updated = await db.gitHubSync.update({
      where: { id: sync.id },
      data: {
        status: 'syncing',
        lastSyncAt: new Date(),
        totalCommits: commitCount,
        lastCommitSha: lastSha,
      },
    });

    // Simulate sync completing
    setTimeout(async () => {
      await db.gitHubSync.update({
        where: { id: sync.id },
        data: { status: 'connected' },
      });
    }, 2000);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[GITHUB SYNC] Error:', error);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}