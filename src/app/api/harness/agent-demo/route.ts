import { NextRequest, NextResponse } from 'next/server';
import { agentDemoPostSchema, validationErrorFromResult, VALID_AGENT_STATES_Z, VALID_PHASES_Z } from '@/lib/schemas';
import { logError, logDebug } from '@/lib/logger';

const DEMO_SECRET = process.env.DEMO_SECRET;

// Agent-status is in the same Next.js server — use relative URL
const STATUS_ENDPOINT = '/api/harness/agent-status';

/** Typed demo step — either a status broadcast or a sub-agent command. */
type StatusStep = {
  type?: undefined;
  agentState: (typeof VALID_AGENT_STATES_Z)[number];
  message: string;
  phase: (typeof VALID_PHASES_Z)[number];
  progress: number;
};

type SubAgentStep = {
  type: 'sub-agent';
  name: string;
  state: string;
  color: string;
  message: string;
};

type ClearStep = {
  type: 'sub-agent-clear';
};

const DEMO_SEQUENCE: (StatusStep | SubAgentStep | ClearStep)[] = [
  { agentState: 'thinking', message: 'ASSESS: Reading context.md...', phase: 'assess', progress: 0.08 },
  { agentState: 'thinking', message: 'ASSESS: Analyzing system state...', phase: 'assess', progress: 0.15 },
  { agentState: 'searching', message: 'ASSESS: Verifying build status and lint...', phase: 'assess', progress: 0.22 },
  { agentState: 'planning', message: 'PLAN: Identifying 3 priority improvements...', phase: 'plan', progress: 0.3 },
  { agentState: 'planning', message: 'PLAN: Deploying sub-agent for refactor...', phase: 'plan', progress: 0.35 },
  // Sub-agent spawn
  { type: 'sub-agent', name: 'Refactor Agent', state: 'executing', color: '#06b6d4', message: 'Refactoring modules...' },
  { agentState: 'executing', message: 'EXECUTE: Improving canvas avatar with new particles', phase: 'execute', progress: 0.45 },
  { agentState: 'executing', message: 'EXECUTE: Adding sub-agent system to sandbox', phase: 'execute', progress: 0.55 },
  { agentState: 'executing', message: 'EXECUTE: Implementing Argentina timestamps', phase: 'execute', progress: 0.65 },
  { agentState: 'verifying', message: 'VERIFY: Running lint — 0 errors', phase: 'verify', progress: 0.75 },
  { agentState: 'verifying', message: 'VERIFY: Checking canvas rendering in browser', phase: 'verify', progress: 0.82 },
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
    await fetch(STATUS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {
    logDebug('AGENT_DEMO', 'postToStatus fetch failed', { error: String(e) });
  }
}

// GET: Run demo sequence
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    for (const step of DEMO_SEQUENCE) {
      await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 500));

      if (step.type === 'sub-agent') {
        await postToStatus({
          type: 'sub-agent',
          name: step.name,
          state: step.state,
          color: step.color,
          message: step.message,
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
  } catch (error) {
    logError('AGENT_DEMO_GET', error);
    return NextResponse.json({ error: 'Demo sequence failed' }, { status: 500 });
  }
}

// POST: Single status update
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = agentDemoPostSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorFromResult(parsed.error);
    }
    await postToStatus(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logError('AGENT_DEMO_POST', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}