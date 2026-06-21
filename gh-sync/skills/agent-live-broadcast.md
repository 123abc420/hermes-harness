---
name: agent-live-broadcast
version: 1.1.0
created: 2026-06-21
updated: 2026-06-21
category: automation
trigger: ALWAYS — at every phase transition during a wave, and when the agent starts/stops working
---

# Agent Live Broadcast

## When to use
**ALWAYS** — every time the agent changes what it is doing. This is what makes the Agent Live view actually "live" — a reflection of the agent's mind in real-time.

Trigger this at:
1. **Every wave phase transition** (ASSESS → PLAN → EXECUTE → VERIFY → PERSIST → REPORT)
2. **When starting any tool call** (reading files, running commands, etc.)
3. **When the agent finishes a task** or encounters an error
4. **When sub-agents are spawned or complete**

## Why it matters
The Agent Live view on the dashboard is designed to be a real-time mirror of what the agent is doing. Without broadcasting status updates, the view shows stale "idle" state and looks dead. Each broadcast causes:
- The canvas avatar to change color, background effects, and animations
- The HUD to update with live state badges and progress
- The activity feed to show new events
- State transitions to trigger particle bursts and wave rings

## Architecture

The Agent Live system uses **pure in-memory state** + **Server-Sent Events (SSE)**. No external service is needed.
- `POST /api/harness/agent-status` updates in-memory state
- `GET /api/harness/agent-status?stream=true` pushes updates to connected browsers via SSE
- The old port-3005 mini-service was removed in W230 — all forwarding code deleted

## Sandbox limitation (IMPORTANT)

The chat.z.ai sandbox uses cgroup network isolation. `curl`/`fetch` from within the sandbox to `localhost:3000` is **unreliable** — calls frequently time out. Do NOT rely on curl broadcasts during wave execution. The Agent Live view still works for browser-connected users via SSE polling.

## How to broadcast (when curl works)

> **Note**: In sandbox environments, curl may time out. Skip broadcasts if they fail — the SSE system still functions for browser clients.

```bash
# Status update (changes agent state + message)
curl -s -X POST http://localhost:3000/api/harness/agent-status \
  -H "Content-Type: application/json" \
  -d '{"agentState":"thinking","message":"Reading SPEC.md for compliance check","phase":"assess","waveNumber":230,"progress":0.1}'

# Activity entry (appears in live feed)
curl -s -X POST http://localhost:3000/api/harness/agent-status \
  -H "Content-Type: application/json" \
  -d '{"type":"activity","state":"executing","message":"Fixing health score NaN bug in dashboard API","phase":"execute"}'

# Full update (wave completion)
curl -s -X POST http://localhost:3000/api/harness/agent-status \
  -H "Content-Type: application/json" \
  -d '{"type":"full-update","agentState":"celebrating","message":"Wave 230 complete! 3 improvements applied.","waveNumber":230,"progress":1,"waveCount":230,"totalImprovements":85,"totalDecisions":120,"recentSuccessRate":80,"healthScore":82,"healthScoreTrend":"up"}'
```

## State mapping

| What agent is doing | agentState | message example |
|---------------------|-----------|-----------------|
| Reading files, checking state | `thinking` | "Reading worklog.md for recent progress..." |
| Searching codebase | `searching` | "Searching for API routes with missing validation..." |
| Deciding what to improve | `planning` | "Planning: fix 3 bugs identified in ASSESS phase..." |
| Writing/editing code | `executing` | "Implementing responsive layout fix for mobile..." |
| Running lint/tests | `verifying` | "Running bun run lint to verify changes..." |
| Wave complete | `celebrating` | "Wave 230 complete! Dashboard math safety improved." |
| Something went wrong | `error` | "Lint failed: unused import in agent-live-panel.tsx" |
| Self-improving the spec/skills | `evolving` | "Creating new skill: agent-live-broadcast" |
| No active work | `idle` | "Waiting for next wave..." |

## Phase progress guidelines

| Phase | progress range |
|-------|---------------|
| ASSESS | 0.0 - 0.15 |
| PLAN | 0.15 - 0.25 |
| EXECUTE | 0.25 - 0.70 |
| VERIFY | 0.70 - 0.85 |
| PERSIST | 0.85 - 0.95 |
| REPORT | 0.95 - 1.0 |

## Steps

1. At the START of each wave, broadcast `idle` → `thinking` with the wave number
2. At each phase transition, POST a status update with the new phase and incremented progress
3. During EXECUTE, POST activity entries for each significant action (file read, code change, etc.)
4. If an error occurs, immediately POST with `agentState: "error"`
5. At wave end, POST a `full-update` with all final metrics and `agentState: "celebrating"`
6. After a brief celebration, POST `agentState: "idle"` to return to standby

## Example: Full wave broadcast sequence

```
1. POST agentState=thinking, phase=assess, progress=0.05, "W231 starting: reading state..."
2. POST type=activity, state=thinking, phase=assess, "Read worklog.md — 158 waves completed"
3. POST type=activity, state=thinking, phase=assess, "Read SPEC.md — checking compliance"
4. POST agentState=planning, phase=plan, progress=0.2, "Planning 3 improvements..."
5. POST agentState=executing, phase=execute, progress=0.3, "Implementing Agent Live redesign..."
6. POST type=activity, state=executing, phase=execute, "Rewrote agent-live-panel.tsx (309→280 lines)"
7. POST agentState=verifying, phase=verify, progress=0.75, "Running lint check..."
8. POST agentState=verifying, phase=verify, progress=0.8, "Lint passed: 0 errors"
9. POST agentState=executing, phase=persist, progress=0.9, "Persisting to GitHub..."
10. POST type=full-update, agentState=celebrating, progress=1.0, "W231 complete!"
11. POST agentState=idle, progress=0, "Waiting for next wave..."
```