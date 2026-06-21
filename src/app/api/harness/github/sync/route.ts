import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { logError, logDebug } from '@/lib/logger';
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

    // Do actual git push (async — no event loop blocking)
    let pushOk = false;
    try {
      await execFileAsync('git', ['push', 'origin', 'HEAD'], {
        encoding: 'utf-8',
        timeout: 30_000,
      });
      pushOk = true;
    } catch (pushErr) {
      // git push may throw even when "already up-to-date" (rare: pre-push hook)
      // Check stderr for up-to-date indicators before treating as failure
      const errMsg = pushErr instanceof Error ? pushErr.message : String(pushErr);
      const isUpToDate = errMsg.includes('already up-to-date') || errMsg.includes('Everything up-to-date');
      if (isUpToDate) {
        logDebug('GITHUB_SYNC', 'git push up-to-date (no new commits to push)');
        pushOk = true;
      } else {
        logDebug('GITHUB_SYNC', 'git push failed', { error: errMsg });
      }
    }

    const updated = await db.gitHubSync.update({
      where: { id: sync.id },
      data: {
        status: pushOk ? 'connected' : 'error',
        lastSyncAt: new Date(),
        totalCommits: commitCount,
        lastCommitSha: lastSha,
        errorMessage: pushOk ? null : 'Push failed',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError('GITHUB_SYNC', error);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}