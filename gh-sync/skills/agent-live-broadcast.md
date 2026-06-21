---
name: agent-live-broadcast
version: 2.0.0
created: 2026-06-21
updated: 2026-06-21
category: automation
trigger: ALWAYS — at every phase transition during a wave, and when the agent starts/stops working
---

# Agent Live Broadcast v2.0 — Multi-Agent Wave Protocol

## When to use
**ALWAYS** — every time the agent changes what it is doing. This is what makes the Agent Live view a "living reflection" of the agent's mind.

Trigger this at:
1. **Every wave phase transition** (ASSESS → PLAN → EXECUTE → VERIFY → PERSIST → REPORT)
2. **When spawning or completing sub-agents** (Task tool calls, file writes, git operations)
3. **When making decisions** (what to improve, what to fix, what priority)
4. **When the agent finishes a task** or encounters an error
5. **When connections between actions form** (reading a file → deciding → writing code → verifying)

## Why it matters
The Agent Live view is a **multi-agent node world** — not a single character. Each broadcast updates:
- **Node states**: Agent + sub-agents change color, size, glow intensity
- **Connections**: Lines between nodes pulse when data/actions flow between them
- **Activity feed**: New events appear in real-time
- **Decision counters**: Live count of decisions made this wave
- **Wave overview bar**: "Wave N of X" with phase progress
- **Scheduled events preview**: Next cron wave countdown

## Architecture

The Agent Live system uses **pure in-memory state** + **Server-Sent Events (SSE)**. No external service is needed.
- `POST /api/harness/agent-status` updates in-memory state
- `GET /api/harness/agent-status?stream=true` pushes updates to connected browsers via SSE
- The old port-3005 mini-service was removed in W230 — all forwarding code deleted

### New v2.0 Payload Types

| type | Purpose | Key Fields |
|------|---------|------------|
| `status` | Change agent state + message | agentState, message, phase, waveNumber, progress |
| `activity` | Add event to feed | state, message, phase |
| `sub-agent` | Spawn a sub-agent node | name, state, message, color |
| `sub-agent-update` | Update sub-agent state | agentId, state, message |
| `sub-agent-remove` | Remove completed sub-agent | agentId |
| `sub-agent-clear` | Remove all sub-agents | — |
| `full-update` | Wave completion with all metrics | agentState, waveNumber, progress, waveCount, totalImprovements, totalDecisions, etc. |
| `node-pulse` | Pulse a connection between nodes (v2.0) | fromNode, toNode, color |
| `decision-count` | Increment decision counter (v2.0) | category, description |

## Sandbox limitation (IMPORTANT)

The chat.z.ai sandbox uses cgroup network isolation. `curl`/`fetch` from within the sandbox to `localhost:3000` is **unreliable** — calls frequently time out. Do NOT rely on curl broadcasts during wave execution. The Agent Live view still works for browser clients via SSE polling.

**v2.0 Strategy**: The wave engine should ATTEMPT each broadcast but continue regardless of success/failure. The visual falls back to "last known state" gracefully.

## How to broadcast (when curl works)

> **Note**: Wrap all curl calls in `|| true` to prevent timeout from breaking the wave.

```bash
# Helper: broadcast function (attempt with timeout, never block)
broadcast() {
  curl -s --max-time 3 -X POST http://localhost:3000/api/harness/agent-status \
    -H "Content-Type: application/json" \
    -d "$1" || true
}

# 1. Wave start — agent wakes up
broadcast '{"agentState":"thinking","message":"Wave 233 starting: reading state...","phase":"assess","waveNumber":233,"progress":0.05}'

# 2. Activity during ASSESS
broadcast '{"type":"activity","state":"thinking","message":"Read worklog.md — 162 waves completed","phase":"assess"}'

# 3. Spawn sub-agent for a search task
broadcast '{"type":"sub-agent","name":"Code Searcher","state":"searching","message":"Scanning API routes...","color":"#06b6d4"}'

# 4. Update sub-agent when it finds something
broadcast '{"type":"sub-agent-update","agentId":"sub_17504...","state":"executing","message":"Found 3 routes missing validation"}'

# 5. Pulse connection between nodes (v2.0 visual)
broadcast '{"type":"node-pulse","fromNode":"main","toNode":"code-searcher","color":"#a855f7"}'

# 6. Decision made (v2.0 counter)
broadcast '{"type":"decision-count","category":"code_quality","description":"Add zod validation to 3 routes"}'

# 7. Phase transition — planning
broadcast '{"agentState":"planning","message":"Planning 3 improvements from ASSESS findings...","phase":"plan","waveNumber":233,"progress":0.2}'

# 8. EXECUTE phase with sub-agent
broadcast '{"type":"sub-agent","name":"Code Writer","state":"executing","message":"Implementing zod schemas...","color":"#f43f5e"}'

# 9. Remove completed sub-agent
broadcast '{"type":"sub-agent-remove","agentId":"sub_17504..."}'

# 10. VERIFY phase
broadcast '{"agentState":"verifying","message":"Running bun run lint to verify changes...","phase":"verify","waveNumber":233,"progress":0.75}'

# 11. Wave complete — full update
broadcast '{"type":"full-update","agentState":"celebrating","message":"Wave 233 complete! Multi-agent broadcast v2.0 deployed.","waveNumber":233,"progress":1,"waveCount":233,"totalImprovements":87,"totalDecisions":125,"recentSuccessRate":75,"healthScore":78,"healthScoreTrend":"up"}'

# 12. Return to idle
broadcast '{"agentState":"idle","message":"Waiting for next wave...","progress":0}'

# 13. Clear all sub-agents at wave end
broadcast '{"type":"sub-agent-clear"}'
```

