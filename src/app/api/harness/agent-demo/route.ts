import { NextResponse } from 'next/server';

const DEMO_SEQUENCE = [
  { agentState: 'thinking', message: 'ASSESS: Leyendo context.md...', phase: 'assess', progress: 0.08 },
  { agentState: 'thinking', message: 'ASSESS: Analizando estado del sistema...', phase: 'assess', progress: 0.15 },
  { agentState: 'searching', message: 'ASSESS: Verificando build status y lint...', phase: 'assess', progress: 0.22 },
  { agentState: 'planning', message: 'PLAN: Identificando 3 mejoras prioritarias...', phase: 'plan', progress: 0.3 },
  { agentState: 'planning', message: 'PLAN: Desplegando sub-agente para refactor...', phase: 'plan', progress: 0.35 },
  // Sub-agent spawn
  { type: 'sub-agent', name: 'Refactor Agent', state: 'executing', color: '#06b6d4', message: 'Refactorizando módulos...' },
  { agentState: 'executing', message: 'EXECUTE: Mejorando avatar 3D con nuevas partículas', phase: 'execute', progress: 0.45 },
  { agentState: 'executing', message: 'EXECUTE: Agregando sistema de sub-agentes al sandbox', phase: 'execute', progress: 0.55 },
  { agentState: 'executing', message: 'EXECUTE: Implementando timestamps Argentina', phase: 'execute', progress: 0.65 },
  { agentState: 'verifying', message: 'VERIFY: Ejecutando lint — 0 errores', phase: 'verify', progress: 0.75 },
  { agentState: 'verifying', message: 'VERIFY: Verificando 3D rendering en browser', phase: 'verify', progress: 0.82 },
  { agentState: 'executing', message: 'PERSIST: Commit + push a GitHub...', phase: 'persist', progress: 0.9 },
  { type: 'sub-agent-clear' },
  { agentState: 'celebrating', message: 'Wave completada — 3 mejoras, 1 sub-agente desplegado', phase: 'report', progress: 0.98 },
  { agentState: 'idle', message: 'Turno finalizado. Actividad registrada.', phase: '', progress: 0 },
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
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await postToStatus(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}