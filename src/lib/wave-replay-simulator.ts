/**
 * Wave Replay Simulator v1.0
 * 
 * Generates realistic, granular step-by-step sequences that mirror
 * what the HERMES wave engine actually does during execution.
 * Each step represents a real tool call or action the agent performs.
 */

export type StepType =
  | 'think'        // Internal reasoning / thought
  | 'broadcast'    // Agent Live broadcast (curl to agent-status)
  | 'read-file'    // Read tool — reading a file
  | 'write-file'   // Write/Edit tool — modifying a file
  | 'run-command'  // Bash command execution
  | 'api-call'     // HTTP API request
  | 'grep'         // Code search
  | 'node-spawn'   // Broadcast node creation
  | 'node-remove'  // Broadcast node removal
  | 'phase-start'  // Phase transition marker
  | 'result'       // Result/outcome of an action
  | 'wait'         // Pause/delay
  | 'git-sync'     // GitHub sync operation
  ;

export interface ReplayStep {
  id: number;
  type: StepType;
  phase: string;
  icon: string;
  title: string;
  detail: string;          // The actual command, file path, or content
  result?: string;         // Output or outcome
  duration: number;        // Simulated duration in ms
  color: string;           // Accent color for the step
}

// ─── Color palette per step type ─────────────────────────────────
const STEP_COLORS: Record<StepType, string> = {
  'think': '#a78bfa',
  'broadcast': '#38bdf8',
  'read-file': '#06b6d4',
  'write-file': '#f59e0b',
  'run-command': '#f43f5e',
  'api-call': '#8b5cf6',
  'grep': '#14b8a6',
  'node-spawn': '#a855f7',
  'node-remove': '#6b7280',
  'phase-start': '#ffffff',
  'result': '#22c55e',
  'wait': '#525252',
  'git-sync': '#f97316',
};

const STEP_ICONS: Record<StepType, string> = {
  'think': '🧠',
  'broadcast': '📡',
  'read-file': '📄',
  'write-file': '✏️',
  'run-command': '⌨️',
  'api-call': '🔗',
  'grep': '🔎',
  'node-spawn': '💠',
  'node-remove': '🗑️',
  'phase-start': '▶️',
  'result': '✅',
  'wait': '⏳',
  'git-sync': '🔄',
};

// ─── Helper to build steps ───────────────────────────────────────
let stepCounter = 0;
function step(
  type: StepType,
  phase: string,
  title: string,
  detail: string,
  duration: number,
  result?: string,
): ReplayStep {
  return {
    id: ++stepCounter,
    type, phase, title, detail,
    result,
    duration,
    icon: STEP_ICONS[type],
    color: STEP_COLORS[type],
  };
}

