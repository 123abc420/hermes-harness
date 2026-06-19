# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 16:07 UTC+8

## System Status
- **Phase**: Operational (autonomous waves executing)
- **Waves completed**: 3 (1 setup + 1 real + 1 avatar)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Web app**: Dashboard live, Agent Live tab as default
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Live Service**: WebSocket server on port 3004 (scripts/agent-live-service.mjs)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 6 |
| Skills | 3 |
| GitHub commits | ~4 |
| Avatar states | 10 |
| Facial params | 10 |

## What exists
- SPEC.md + guardrails + wave_protocol (spec-driven foundation)
- gh-sync/ structure: memory, skills, specs
- 14 API routes under /api/harness/*
- 6-tab dashboard: Agent Live, Overview, Waves, Decisions, Research, GitHub
- Avatar Canvas with full facial expressions (eyes, brows, mouth, cheeks)
- Agent Live Service (WebSocket on 3004, REST /health and /broadcast)
- useAgentLive hook: WebSocket + polling fallback
- 3 skills: github-clean-push, wave-execution, _template

## What's next (priority order)
1. Wave engine should POST to /api/harness/agent-status during execution so avatar updates live
2. Package exportable turborepo module (spec section 4)
3. Add eval-driven feedback loop (spec section 6)
4. More skills from observed patterns

## Known Issues
- Live service only runs with `bun run dev` (not production)
- socket.io deps still in package.json (unused, ws used instead)