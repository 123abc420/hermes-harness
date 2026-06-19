# Wave Protocol — Detailed Execution Steps

> This is the step-by-step protocol executed every 10 minutes by the `hermes-wave` cron.

## WAVE EXECUTION

### 1. ASSESS (read state)
```
Read: /home/z/my-project/gh-sync/memory/context.md
Read: /home/z/my-project/gh-sync/specs/guardrails.md
Read: /home/z/my-project/gh-sync/memory/insights.md
List: /home/z/my-project/gh-sync/skills/
Check: /home/z/my-project/dev.log (last 20 lines for errors)
Call: GET /api/harness/dashboard (if web app is running)
```

**Assessment output:** A mental model of current system state.

### 2. PLAN (decide)
Based on the assessment, identify 1-3 improvements using this priority:

1. **CRITICAL**: Bugs or errors blocking functionality
2. **HIGH**: SPEC compliance gaps — what the spec says should exist but doesn't
3. **MEDIUM**: Web app improvements (UI, UX, features)
4. **LOW**: New skill creation, documentation, nice-to-haves

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

### 4. VERIFY (check)
```
Run: bun run lint (in /home/z/my-project/)
Check: /home/z/my-project/dev.log for new errors
If broken: roll back changes immediately
```

### 5. PERSIST (save)
```
1. Update /home/z/my-project/worklog.md (append wave results)
2. POST /api/harness/waves (create wave record)
3. POST /api/harness/decisions (for each decision)
4. POST /api/harness/metrics (for key metrics)
5. Git add + commit + push to GitHub
6. Update /home/z/my-project/gh-sync/memory/context.md
```

### 6. REPORT
Write a brief summary: what was assessed, what was decided, what was done, what's next.