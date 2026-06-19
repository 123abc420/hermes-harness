# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 16:10 UTC+8

## System Status
- **Phase**: Operational (autonomous waves with LIVE avatar updates)
- **Waves completed**: 4 (all completed, 0 stuck)
- **GitHub connected**: Yes (123abc420/hermes-harness, 5 commits)
- **Web app**: Dashboard live, Agent Live tab as default
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Live Service**: WebSocket on 3004 + polling fallback working
- **Avatar**: 10 expressions, live updates during waves (34 events in Wave 4)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 6 |
| Skills | 4 |
| GitHub commits | 5 |
| Waves completed | 4 |
| Total decisions | 9 |

## What exists
- SPEC.md + guardrails + wave_protocol
- gh-sync/: memory, skills (4), specs
- 14 API routes under /api/harness/*
- 6-tab dashboard with live avatar as entry
- Avatar Canvas with facial expressions + live service
- Skills: github-clean-push, wave-execution, wave-live-updates, _template

## What's next (priority order)
1. Package exportable turborepo module (spec section 4/5)
2. Add eval-driven feedback loop (spec section 6/8)
3. Production: live service needs process manager (pm2/docker)
4. More dashboard interactivity (click avatar for details)

## Known Issues
- Live service only runs in dev mode (not production)
- socket.io removed from deps but lockfile may still reference it