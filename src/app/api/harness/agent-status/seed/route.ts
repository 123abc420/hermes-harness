import { NextResponse } from 'next/server';
import { formatArgentinaTime } from '@/lib/constants';

// POST /api/harness/agent-status/seed — seeds demo live activity
export async function POST() {
  try {
    const demoActivities = [
      { agentState: 'thinking', message: 'Analyzing codebase structure...', phase: 'assess' },
      { agentState: 'searching', message: 'Scanning for potential improvements...', phase: 'assess' },
      { agentState: 'thinking', message: 'Evaluating health metrics: 76/100', phase: 'assess' },
      { agentState: 'planning', message: 'Generating wave execution plan...', phase: 'plan' },
      { agentState: 'planning', message: 'Prioritizing: dashboard UX > API stability > docs', phase: 'plan' },
      { agentState: 'executing', message: 'Refactoring agent avatar canvas renderer...', phase: 'execute' },
      { agentState: 'executing', message: 'Adding real-time state-reactive color transitions', phase: 'execute' },
      { agentState: 'executing', message: 'Implementing neural web visualization layer', phase: 'execute' },
      { agentState: 'verifying', message: 'Running lint checks... 0 errors found', phase: 'verify' },
      { agentState: 'verifying', message: 'Browser QA: all interactions verified', phase: 'verify' },
      { agentState: 'celebrating', message: 'Wave W228 complete! 3 improvements applied.', phase: 'report' },
    ];

    const baseUrl = 'http://localhost:3000';

    for (let i = 0; i < demoActivities.length; i++) {
      const act = demoActivities[i];
      const entry = {
        type: 'activity',
        ...act,
      };

      await fetch(`${baseUrl}/api/harness/agent-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {});

      await new Promise(r => setTimeout(r, 50));
    }

    // Set final state
    await fetch(`${baseUrl}/api/harness/agent-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'status',
        agentState: 'idle',
        message: 'Wave W228 complete. Standing by for next cycle.',
        waveNumber: 228,
        progress: 1,
        waveCount: 158,
        totalImprovements: 452,
        totalDecisions: 891,
      }),
    }).catch(() => {});

    return NextResponse.json({ ok: true, seeded: demoActivities.length });
  } catch {
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}