import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const sync = await db.gitHubSync.findFirst();
    if (!sync || sync.status === 'disconnected') {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
    }

    const updated = await db.gitHubSync.update({
      where: { id: sync.id },
      data: {
        status: 'syncing',
        lastSyncAt: new Date(),
        totalCommits: { increment: 1 },
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