// ─── Generate a full wave replay ────────────────────────────────
export function generateWaveReplay(waveNumber: number, isMaintenance: boolean): ReplayStep[] {
  stepCounter = 0;
  const steps: ReplayStep[] = [];
  const w = `W${waveNumber}`;

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: ASSESS (0.0 — 0.15)
  // ═══════════════════════════════════════════════════════════════
  steps.push(step('phase-start', 'assess', 'Phase: ASSESS', 'Scanning codebase for issues...', 600));

  steps.push(step('broadcast', 'assess', 'Broadcast: node-clear', 'curl -s --max-time 3 -X POST /api/harness/agent-status -d \'{"type":"node-clear"}\'', 200));

  steps.push(step('broadcast', 'assess', `Broadcast: ${w} start`, `curl -s -X POST /api/harness/agent-status -d \'{"type":"activity","agentState":"thinking","message":"${w} ASSESS phase...","phase":"assess","waveNumber":${waveNumber},"progress":0.0}\'`, 200));

  steps.push(step('node-spawn', 'assess', 'Spawn ASSessor node', 'broadcast node: {nodeId:"assessor", color:"#06b6d4", state:"searching"}', 300));

  // Read files
  steps.push(step('think', 'assess', 'Internal reasoning', 'Reading memory files to understand current system state...', 400));

  steps.push(step('read-file', 'assess', 'Read context.md', 'gh-sync/memory/context.md — current system state, metrics, last updated', 500));

  steps.push(step('broadcast', 'assess', 'Broadcast: file read', '{"type":"activity","message":"Read context.md, insights.md, SPEC.md","phase":"assess"}', 150));

  steps.push(step('read-file', 'assess', 'Read insights.md', 'gh-sync/memory/insights.md — learned patterns, architecture lessons, UX rules', 500));

  steps.push(step('read-file', 'assess', 'Read SPEC.md', 'gh-sync/SPEC.md — system specification, 8 sections, success metrics', 500));

  steps.push(step('think', 'assess', 'Internal reasoning', 'Analyzing current metrics against spec compliance...', 600));

  steps.push(step('run-command', 'assess', 'Check dev.log for errors', 'tail -20 /home/z/my-project/dev.log | rg -i "error|warn|fail"', 300, 'NO_ERRORS'));

  steps.push(step('api-call', 'assess', 'GET /api/harness/dashboard', 'curl -s http://localhost:3000/api/harness/dashboard', 800, `W${waveNumber - 1} completed`));

  steps.push(step('think', 'assess', isMaintenance ? 'Assessment: All clean' : 'Assessment: Issues found', isMaintenance
    ? 'No bugs, no spec gaps, no styling issues. Codebase at Peak Quality. Entering maintenance mode.'
    : 'Found improvement opportunities — proceeding to PLAN phase.', 500));

  steps.push(step('node-remove', 'assess', 'Remove assessor node', 'broadcast: {"type":"node-remove","nodeId":"assessor"}', 200));

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: PLAN (0.15 — 0.25)
  // ═══════════════════════════════════════════════════════════════
  steps.push(step('phase-start', 'plan', 'Phase: PLAN', isMaintenance ? 'No improvements needed' : 'Identifying improvements...', 400));

  if (!isMaintenance) {
    steps.push(step('node-spawn', 'plan', 'Spawn PLANNER node', 'broadcast node: {nodeId:"planner", color:"#a855f7", state:"planning"}', 300));
    steps.push(step('think', 'plan', 'Internal reasoning', 'Evaluating priority: bugs > spec gaps > styling > new features...', 700));
    steps.push(step('broadcast', 'plan', 'Broadcast: decision-count', '{"type":"decision-count","category":"code_quality","description":"Found improvements"}', 200));
    steps.push(step('node-remove', 'plan', 'Remove planner node', 'broadcast: {"type":"node-remove","nodeId":"planner"}', 200));
  } else {
    steps.push(step('broadcast', 'plan', 'Broadcast: no improvements', `{"type":"decision-count","category":"maintenance","description":"Nth consecutive clean wave"}`, 200));
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: EXECUTE (0.25 — 0.70)
  // ═══════════════════════════════════════════════════════════════
  steps.push(step('phase-start', 'execute', 'Phase: EXECUTE', isMaintenance ? 'Skipped — nothing to change' : 'Implementing improvements...', 300));

  if (!isMaintenance) {
    steps.push(step('node-spawn', 'execute', 'Spawn EXECUTOR node', 'broadcast node: {nodeId:"executor", color:"#f43f5e", state:"executing"}', 300));
    steps.push(step('think', 'execute', 'Internal reasoning', 'Planning file modifications...', 400));
    steps.push(step('grep', 'execute', 'Search codebase for target', 'rg --type ts "pattern" src/', 500, '3 matches found'));
    steps.push(step('read-file', 'execute', 'Read target file', 'src/components/harness/some-component.tsx', 500));
    steps.push(step('write-file', 'execute', 'Edit file (Edit tool)', 'MultiEdit: old_str → new_str (3 changes)', 600));
    steps.push(step('broadcast', 'execute', 'Broadcast: edit applied', '{"type":"activity","message":"Applied changes to component"}', 150));
    steps.push(step('node-remove', 'execute', 'Remove executor node', 'broadcast: {"type":"node-remove","nodeId":"executor"}', 200));
  } else {
    steps.push(step('wait', 'execute', 'Skipped', 'No code changes needed — Peak Quality', 800));
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: VERIFY (0.70 — 0.85)
  // ═══════════════════════════════════════════════════════════════
  steps.push(step('phase-start', 'verify', 'Phase: VERIFY', 'Running quality checks...', 300));

  steps.push(step('broadcast', 'verify', 'Broadcast: verifying', '{"type":"activity","agentState":"verifying","message":"VERIFY — lint + tsc...","phase":"verify"}', 150));

  steps.push(step('run-command', 'verify', 'Run TypeScript compiler', 'npx tsc --noEmit', 3000, '0 errors'));

  steps.push(step('result', 'verify', 'tsc: 0 errors', 'TypeScript compilation passed with zero errors', 300));

  steps.push(step('run-command', 'verify', 'Check dev.log (post-verify)', 'tail -20 /home/z/my-project/dev.log | rg -i "error|fail"', 300, 'NO_ERRORS'));

  steps.push(step('broadcast', 'verify', 'Broadcast: VERIFY passed', '{"type":"activity","message":"VERIFY passed — lint 0, tsc 0"}', 150));

  // ═══════════════════════════════════════════════════════════════
  // PHASE 5: PERSIST (0.85 — 0.95)
  // ═══════════════════════════════════════════════════════════════
  steps.push(step('phase-start', 'persist', 'Phase: PERSIST', 'Saving results to DB, GitHub, and memory files...', 400));

  steps.push(step('write-file', 'persist', 'Append to worklog.md', `echo "Task ID: ${waveNumber}" >> /home/z/my-project/worklog.md`, 400));

  steps.push(step('api-call', 'persist', `POST /api/harness/waves (W${waveNumber})`, `curl -X POST /api/harness/waves -d '{"waveNumber":${waveNumber},"status":"completed",...}'`, 600, `{"id":"cmqo...","waveNumber":${waveNumber},"status":"completed"}`));

  steps.push(step('api-call', 'persist', 'POST /api/harness/decisions', `curl -X POST /api/harness/decisions -d '{"waveId":"...","category":"maintenance",...}'`, 400, '{"id":"cmqo...","category":"maintenance"}'));

  steps.push(step('git-sync', 'persist', 'GitHub sync', 'curl -X POST /api/harness/github/sync -d \'{}\'', 1500, `{"totalCommits":574,"lastCommitSha":"abc1234"}`));

  steps.push(step('result', 'persist', 'GitHub synced', `Committed to 123abc420/hermes-harness · main`, 200));

  steps.push(step('read-file', 'persist', 'Read context.md', 'gh-sync/memory/context.md — checking current values before update', 300));

  steps.push(step('write-file', 'persist', 'Update context.md', `MultiEdit: Wave ${waveNumber - 1} → ${waveNumber}, commits ~N → ~N+1`, 400));

  // ═══════════════════════════════════════════════════════════════
  // PHASE 6: REPORT (0.95 — 1.0)
  // ═══════════════════════════════════════════════════════════════
  steps.push(step('phase-start', 'report', 'Phase: REPORT', 'Broadcasting completion...', 300));

  steps.push(step('broadcast', 'report', `Broadcast: ${w} complete`, `{"type":"full-update","agentState":"celebrating","message":"${w} complete — Nth consecutive clean wave","waveNumber":${waveNumber},"progress":1}`, 300));

  steps.push(step('broadcast', 'report', 'Broadcast: sub-agent-clear', '{"type":"sub-agent-clear"} — clean all remaining nodes', 150));

  steps.push(step('broadcast', 'report', 'Broadcast: idle', '{"type":"activity","agentState":"idle","progress":0} — reset to idle state', 150));

  steps.push(step('result', 'report', `${w} Complete`, isMaintenance
    ? `Zero code changes · tsc 0 · health 100/100 · GitHub synced`
    : `Improvements applied · Verified · Persisted`, 500));

  return steps;
}

// ─── Get last completed wave from dashboard data ─────────────────
export function getLastWaveNumber(dashboardData: { waves?: { waveNumber: number; status: string }[] }): number {
  const waves = dashboardData?.waves;
  if (!waves || waves.length === 0) return 325; // fallback
  return waves[0].waveNumber;
}