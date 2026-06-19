import { NextResponse } from 'next/server';

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

async function postToStatus(data: Record<string, unknown>) {
  try {
    await fetch('http://localhost:3000/api/harness/agent-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Ignore
  }
}

// GET: Run demo sequence
export async function GET() {
  for (const step of DEMO_SEQUENCE) {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
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
      waveNumber: 2,
      progress: step.progress,
      waveCount: 1,
      totalImprovements: 3,
      totalDecisions: 7,
    });
  }
  return NextResponse.json({ ok: true, message: 'Demo sequence completed' });
}

// POST: Single status update
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await postToStatus(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}