import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { db } from '@/lib/db';

const execFileAsync = promisify(execFile);

export async function POST() {
  try {
    const sync = await db.gitHubSync.findFirst();
    if (!sync || sync.status === 'disconnected') {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
    }

    // Get real git data (async — no event loop blocking)
    let commitCount = sync.totalCommits;
    let lastSha = sync.lastCommitSha;
    try {
      const { stdout: countStr } = await execFileAsync('git', ['rev-list', '--count', 'HEAD'], {
        encoding: 'utf-8',
        timeout: 10_000,
      });
      commitCount = parseInt(countStr.trim(), 10);
      const { stdout: sha } = await execFileAsync('git', ['rev-parse', '--short', 'HEAD'], {
        encoding: 'utf-8',
        timeout: 10_000,
      });
      if (sha.trim()) lastSha = sha.trim();
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