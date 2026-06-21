import { NextRequest, NextResponse } from 'next/server';

import { logDebug } from '@/lib/logger';

// GET /api/harness/agent-status/seed — return seed info
export async function GET() {
  return NextResponse.json({ endpoint: 'seed', method: 'POST', description: 'Seeds demo live activity data' });
}

// POST /api/harness/agent-status/seed — seeds demo live activity
export async function POST(req: NextRequest) {
  try {
    // Derive base URL from request headers (works in any deployment environment)
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;

    const demoActivities = [
      { agentState: 'thinking', message: 'Analyzing codebase structure...', phase: 'assess' },
      { agentState: 'searching', message: 'Scanning for potential improvements...', phase: 'assess' },
      { agentState: 'thinking', message: 'Evaluating health metrics...', phase: 'assess' },
      { agentState: 'planning', message: 'Generating wave execution plan...', phase: 'plan' },
      { agentState: 'planning', message: 'Prioritizing: dashboard UX > API stability > docs', phase: 'plan' },
      { agentState: 'executing', message: 'Refactoring agent avatar canvas renderer...', phase: 'execute' },
      { agentState: 'executing', message: 'Adding real-time state-reactive color transitions', phase: 'execute' },
      { agentState: 'executing', message: 'Implementing neural web visualization layer', phase: 'execute' },
      { agentState: 'verifying', message: 'Running lint checks... 0 errors found', phase: 'verify' },
      { agentState: 'verifying', message: 'Browser QA: all interactions verified', phase: 'verify' },
      { agentState: 'celebrating', message: 'Wave complete! 3 improvements applied.', phase: 'report' },
    ];

    let seeded = 0;
    for (const act of demoActivities) {
      await fetch(`${baseUrl}/api/harness/agent-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'activity', ...act }),
      }).then(() => { seeded++; }).catch((e) => { logDebug('SEED', `Failed to seed activity: ${act.message}`, { error: String(e) }); });
    }

    // Set final state
    await fetch(`${baseUrl}/api/harness/agent-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'full-update',
        agentState: 'idle',
        message: 'Demo seed complete. Standing by for next cycle.',
        waveNumber: 0,
        progress: 1,
        waveCount: 0,
        totalImprovements: 0,
        totalDecisions: 0,
      }),
    }).catch((e) => { logDebug('SEED', 'Failed to set final demo state', { error: String(e) }); });

    return NextResponse.json({ ok: true, seeded });
  } catch {
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}