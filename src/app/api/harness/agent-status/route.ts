import { NextRequest, NextResponse } from 'next/server';
import { logError, logDebug } from '@/lib/logger';
import { formatArgentinaTime, AGENT_LIVE_SERVICE_URL } from '@/lib/constants';

const VALID_AGENT_STATES = new Set([
  'idle', 'thinking', 'searching', 'planning', 'executing',
  'verifying', 'celebrating', 'error', 'evolving', 'offline',
]);

const VALID_PHASES = new Set([
  'assess', 'plan', 'execute', 'verify', 'persist', 'report', '',
]);

function validateAgentState(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value);
  if (!VALID_AGENT_STATES.has(s)) return `Invalid agentState: "${s}"`;
  return null;
}

function validateProgress(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 1) return 'progress must be between 0 and 1';
  return null;
}

function validateWaveNumber(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return 'waveNumber must be a non-negative integer';
  return null;
}

// ─── In-memory state (always available, no external service needed) ─
let latestStatus: Record<string, unknown> = {
  agentState: 'idle',
  message: 'Waiting for activity...',
  phase: '',
  waveNumber: 0,
  progress: 0,
  waveCount: 0,
  totalImprovements: 0,
  totalDecisions: 0,
  timestamp: Date.now(),
};

let activityLog: Array<Record<string, unknown>> = [];
const MAX_LOG = 80;
const SSE_POLL_INTERVAL = 2000;
const SSE_KEEP_ALIVE = 30_000;

// Sub-agents state
let subAgents: Array<Record<string, unknown>> = [];
let activityTimestamp = 0;

