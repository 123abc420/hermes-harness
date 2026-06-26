---
name: agent-live-broadcast
version: 3.0.0
created: 2026-06-21
updated: 2026-06-23
category: automation
trigger: ALWAYS — at every phase transition during a wave, and when the agent starts/stops working
---

# Agent Live Broadcast v3.0 — Multi-Agent Node Network Protocol

## When to use
**ALWAYS** — every time the agent changes what it is doing. This is what makes the Agent Live view a "living reflection" of the agent's mind.

Trigger this at:
1. **Every wave phase transition** (ASSESS → PLAN → EXECUTE → VERIFY → PERSIST → REPORT)
2. **When spawning or completing sub-agents** (Task tool calls, file writes, git operations)
3. **When making decisions** (what to improve, what to fix, what priority)
4. **When the agent finishes a task** or encounters an error
5. **When connections between actions form** (reading a file → deciding → writing code → verifying)
6. **When nodes interact** — pulse connections when data flows between agents

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

### Payload Types

| type | Purpose | Key Fields |
|------|---------|------------|
| `status` | Change agent state + message | agentState, message, phase, waveNumber, progress |
| `activity` | Add event to feed | state, message, phase |
| `node` | Spawn/update a network node | nodeId, nodeType, nodeName, nodeState, nodeMessage, nodeColor, connections |
| `node-remove` | Remove a network node | nodeId |
| `node-clear` | Remove all non-orchestrator nodes | — |
| `full-update` | Wave completion with all metrics | agentState, waveNumber, progress, waveCount, totalImprovements, totalDecisions, etc. |
| `node-pulse` | Pulse a connection between nodes | fromNode, toNode, color |
| `decision-count` | Increment decision counter | category, description |
| `sub-agent` | Spawn sub-agent (also creates node) | name, state, message, color |
| `sub-agent-remove` | Remove sub-agent + its node | agentId |
| `sub-agent-clear` | Remove all sub-agents + non-orch nodes | — |

## Sandbox limitation (IMPORTANT)

The chat.z.ai sandbox uses cgroup network isolation. `curl`/`fetch` from within the sandbox to `localhost:3000` is **unreliable** — calls frequently time out.

**Strategy**: Attempt each broadcast but continue regardless of success/failure. Wrap all calls in `|| true` to prevent timeouts from breaking the wave. The visual falls back gracefully.

## How to broadcast

```bash
# Helper: broadcast function (attempt with timeout, never block)
broadcast() {
  curl -s --max-time 3 -X POST http://localhost:3000/api/harness/agent-status \
    -H "Content-Type: application/json" \
    -d "$1" || true
}

# Node spawn helper
spawn_node() {
  broadcast "{\"type\":\"node\",\"nodeId\":\"$1\",\"nodeType\":\"$2\",\"nodeName\":\"$3\",\"nodeState\":\"$4\",\"nodeMessage\":\"$5\",\"nodeColor\":\"$6\",\"connections\":[\"orchestrator\"]}"
}

# Update node helper
update_node() {
  broadcast "{\"type\":\"node\",\"nodeId\":\"$1\",\"nodeState\":\"$2\",\"nodeMessage\":\"$3\"}"
}

# Remove node helper
remove_node() {
  broadcast "{\"type\":\"node-remove\",\"nodeId\":\"$1\"}"
}
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

## Node Color Palette

| Node role | Color | Use when |
|-----------|-------|----------|
| Orchestrator (HERMES) | `#f59e0b` (amber) | Always — the main agent |
| Assessor | `#06b6d4` (cyan) | Reading, scanning, analyzing |
| Planner | `#a855f7` (violet) | Deciding, prioritizing |
| Executor | `#f43f5e` (rose) | Writing, editing, implementing |
| Verifier | `#22c55e` (green) | Linting, testing, QA |
| Git Sync | `#f59e0b` (amber) | Committing, pushing, syncing |
| Explorer | `#3b82f6` (blue) | Discovering, browsing |

## Phase progress guidelines

| Phase | progress range | Typical nodes |
|-------|---------------|---------------|
| ASSESS | 0.0 - 0.15 | Explorer, Assessor |
| PLAN | 0.15 - 0.25 | Planner |
| EXECUTE | 0.25 - 0.70 | Executor |
| VERIFY | 0.70 - 0.85 | Verifier |
| PERSIST | 0.85 - 0.95 | Git Sync |
| REPORT | 0.95 - 1.0 | (none — main agent only) |

## Full wave broadcast sequence (v3.0)

```
WAVE START
1.  broadcast type=node-clear                          (clean slate)
2.  broadcast agentState=thinking, phase=assess, progress=0.02
3.  broadcast type=activity, "Wave N starting..."
4.  spawn_node "assessor" "assessor" "ASSESSOR" "searching" "Reading worklog..." "#06b6d4"
5.  broadcast type=activity, "Read worklog.md — X waves completed"
6.  broadcast type=node-pulse, fromNode=orchestrator, toNode=assessor
7.  broadcast type=activity, "Reading SPEC.md..."
8.  broadcast type=activity, "Checking dev.log — no errors"
9.  update_node "assessor" "thinking" "Analyzing findings..."
10. broadcast type=activity, "Assessment complete: X findings"

PHASE: PLAN
11. broadcast agentState=planning, phase=plan, progress=0.18
12. remove_node "assessor"
13. spawn_node "planner" "planner" "PLANNER" "planning" "Prioritizing improvements..." "#a855f7"
14. broadcast type=decision-count, category=..., description="..."
15. broadcast type=activity, "Decision 1: fix X — priority HIGH"
16. broadcast type=node-pulse, fromNode=orchestrator, toNode=planner
17. update_node "planner" "celebrating" "Plan ready: 3 improvements"
18. remove_node "planner"

PHASE: EXECUTE
19. broadcast agentState=executing, phase=execute, progress=0.3
20. spawn_node "executor-1" "executor" "WRITER" "executing" "Implementing..." "#f43f5e"
21. broadcast type=node-pulse, fromNode=orchestrator, toNode=executor-1
22. broadcast type=activity, "Editing file.tsx — adding feature..."
23. update_node "executor-1" "executing" "File 2/3 complete"
24. broadcast type=activity, "Edit complete: component updated"
25. remove_node "executor-1"

PHASE: VERIFY
26. broadcast agentState=verifying, phase=verify, progress=0.75
27. spawn_node "verifier" "verifier" "VERIFIER" "verifying" "Running lint..." "#22c55e"
28. broadcast type=node-pulse, fromNode=orchestrator, toNode=verifier
29. broadcast type=activity, "Lint passed: 0 errors"
30. remove_node "verifier"

PHASE: PERSIST
31. broadcast agentState=executing, phase=persist, progress=0.9
32. spawn_node "git-sync" "git-agent" "GIT" "executing" "Committing..." "#f59e0b"
33. broadcast type=activity, "Pushing to GitHub..."
34. remove_node "git-sync"

PHASE: REPORT
35. broadcast type=full-update, agentState=celebrating, progress=1.0, all metrics
36. broadcast type=sub-agent-clear
37. broadcast agentState=idle, progress=0
38. (Write summary)
```