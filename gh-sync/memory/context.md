# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 17:40 UTC+8

## System Status
- **Phase**: Operational (3D chibi character rewrite completed)
- **Waves completed**: 8 (4 recorded in DB + 4 manual/cron)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Web app**: Dashboard live, Agent Live tab as default
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: Chibi 3D humanoid — walks between stations, has gestures, eye tracking, chat bubble

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 6 |
| Skills | 4 |
| GitHub commits | 6 |
| Waves completed | 8 |
| Total decisions | 12 |

## What exists
- SPEC.md + guardrails + wave_protocol
- gh-sync/: memory, skills (4), specs
- 14 API routes under /api/harness/*
- 6-tab dashboard with live 3D avatar as entry
- 3D chibi character: body, head, arms, legs, eyes, mouth, gestures, walking
- 3D world: 7 themed stations, trees, rocks, mushrooms, paths, ambient particles
- Camera follow system, post-processing, HUD overlays

## What's next (priority order)
1. Verify 3D character visually renders correctly (need stable server)
2. Add more character animations (jump, spin, wave)
3. Add sound effects (non-spammy) for state changes
4. Loop replay with Argentina timestamps
5. Package exportable turborepo module

## Known Issues
- Server takes ~60s to compile Three.js on cold start
- Dev server process keeps dying under resource pressure
- File Write tool has persistence issues in this environment
