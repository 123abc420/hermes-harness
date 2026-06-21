# Wave Protocol — Detailed Execution Steps

> This is the step-by-step protocol executed every 10 minutes by the `hermes-wave` cron.
> Updated W274: Synced broadcast types to v3.0 node graph format (node/node-remove/node-pulse/node-clear). Added tsc --noEmit to VERIFY.

## WAVE EXECUTION

### 0. BROADCAST INIT (new in W233)
```
Define broadcast helper (attempt with timeout, never block wave):
  broadcast() {
    curl -s --max-time 3 -X POST http://localhost:3000/api/harness/agent-status \
      -H "Content-Type: application/json" \
      -d "$1" || true
  }
```

### 1. ASSESS (read state)
```
Read: /home/z/my-project/gh-sync/memory/context.md
Read: /home/z/my-project/gh-sync/specs/guardrails.md
Read: /home/z/my-project/gh-sync/memory/insights.md
List: /home/z/my-project/gh-sync/skills/
Check: /home/z/my-project/dev.log (last 20 lines for errors)
Call: GET /api/harness/dashboard (if web app is running)

BROADCAST:
  broadcast '{"type":"node-clear"}'
  broadcast '{"type":"activity","agentState":"thinking","message":"Wave N starting: reading state...","phase":"assess","waveNumber":N,"progress":0.05}'
  broadcast '{"type":"node","nodeId":"assessor","nodeType":"assessor","nodeName":"ASSESSOR","nodeState":"searching","nodeMessage":"Reading system state files...","nodeColor":"#06b6d4","connections":["orchestrator"]}'
  ... after each file read (pulse orchestrator→assessor):
  broadcast '{"type":"node-pulse","fromNode":"orchestrator","toNode":"assessor","color":"#a855f7"}'
  broadcast '{"type":"activity","agentState":"thinking","message":"Read context.md — X waves, Y% compliance","phase":"assess"}'
  ... done:
  broadcast '{"type":"node-remove","nodeId":"assessor"}'
```

**Assessment output:** A mental model of current system state.

### 2. PLAN (decide)
Based on the assessment, identify 1-3 improvements using this priority:

1. **CRITICAL**: Bugs or errors blocking functionality
2. **HIGH**: SPEC compliance gaps — what the spec says should exist but doesn't
3. **MEDIUM**: Web app improvements (UI, UX, features)
4. **LOW**: New skill creation, documentation, nice-to-haves

```
BROADCAST:
  broadcast '{"type":"activity","agentState":"planning","message":"Planning improvements from ASSESS findings...","phase":"plan","waveNumber":N,"progress":0.2}'
  broadcast '{"type":"node","nodeId":"planner","nodeType":"planner","nodeName":"PLANNER","nodeState":"analyzing","nodeMessage":"Identifying improvements...","nodeColor":"#a855f7","connections":["orchestrator"]}'
  ... for each decision:
  broadcast '{"type":"decision-count","category":"<cat>","description":"<desc>"}'
  broadcast '{"type":"activity","agentState":"planning","message":"Decision K: <description> — priority HIGH","phase":"plan"}'
  ... done:
  broadcast '{"type":"node-remove","nodeId":"planner"}'
```

**Planning output:** A list of decisions with:
- Category (code_quality, feature, fix, refactor, style, performance, architecture)
- Priority (critical, high, medium, low)
- Description of what to do
- Reasoning for why

### 3. EXECUTE (implement)
For each planned improvement:
- Implement the change
- If it's a repeatable pattern → create a skill in `gh-sync/skills/`
- If it's a lesson learned → update `gh-sync/memory/insights.md`

```
BROADCAST:
  broadcast '{"type":"activity","agentState":"executing","message":"Executing improvement: <desc>","phase":"execute","waveNumber":N,"progress":0.3}'
  broadcast '{"type":"node","nodeId":"executor-1","nodeType":"executor","nodeName":"EXEC-1 <desc>","nodeState":"executing","nodeMessage":"Implementing...","nodeColor":"#f43f5e","connections":["orchestrator"]}'
  ... during implementation:
  broadcast '{"type":"node-pulse","fromNode":"orchestrator","toNode":"executor-1","color":"#a855f7"}'
  broadcast '{"type":"activity","agentState":"executing","message":"Editing <file>...","phase":"execute"}'
  ... after each improvement:
  broadcast '{"type":"node-remove","nodeId":"executor-1"}'
```

### 4. VERIFY (check)
```
Run: bun run lint (in /home/z/my-project/)
Run: npx tsc --noEmit (type-check, catches errors that lint misses)
Check: /home/z/my-project/dev.log for new errors
If broken: roll back changes immediately

BROADCAST:
  broadcast '{"type":"activity","agentState":"verifying","message":"Running bun run lint to verify changes...","phase":"verify","waveNumber":N,"progress":0.75}'
  broadcast '{"type":"node","nodeId":"verifier","nodeType":"verifier","nodeName":"VERIFIER","nodeState":"verifying","nodeMessage":"Checking lint + tsc...","nodeColor":"#22c55e","connections":["orchestrator"]}'
  ... after lint:
  broadcast '{"type":"activity","agentState":"verifying","message":"Lint passed: 0 errors","phase":"verify"}'
  ... after tsc:
  broadcast '{"type":"activity","agentState":"verifying","message":"tsc --noEmit passed: 0 type errors","phase":"verify"}'
  ... done:
  broadcast '{"type":"node-remove","nodeId":"verifier"}'
```

### 5. PERSIST (save)
```
1. Update /home/z/my-project/worklog.md (append wave results)
2. POST /api/harness/waves (create wave record)
3. POST /api/harness/decisions (for each decision)
4. POST /api/harness/metrics (for key metrics)
5. Git add + commit + push to GitHub
6. Update /home/z/my-project/gh-sync/memory/context.md

BROADCAST:
  broadcast '{"type":"activity","agentState":"executing","message":"Persisting to GitHub...","phase":"persist","waveNumber":N,"progress":0.9}'
  broadcast '{"type":"node","nodeId":"git-sync","nodeType":"git-sync","nodeName":"GIT-SYNC","nodeState":"executing","nodeMessage":"Committing and pushing...","nodeColor":"#f59e0b","connections":["orchestrator"]}'
  ... after push:
  broadcast '{"type":"activity","agentState":"executing","message":"Pushed to GitHub successfully","phase":"persist"}'
  ... done:
  broadcast '{"type":"node-remove","nodeId":"git-sync"}'
```

### 6. REPORT
Write a brief summary: what was assessed, what was decided, what was done, what's next.

```
BROADCAST:
  broadcast '{"type":"full-update","agentState":"celebrating","message":"Wave N complete! <summary>","waveNumber":N,"progress":1,"waveCount":N,"totalImprovements":X,"totalDecisions":Y,"recentSuccessRate":Z,"healthScore":H,"healthScoreTrend":"up"}'
  broadcast '{"type":"sub-agent-clear"}'
  broadcast '{"type":"activity","agentState":"idle","message":"Waiting for next wave...","progress":0}'
```