# Z.AI HERMES Harness — System Specification

> **Version**: 0.1.0
> **Date**: 2026-06-19
> **Status**: Active
> **Owner**: 123abc420

## 1. Purpose

This system implements a HERMES-inspired self-improving AI agent harness that runs on the **chat.z.ai** platform. The harness uses cron jobs, GitHub-backed persistence, and spec-driven development to continuously improve itself through autonomous "waves" of assessment, planning, execution, and verification.

The core philosophy: **Agent = Model + Harness**. The model (GLM) provides intelligence. The harness (specs, memory, skills, crons, GitHub) provides discipline, persistence, and evolution.

## 2. Architecture — 5 Pillars (adapted from HERMES)

### 2.1 Memory (`gh-sync/memory/`)
Persistent, disciplined memory stored as markdown files in GitHub.

| File | Purpose | Cap |
|------|---------|-----|
| `context.md` | Current system state, what was done last wave | ~800 tokens |
| `insights.md` | Learned patterns, what works, what doesn't | ~2000 tokens |
| `user_profile.md` | User preferences and history | ~500 tokens |

**Rules:**
- Frozen-snapshot: Memory is read once at wave start, writes go to next session
- Injection scanning: No raw user input persisted without sanitization
- File locking: Use append-only patterns (worklog style)

### 2.2 Skills (`gh-sync/skills/`)
The agent creates reusable skills as markdown files with YAML frontmatter. Skills are **data, not code** — they influence the prompt but don't modify source.

**Skill format:**
```markdown
---
name: skill-name
version: 0.1.0
created: 2026-06-19
category: automation | research | code | analysis
trigger: when <condition>
---

# Skill Name

## When to use
...

## Steps
1. ...

## Example
...
```

### 2.3 Soul (`gh-sync/specs/`)
System-level definitions that control agent behavior.

| File | Purpose |
|------|---------|
| `SPEC.md` | This file — the single source of truth |
| `guardrails.md` | What the agent MUST/MUST NOT do |
| `wave_protocol.md` | The step-by-step wave execution protocol |

### 2.4 Crons (chat.z.ai Cron System)
Scheduled tasks that run the agent autonomously.

| Cron | Interval | Purpose |
|------|----------|---------|
| `hermes-wave` | Every 10 min | Execute self-improvement wave |
| `web-dev-review` | Every 15 min | Review and improve the web app |

### 2.5 Self-Improving Loop
Each wave follows: **Assess → Plan → Execute → Verify → Persist → Report**

## 3. Platform Constraints (chat.z.ai)

### Available Tools
- **z-ai-web-dev-sdk**: LLM chat, web search, page reader, image gen/edit, TTS, ASR, VLM
- **File System**: Read, Write, Edit, Bash, Glob, Grep
- **Cron Jobs**: Minimum 5-minute intervals, supports one-time and recurring
- **GitHub**: Via REST API (token-based auth)
- **Agent Browser**: Headless browser for visual verification

### Cost: FREE
All tools used are available at no cost through the chat.z.ai platform.

### Persistence Strategy
- **Primary**: GitHub repo (123abc420/hermes-harness)
- **Secondary**: Local filesystem (ephemeral, rebuilt from GitHub)
- **Tertiary**: Prisma/SQLite (for dashboard metrics)

## 4. Wave Protocol Detail

### Phase 1: ASSESS (read state)
1. Read `gh-sync/memory/context.md` for last known state
2. Read `gh-sync/specs/guardrails.md` for constraints
3. Read `gh-sync/memory/insights.md` for learned patterns
4. Check `gh-sync/skills/` for existing skills
5. Check `dev.log` for errors (last 20 lines)
6. Call dashboard API for current metrics

### Phase 2: PLAN (decide what to improve)
Based on assessment, identify 1-3 improvements:
- Check SPEC compliance — what's in the spec but not implemented?
- Check for bugs/errors in logs
- Check for styling issues or missing features
- Consider creating a new skill for repeatable patterns
- Use LLM judgment to prioritize

### Phase 3: EXECUTE (implement)
- Implement planned improvements
- If creating a skill, write to `gh-sync/skills/{name}.md`
- If updating memory, update `gh-sync/memory/insights.md`
- Always follow guardrails

### Phase 4: VERIFY (check it works)
- Run `bun run lint` for code quality
- Check `dev.log` for new errors
- If broken, roll back

### Phase 5: PERSIST (save to GitHub)
- Update `worklog.md` with wave results
- Record wave + decisions + metrics in database
- Git commit and push to GitHub
- Update `gh-sync/memory/context.md`

### Phase 6: REPORT
- Brief summary of what was done

## 5. Web App (Exportable Module)

The web app is a Next.js dashboard that visualizes the harness state. It is designed to be **importable into another turborepo** as a package.

### Structure
```
harness-dashboard/
  ├── package.json          # Standalone package definition
  ├── src/
  │   ├── components/       # React components
  │   ├── hooks/            # React Query hooks
  │   ├── store/            # Zustand state
  │   ├── types/            # TypeScript interfaces
  │   └── index.ts          # Public API / exports
  └── README.md
```

### Export contract
- All harness-related components are exported from `src/index.ts`
- No hardcoded URLs or secrets
- API routes follow `/api/harness/*` pattern
- Can be mounted as a subpath in any Next.js app

## 6. GitHub Repository Structure

```
123abc420/hermes-harness/
├── gh-sync/
│   ├── SPEC.md             # This spec (single source of truth)
│   ├── specs/
│   │   ├── guardrails.md
│   │   └── wave_protocol.md
│   ├── skills/             # Agent-created skills
│   │   └── _template.md
│   ├── memory/
│   │   ├── context.md
│   │   ├── insights.md
│   │   └── user_profile.md
│   └── logs/               # Wave execution logs
│       └── waves/
├── webapp/                 # The exportable Next.js dashboard
├── worklog.md              # Append-only progress log
└── README.md
```

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Waves completed | Continuous (every 10 min) | Wave count in DB |
| Spec compliance | 100% of spec items implemented | Compliance check in wave |
| Skills created | Growing over time | Skills count in `gh-sync/skills/` |
| Error rate | Decreasing trend | Error count per wave |
| GitHub sync | Every wave persists | Sync status in dashboard |
| Web app quality | Lint-free, no console errors | Lint + dev.log check |

## 8. Evolution Strategy

The harness evolves through:
1. **Skill creation**: Repeated patterns become automated skills
2. **Insight accumulation**: Lessons learned are stored and referenced
3. **Spec refinement**: The spec itself can be improved by the agent (with guardrails)
4. **Code improvement**: The web app and infrastructure improve each wave
5. **Guardrail refinement**: Rules are added when new failure modes are discovered