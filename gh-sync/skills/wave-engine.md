---
name: wave-engine
version: 3.0.0
created: 2026-06-21
updated: 2026-06-21
category: automation
trigger: ALWAYS — when a self-improvement wave is triggered by cron or manual request
---

# Wave Engine v3.0 — Self-Improvement Protocol

## When to use
This skill is the **heart of HERMES HARNESS**. It runs automatically via cron (every 10 min) or on demand. Each execution is a "wave" — a complete cycle of assessment, planning, execution, verification, persistence, and reporting.

**Trigger**: Any cron job or user request that says "execute a self-improvement wave" or references the wave engine.

## Pre-conditions

1. The Next.js dev server MUST be running on port 3000
2. Read this file (`gh-sync/skills/wave-engine.md`) at wave start
3. Read `gh-sync/specs/guardrails.md` for invariant rules
4. Read `gh-sync/skills/agent-live-broadcast.md` for broadcast protocol

## Broadcast Helpers (copy-paste at wave start)

```bash
broadcast() {
  curl -s --max-time 3 -X POST http://localhost:3000/api/harness/agent-status \
    -H 'Content-Type: application/json' -d "$1" || true
}
spawn_node() {
  broadcast "{\"type\":\"node\",\"nodeId\":\"$1\",\"nodeType\":\"$2\",\"nodeName\":\"$3\",\"nodeState\":\"$4\",\"nodeMessage\":\"$5\",\"nodeColor\":\"$6\",\"connections\":[\"orchestrator\"]}"
}
update_node() {
  broadcast "{\"type\":\"node\",\"nodeId\":\"$1\",\"nodeState\":\"$2\",\"nodeMessage\":\"$3\"}"
}
remove_node() {
  broadcast "{\"type\":\"node-remove\",\"nodeId\":\"$1\"}"
}
```

**CRITICAL**: Wrap ALL curl calls in `|| true` — sandbox timeouts must never break the wave.

## 6-Phase Protocol

### Phase 1: ASSESS (progress 0.0 - 0.15)

**Goal**: Understand current state, identify what needs improvement.

**Broadcasts**:
```
1. broadcast '{"type":"node-clear"}'
2. broadcast '{"type":"activity","agentState":"thinking","message":"Wave N ASSESS phase starting...","phase":"assess","waveNumber":N,"progress":0.02}'
3. spawn_node "assessor" "assessor" "ASSESSOR" "searching" "Scanning codebase..." "#06b6d4"
```

**Steps**:
1. Read `/home/z/my-project/worklog.md` — understand what was done last
2. Read `/home/z/my-project/gh-sync/SPEC.md` — check spec compliance
3. Read `/home/z/my-project/gh-sync/memory/context.md` — current system state
4. Read `/home/z/my-project/gh-sync/memory/insights.md` — learned patterns
5. Read `/home/z/my-project/gh-sync/specs/guardrails.md` — constraints
6. `GET /api/harness/dashboard` — get current metrics (wave count, health score, etc.)
7. Check last 20 lines of `/home/z/my-project/dev.log` — any runtime errors?

**After each file read**, broadcast an activity:
```bash
broadcast '{"type":"activity","agentState":"thinking","message":"Read worklog.md — X waves completed","phase":"assess"}'
broadcast '{"type":"node-pulse","fromNode":"orchestrator","toNode":"assessor","color":"#a855f7"}'
```

**Outputs**:
- List of findings (errors, spec gaps, code quality issues)
- Current metrics snapshot
- Priority ranking of issues

**End of ASSESS**:
```bash
update_node "assessor" "thinking" "Analyzing findings..."
broadcast '{"type":"activity","agentState":"thinking","message":"Assessment complete: X findings","phase":"assess","progress":0.14}'
remove_node "assessor"
```

### Phase 2: PLAN (progress 0.15 - 0.25)

**Goal**: Decide 1-3 improvements to make this wave. Quality over quantity.

**Broadcasts**:
```
1. broadcast '{"type":"activity","agentState":"planning","message":"Wave N PLAN phase...","phase":"plan","waveNumber":N,"progress":0.16}'
2. spawn_node "planner" "planner" "PLANNER" "planning" "Prioritizing improvements..." "#a855f7"
```

