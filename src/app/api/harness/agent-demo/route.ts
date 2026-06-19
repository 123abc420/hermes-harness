import { NextResponse } from 'next/server';

const AGENT_LIVE_PORT = 3004;

const DEMO_SEQUENCE = [
  { agentState: 'thinking', message: 'ASSESS: Leyendo context.md...', phase: 'assess', progress: 0.1 },
  { agentState: 'thinking', message: 'ASSESS: Analizando estado del sistema...', phase: 'assess', progress: 0.15 },
  { agentState: 'searching', message: 'ASSESS: Verificando build status...', phase: 'assess', progress: 0.2 },
  { agentState: 'planning', message: 'PLAN: Identificando gaps en la spec...', phase: 'plan', progress: 0.3 },
  { agentState: 'planning', message: 'PLAN: 3 mejoras propuestas', phase: 'plan', progress: 0.35 },
  { agentState: 'executing', message: 'EXECUTE: Modificando avatar-canvas.tsx...', phase: 'execute', progress: 0.5 },
  { agentState: 'executing', message: 'EXECUTE: Agregando nuevo efecto de partículas', phase: 'execute', progress: 0.6 },
  { agentState: 'executing', message: 'EXECUTE: Actualizando wave-protocol.md', phase: 'execute', progress: 0.7 },
  { agentState: 'verifying', message: 'VERIFY: Ejecutando lint...', phase: 'verify', progress: 0.8 },
  { agentState: 'verifying', message: 'VERIFY: Build exitoso, 0 errores', phase: 'verify', progress: 0.85 },
  { agentState: 'executing', message: 'PERSIST: Commit + push a GitHub...', phase: 'persist', progress: 0.9 },
  { agentState: 'verifying', message: 'REPORT: Actualizando context.md', phase: 'report', progress: 0.95 },
  { agentState: 'celebrating', message: 'Wave 2 completada — 3 mejoras aplicadas', phase: '', progress: 1.0 },
  { agentState: 'idle', message: 'Esperando próxima ola...', phase: '', progress: 0 },
];

async function broadcast(data: Record<string, unknown>) {
  try {
    await fetch(`http://localhost:${AGENT_LIVE_PORT}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Service might not be running
  }
}

// GET: Run demo sequence
export async function GET() {
  // Run the demo sequence with delays
  for (let i = 0; i < DEMO_SEQUENCE.length; i++) {
    const step = DEMO_SEQUENCE[i];
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

    // Broadcast status
    await broadcast({ type: 'status', payload: { ...step, waveNumber: 2, waveCount: 1, totalImprovements: 3, totalDecisions: 7 } });

    // Also broadcast as activity
    await broadcast({ type: 'activity', payload: { agentState: step.agentState, message: step.message, phase: step.phase } });
  }

  return NextResponse.json({ ok: true, message: 'Demo sequence completed' });
}

// POST: Trigger a single status update (for testing)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentState, message, phase, waveNumber, progress } = body;

    await broadcast({
      type: 'activity',
      payload: { agentState: agentState || 'idle', message: message || '', phase: phase || '' },
    });

    await broadcast({
      type: 'status',
      payload: { agentState: agentState || 'idle', message: message || '', phase: phase || '', waveNumber: waveNumber || 0, progress: progress || 0 },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}