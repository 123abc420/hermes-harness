import { NextRequest, NextResponse } from 'next/server';
import { APP_INTERNAL_URL } from '@/lib/constants';

const DEMO_SECRET = process.env.DEMO_SECRET;

const DEMO_SEQUENCE = [
  { agentState: 'thinking', message: 'ASSESS: Reading context.md...', phase: 'assess', progress: 0.08 },
  { agentState: 'thinking', message: 'ASSESS: Analyzing system state...', phase: 'assess', progress: 0.15 },
  { agentState: 'searching', message: 'ASSESS: Verifying build status and lint...', phase: 'assess', progress: 0.22 },
  { agentState: 'planning', message: 'PLAN: Identifying 3 priority improvements...', phase: 'plan', progress: 0.3 },
  { agentState: 'planning', message: 'PLAN: Deploying sub-agent for refactor...', phase: 'plan', progress: 0.35 },
  // Sub-agent spawn
  { type: 'sub-agent', name: 'Refactor Agent', state: 'executing', color: '#06b6d4', message: 'Refactoring modules...' },
  { agentState: 'executing', message: 'EXECUTE: Improving 3D avatar with new particles', phase: 'execute', progress: 0.45 },
  { agentState: 'executing', message: 'EXECUTE: Adding sub-agent system to sandbox', phase: 'execute', progress: 0.55 },
  { agentState: 'executing', message: 'EXECUTE: Implementing Argentina timestamps', phase: 'execute', progress: 0.65 },
  { agentState: 'verifying', message: 'VERIFY: Running lint — 0 errors', phase: 'verify', progress: 0.75 },
  { agentState: 'verifying', message: 'VERIFY: Checking 3D rendering in browser', phase: 'verify', progress: 0.82 },
  { agentState: 'executing', message: 'PERSIST: Commit + push to GitHub...', phase: 'persist', progress: 0.9 },
  { type: 'sub-agent-clear' },
  { agentState: 'celebrating', message: 'Wave complete — 3 improvements, 1 sub-agent deployed', phase: 'report', progress: 0.98 },
  { agentState: 'idle', message: 'Turn finished. Activity logged.', phase: '', progress: 0 },
];

function checkAuth(req: NextRequest): boolean {
  if (!DEMO_SECRET) return true; // No secret configured = open (dev mode)
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${DEMO_SECRET}`;
}

async function postToStatus(data: Record<string, unknown>) {
  try {
    await fetch(`${APP_INTERNAL_URL}/api/harness/agent-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Ignore
  }
}

// GET: Run demo sequence
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  for (const step of DEMO_SEQUENCE) {
    await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 500));

    if (step.type === 'sub-agent') {
      await postToStatus({
        type: 'sub-agent',
        name: (step as { name: string }).name,
        state: (step as { state: string }).state,
        color: (step as { color: string }).color,
        message: (step as { message: string }).message,
      });
    } else if (step.type === 'sub-agent-clear') {
      await postToStatus({ type: 'sub-agent-clear' });
    } else {
      await postToStatus({
        type: 'activity',
        agentState: step.agentState,
        message: step.message,
        phase: step.phase,
      });
      await postToStatus({
        agentState: step.agentState,
        message: step.message,
        phase: step.phase,
        waveNumber: 3,
        progress: step.progress,
        waveCount: 2,
        totalImprovements: 6,
        totalDecisions: 12,
      });
    }
  }
  return NextResponse.json({ ok: true, message: 'Demo sequence completed' });
}

// POST: Single status update
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await postToStatus(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}