// Also try to forward to the agent-live service (best-effort)
async function forwardToService(data: { type: string; payload: Record<string, unknown> }) {
  try {
    await fetch(AGENT_LIVE_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    logDebug('AGENT_STATUS', 'forwardToService failed', { type: data.type });
  }
}

// GET: Return latest state + activities (also supports SSE stream)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Server-Sent Events endpoint
  if (searchParams.get('stream') === 'true') {
    const encoder = new TextEncoder();
    let lastDataHash = '';
    let closed = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let keepAlive: ReturnType<typeof setInterval> | null = null;

    const getHash = () => `${latestStatus.timestamp}_${activityTimestamp}`;

    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (interval) { clearInterval(interval); interval = null; }
      if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
    };

    const stream = new ReadableStream({
      start(controller) {
        const sendData = () => {
          if (closed) return;
          try {
            const payload = JSON.stringify({
              status: 'ok',
              clients: 0,
              latestStatus,
              activities: activityLog,
              activityCount: activityLog.length,
              activityTimestamp,
              subAgents,
            });
            const hash = getHash();
            if (hash !== lastDataHash) {
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
              lastDataHash = hash;
            }
          } catch {
            cleanup();
          }
        };

        // Send initial data
        sendData();

        // Poll every 2 seconds for changes
        interval = setInterval(sendData, SSE_POLL_INTERVAL);

        // Keep alive every 30s
        keepAlive = setInterval(() => {
          if (closed) return;
          try { controller.enqueue(encoder.encode(`: keepalive\n\n`)); }
          catch { cleanup(); }
        }, SSE_KEEP_ALIVE);

        req.signal.addEventListener('abort', () => {
          cleanup();
          try { controller.close(); } catch { /* already closed */ }
        });
      },
      cancel() {
        // Stream consumer cancelled (e.g. browser navigated away) — clear timers
        cleanup();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Regular GET
  return NextResponse.json({
    status: 'ok',
    clients: 0,
    latestStatus,
    activities: activityLog,
    activityCount: activityLog.length,
    activityTimestamp,
    subAgents,
  });
}

// POST: Update agent status (called by wave engine, cron, or demo)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { agentState, message, phase, waveNumber, progress, type } = body;

    if (!agentState && !message && !type) {
      return NextResponse.json({ error: 'Missing agentState or message' }, { status: 400 });
    }

    // Validate agentState if provided
    const stateErr = validateAgentState(agentState);
    if (stateErr) return NextResponse.json({ error: stateErr }, { status: 400 });

    // Validate progress if provided
    const progressErr = validateProgress(progress);
    if (progressErr) return NextResponse.json({ error: progressErr }, { status: 400 });

    // Validate waveNumber if provided
    const waveErr = validateWaveNumber(waveNumber);
    if (waveErr) return NextResponse.json({ error: waveErr }, { status: 400 });

    // Validate phase if provided
    if (phase !== undefined && phase !== null && !VALID_PHASES.has(String(phase))) {
      return NextResponse.json({ error: `Invalid phase: "${phase}"` }, { status: 400 });
    }

    if (type === 'activity') {
      const now = Date.now();
      const entry = {
        agentState: agentState || 'idle',
        message: message || '',
        phase: phase || '',
        id: `act_${now}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now,
        timestampAR: formatArgentinaTime(now),
      };
      activityLog = [entry, ...activityLog].slice(0, MAX_LOG);
      activityTimestamp = now;

      // Also update latest status
      latestStatus = { ...latestStatus, agentState: entry.agentState, message: entry.message, phase: entry.phase, timestamp: now };

      // Best-effort forward to service
      forwardToService({ type: 'activity', payload: entry }).catch(() => { logDebug('AGENT_STATUS', 'forwardToService failed'); });

      return NextResponse.json({ ok: true, activities: activityLog.length });
    }

    if (type === 'sub-agent') {
      // Add a sub-agent
      const subAgent = {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`,
        name: body.name || 'Sub-Agent',
        state: body.state || 'executing',
        message: body.message || 'Working...',
        color: body.color || '#8b5cf6',
        spawnTime: Date.now(),
        timestampAR: formatArgentinaTime(Date.now()),
      };
      subAgents = [...subAgents, subAgent];

      // Also add as activity
      const entry = {
        agentState: body.state || 'executing',
        message: `🚀 Sub-agent deployed: ${subAgent.name}`,
        phase: phase || '',
        id: `act_${Date.now()}_sub`,
        timestamp: Date.now(),
        timestampAR: formatArgentinaTime(Date.now()),
      };
      activityLog = [entry, ...activityLog].slice(0, MAX_LOG);
      activityTimestamp = Date.now();

      forwardToService({ type: 'activity', payload: entry }).catch(() => { logDebug('AGENT_STATUS', 'forwardToService failed'); });
      return NextResponse.json({ ok: true, subAgents: subAgents.length });
    }

    if (type === 'sub-agent-remove') {
      const agentId = body.agentId;
      subAgents = subAgents.filter((a: Record<string, unknown>) => a.id !== agentId);
      return NextResponse.json({ ok: true, subAgents: subAgents.length });
    }

    if (type === 'sub-agent-clear') {
      subAgents = [];
      return NextResponse.json({ ok: true });
    }

    if (type === 'full-update') {
      // Validate agentState in full-update body too
      if (body.agentState) {
        const fullErr = validateAgentState(body.agentState);
        if (fullErr) return NextResponse.json({ error: fullErr }, { status: 400 });
      }
      if (body.progress !== undefined) {
        const fullProg = validateProgress(body.progress);
        if (fullProg) return NextResponse.json({ error: fullProg }, { status: 400 });
      }
      latestStatus = { ...latestStatus, ...body, timestamp: Date.now() };
      if (body.activities) {
        // Ensure all activities have Argentina timestamps
        activityLog = (body.activities as Array<Record<string, unknown>>).map(a => ({
          ...a,
          timestampAR: a.timestampAR || formatArgentinaTime(a.timestamp as number),
        }));
      }
      if (body.subAgents) {
        subAgents = body.subAgents as Array<Record<string, unknown>>;
      }
      forwardToService({ type: 'full-update', payload: body }).catch(() => { logDebug('AGENT_STATUS', 'forwardToService failed'); });
      return NextResponse.json({ ok: true });
    }

    // Default: status update
    latestStatus = {
      ...latestStatus,
      agentState: agentState || 'idle',
      message: message || '',
      phase: phase || '',
      waveNumber: waveNumber || 0,
      progress: progress || 0,
      waveCount: body.waveCount || latestStatus.waveCount || 0,
      totalImprovements: body.totalImprovements || latestStatus.totalImprovements || 0,
      totalDecisions: body.totalDecisions || latestStatus.totalDecisions || 0,
      timestamp: Date.now(),
    };

    forwardToService({
      type: 'status',
      payload: latestStatus,
    }).catch(() => { logDebug('AGENT_STATUS', 'forwardToService failed'); });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logError('AGENT_STATUS', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}