## State → Visual Mapping

| What agent is doing | agentState | Node Color | Visual Effect |
|---------------------|-----------|-----------|---------------|
| Reading files, checking state | `thinking` | Cyan (#06b6d4) | Brain-wave ripples from node |
| Searching codebase | `searching` | Orange (#f97316) | Radar sweep around node |
| Deciding what to improve | `planning` | Violet (#a855f7) | Hex grid pulse |
| Writing/editing code | `executing` | Rose (#f43f5e) | Energy surge, node grows |
| Running lint/tests | `verifying` | Green (#22c55e) | Ascending particles |
| Wave complete | `celebrating` | Gold (#eab308) | All nodes glow, ring expansion |
| Something went wrong | `error` | Red (#dc2626) | Red pulse, node flickers |
| Self-improving | `evolving` | Fuchsia (#d946ef) | Spiral pattern |
| No active work | `idle` | Amber (#f59e0b) | Gentle pulse, nodes orbit slowly |
| Disconnected | `offline` | Gray (#71717a) | Static, dim |

## Sub-Agent Color Palette

| Sub-agent role | Color | Use when |
|---------------|-------|----------|
| Code Searcher | `#06b6d4` (cyan) | Searching, scanning, reading |
| Code Writer | `#f43f5e` (rose) | Writing, editing, implementing |
| Validator | `#22c55e` (green) | Linting, testing, verifying |
| Planner | `#a855f7` (violet) | Analyzing, deciding, prioritizing |
| Git Sync | `#f59e0b` (amber) | Committing, pushing, syncing |
| Explorer | `#3b82f6` (blue) | Discovering, browsing, QA |

## Phase progress guidelines

| Phase | progress range | Typical sub-agents |
|-------|---------------|-------------------|
| ASSESS | 0.0 - 0.15 | Explorer, Code Searcher |
| PLAN | 0.15 - 0.25 | Planner |
| EXECUTE | 0.25 - 0.70 | Code Writer, Code Searcher |
| VERIFY | 0.70 - 0.85 | Validator |
| PERSIST | 0.85 - 0.95 | Git Sync |
| REPORT | 0.95 - 1.0 | (none — main agent only) |

## Full wave broadcast sequence (v2.0)

```
PHASE: ASSESS
1.  POST status: agentState=thinking, phase=assess, progress=0.05
2.  POST sub-agent: "Explorer", color=#3b82f6, state=searching
3.  POST activity: "Reading worklog.md..."
4.  POST activity: "Reading SPEC.md — checking compliance"
5.  POST activity: "Read dev.log — no errors"
6.  POST sub-agent-remove: Explorer
7.  POST sub-agent: "Code Searcher", color=#06b6d4
8.  POST activity: "Scanning for patterns..."
9.  POST sub-agent-remove: Code Searcher

PHASE: PLAN
10. POST status: agentState=planning, phase=plan, progress=0.2
11. POST decision-count: category=code_quality, description="..."
12. POST activity: "Decision 1: fix X — priority HIGH"
13. POST activity: "Decision 2: improve Y — priority MEDIUM"

PHASE: EXECUTE
14. POST status: agentState=executing, phase=execute, progress=0.3
15. POST sub-agent: "Code Writer", color=#f43f5e
16. POST activity: "Implementing..."
17. POST node-pulse: main → code-writer
18. POST sub-agent-update: Code Writer state=executing
19. POST activity: "Edit complete: file.tsx"
20. POST sub-agent-remove: Code Writer

PHASE: VERIFY
21. POST status: agentState=verifying, phase=verify, progress=0.75
22. POST sub-agent: "Validator", color=#22c55e
23. POST activity: "Running lint..."
24. POST activity: "Lint passed: 0 errors"
25. POST sub-agent-remove: Validator

PHASE: PERSIST
26. POST status: agentState=executing, phase=persist, progress=0.9
27. POST sub-agent: "Git Sync", color=#f59e0b
28. POST activity: "Pushing to GitHub..."
29. POST sub-agent-remove: Git Sync

PHASE: REPORT
30. POST full-update: agentState=celebrating, progress=1.0, all metrics
31. POST sub-agent-clear
32. POST status: agentState=idle, progress=0
```