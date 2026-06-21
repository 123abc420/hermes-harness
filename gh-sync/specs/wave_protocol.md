# Wave Protocol — Detailed Execution Steps

> This is the step-by-step protocol executed every 10 minutes by the `hermes-wave` cron.
> Updated W233: Embedded `agent-live-broadcast` v2.0 steps at each phase.

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
  broadcast '{"agentState":"thinking","message":"Wave N starting: reading state...","phase":"assess","waveNumber":N,"progress":0.05}'
  broadcast '{"type":"sub-agent","name":"Explorer","state":"searching","message":"Reading system state files...","color":"#3b82f6"}'
  ... after each file read:
  broadcast '{"type":"activity","state":"thinking","message":"Read context.md — X waves, Y% compliance","phase":"assess"}'
  broadcast '{"type":"sub-agent-remove","agentId":"<explorer id>"}'
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
  broadcast '{"agentState":"planning","message":"Planning improvements from ASSESS findings...","phase":"plan","waveNumber":N,"progress":0.2}'
  broadcast '{"type":"sub-agent","name":"Planner","state":"planning","message":"Analyzing priorities...","color":"#a855f7"}'
  ... for each decision:
  broadcast '{"type":"decision-count","category":"<cat>","description":"<desc>"}'
  broadcast '{"type":"activity","state":"planning","message":"Decision K: <description> — priority HIGH","phase":"plan"}'
  broadcast '{"type":"sub-agent-remove","agentId":"<planner id>"}'
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
  broadcast '{"agentState":"executing","message":"Executing improvement: <desc>","phase":"execute","waveNumber":N,"progress":0.3}'
  broadcast '{"type":"sub-agent","name":"Code Writer","state":"executing","message":"Implementing...","color":"#f43f5e"}'
  ... during implementation:
  broadcast '{"type":"activity","state":"executing","message":"Editing <file>...","phase":"execute"}'
  broadcast '{"type":"node-pulse","fromNode":"main","toNode":"code-writer","color":"#a855f7"}'
  broadcast '{"type":"sub-agent-update","agentId":"<writer id>","state":"executing","message":"Wrote <lines> lines to <file>"}'
  ... after each improvement:
  broadcast '{"type":"sub-agent-remove","agentId":"<writer id>"}'
```

### 4. VERIFY (check)
```
Run: bun run lint (in /home/z/my-project/)
Check: /home/z/my-project/dev.log for new errors
If broken: roll back changes immediately

BROADCAST:
  broadcast '{"agentState":"verifying","message":"Running bun run lint to verify changes...","phase":"verify","waveNumber":N,"progress":0.75}'
  broadcast '{"type":"sub-agent","name":"Validator","state":"verifying","message":"Checking lint...","color":"#22c55e"}'
  ... after lint:
  broadcast '{"type":"activity","state":"verifying","message":"Lint passed: 0 errors","phase":"verify"}'
  broadcast '{"type":"sub-agent-remove","agentId":"<validator id>"}'
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
  broadcast '{"agentState":"executing","message":"Persisting to GitHub...","phase":"persist","waveNumber":N,"progress":0.9}'
  broadcast '{"type":"sub-agent","name":"Git Sync","state":"executing","message":"Committing and pushing...","color":"#f59e0b"}'
  ... after push:
  broadcast '{"type":"activity","state":"executing","message":"Pushed to GitHub successfully","phase":"persist"}'
  broadcast '{"type":"sub-agent-remove","agentId":"<git id>"}'
```

### 6. REPORT
Write a brief summary: what was assessed, what was decided, what was done, what's next.

```
BROADCAST:
  broadcast '{"type":"full-update","agentState":"celebrating","message":"Wave N complete! <summary>","waveNumber":N,"progress":1,"waveCount":N,"totalImprovements":X,"totalDecisions":Y,"recentSuccessRate":Z,"healthScore":H,"healthScoreTrend":"up"}'
  broadcast '{"type":"sub-agent-clear"}'
  broadcast '{"agentState":"idle","message":"Waiting for next wave...","progress":0}'
```