**Priority order** (from guardrails.md):
1. **Bugs** — runtime errors, broken features, API failures
2. **Spec gaps** — things SPEC.md requires but aren't implemented
3. **Code quality** — type safety, lint errors, dead code
4. **Styling** — responsive issues, accessibility, visual polish
5. **New features** — only if above categories are clean

**For each decision**, broadcast:
```bash
broadcast '{"type":"decision-count","category":"code_quality","description":"Add validation to X route"}'
broadcast '{"type":"activity","agentState":"planning","message":"Decision 1: fix X — priority HIGH","phase":"plan"}'
broadcast '{"type":"node-pulse","fromNode":"orchestrator","toNode":"planner","color":"#a855f7"}'
```

**End of PLAN**:
```bash
update_node "planner" "celebrating" "Plan ready: N improvements"
remove_node "planner"
```

### Phase 3: EXECUTE (progress 0.25 - 0.70)

**Goal**: Implement the planned improvements.

**Broadcasts**:
```
1. broadcast '{"type":"activity","agentState":"executing","message":"Wave N EXECUTE phase...","phase":"execute","waveNumber":N,"progress":0.26}'
2. spawn_node "executor-1" "executor" "EXECUTOR" "executing" "Implementing..." "#f43f5e"
```

**For each file edit**:
```bash
update_node "executor-1" "executing" "Editing component.tsx..."
broadcast '{"type":"node-pulse","fromNode":"orchestrator","toNode":"executor-1","color":"#f43f5e"}'
# ... make the edit ...
broadcast '{"type":"activity","agentState":"executing","message":"Edited: component.tsx — added feature X","phase":"execute"}'
update_node "executor-1" "executing" "File 2/3 complete"
```

**Rules during EXECUTE**:
- Use `Edit`/`MultiEdit`/`Write` tools — never destructive commands
- Make small, focused changes — one concern per edit
- Keep the app importable — no hardcoded secrets
- Don't modify Prisma schema unless explicitly planned
- Don't create files outside `/home/z/my-project/`

**End of EXECUTE**:
```bash
remove_node "executor-1"
```

### Phase 4: VERIFY (progress 0.70 - 0.85)

**Goal**: Confirm nothing is broken.

**Broadcasts**:
```
1. broadcast '{"type":"activity","agentState":"verifying","message":"Wave N VERIFY phase...","phase":"verify","waveNumber":N,"progress":0.72}'
2. spawn_node "verifier" "verifier" "VERIFIER" "verifying" "Running lint..." "#22c55e"
```

**Steps**:
1. Run `bun run lint` — must be 0 errors
2. Run `npx tsc --noEmit` — must be 0 errors (TypeScript is enforced since W273)
3. Check `dev.log` for new errors (last 20 lines)
4. If possible, use agent-browser to visually verify the change

```bash
# After lint
broadcast '{"type":"activity","agentState":"verifying","message":"Lint: 0 errors","phase":"verify"}'
broadcast '{"type":"node-pulse","fromNode":"orchestrator","toNode":"verifier","color":"#22c55e"}'
```

**If something broke**:
1. Roll back the change using Edit
2. Broadcast error state
3. Continue with remaining items (don't let one failure stop the wave)

```bash
broadcast '{"type":"activity","agentState":"error","message":"Rollback: reverted X due to lint error","phase":"verify"}'
```

**End of VERIFY**:
```bash
remove_node "verifier"
```

### Phase 5: PERSIST (progress 0.85 - 0.95)

**Goal**: Save all wave data to database, GitHub, and memory files.

**Broadcasts**:
```
1. broadcast '{"type":"activity","agentState":"executing","message":"Wave N PERSIST phase...","phase":"persist","waveNumber":N,"progress":0.88}'
2. spawn_node "git-sync" "git-agent" "GIT SYNC" "executing" "Persisting wave data..." "#f59e0b"
```

**Steps**:
1. Update `/home/z/my-project/worklog.md` (APPEND, never overwrite):
   ```
   ---
   Task ID: W<N>
   Agent: Wave Engine v3.0
   Task: <summary of what was done>

   Work Log:
   - <step 1>
   - <step 2>

   Stage Summary:
   - <key results>
   - <metrics before/after>
   ```

2. Create wave record: `POST /api/harness/waves` with `{ summary, waveNumber, status: "completed" }`
3. Record decisions: `POST /api/harness/decisions` for each decision made
4. Record metrics: `POST /api/harness/metrics` for any metric changes
5. Sync to GitHub: `POST /api/harness/github/sync`
6. Update `gh-sync/memory/context.md` with new system state

```bash
broadcast '{"type":"activity","agentState":"executing","message":"Wave data persisted to DB","phase":"persist"}'
broadcast '{"type":"node-pulse","fromNode":"orchestrator","toNode":"git-sync","color":"#f59e0b"}'
broadcast '{"type":"activity","agentState":"executing","message":"Pushed to GitHub","phase":"persist"}'
```

**End of PERSIST**:
```bash
remove_node "git-sync"
```

### Phase 6: REPORT (progress 0.95 - 1.0)

**Goal**: Signal completion and reset state.

**Broadcasts**:
```bash
# Final celebration with all metrics
broadcast '{"type":"full-update","agentState":"celebrating","message":"Wave N complete!","waveNumber":N,"progress":1,"waveCount":TOTAL_WAVES,"totalImprovements":IMPROVEMENTS,"totalDecisions":DECISIONS}'

# Clean up sub-agents
broadcast '{"type":"sub-agent-clear"}'

# Reset to idle
broadcast '{"agentState":"idle","message":"Waiting for next wave...","progress":0}'
```

**Write a brief summary** (2-3 sentences) of what was accomplished.

## Decision Categories

When broadcasting `decision-count`, use these categories:

| Category | When to use |
|----------|-------------|
| `bug_fix` | Fixing runtime errors, broken features |
| `spec_compliance` | Implementing SPEC requirements |
| `code_quality` | Type safety, lint, dead code removal |
| `styling` | Visual polish, responsive design |
| `performance` | Optimization, caching |
| `new_feature` | Adding new functionality |
| `refactor` | Restructuring without behavior change |

## Error Handling

| Situation | Action |
|-----------|--------|
| `curl` broadcast times out | Continue (wrapped in `\|\| true`) |
| Lint fails after edit | Roll back that specific edit, continue |
| Dev server not running | Start it with `bun run dev &` |
| GitHub sync fails | Log error, continue (wave still complete) |
| API route returns 500 | Check route code, skip if can't fix in this wave |

## Metrics to Track

After each wave, record these in the dashboard:

- `waveNumber` — sequential wave count
- `improvementsCount` — number of changes made (1-3)
- `decisionsCount` — number of decisions made
- `errorsCount` — number of errors encountered (aim for 0)
- `healthScore` — dashboard health score

## Example: Minimal Wave

```bash
# Start
broadcast '{"type":"node-clear"}' || true
broadcast '{"type":"activity","agentState":"thinking","message":"Wave 42 starting...","phase":"assess","waveNumber":42,"progress":0.02}' || true

# ASSESS
spawn_node "assessor" "assessor" "ASSESSOR" "searching" "Reading worklog..." "#06b6d4"
# ... read files ...
remove_node "assessor"

# PLAN
spawn_node "planner" "planner" "PLANNER" "planning" "Planning..." "#a855f7"
# ... decide improvements ...
remove_node "planner"

# EXECUTE
spawn_node "executor-1" "executor" "EXECUTOR" "executing" "Writing code..." "#f43f5e"
# ... edit files ...
remove_node "executor-1"

# VERIFY
spawn_node "verifier" "verifier" "VERIFIER" "verifying" "Running lint..." "#22c55e"
# bun run lint
remove_node "verifier"

# PERSIST
# ... update worklog, API, GitHub ...

# REPORT
broadcast '{"type":"full-update","agentState":"celebrating","message":"Wave 42 complete!","waveNumber":42,"progress":1}' || true
broadcast '{"type":"sub-agent-clear"}' || true
broadcast '{"agentState":"idle","message":"Waiting for next wave...","progress":0}' || true
```