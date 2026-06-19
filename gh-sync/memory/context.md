# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 19:00 UTC+8

## System Status
- **Phase**: Operational (Wave 15 — station desync fixed)
- **Waves completed**: 12 (9 in DB + 3 manual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (primary) + Chibi (fallback) in monolith sandbox

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 6 |
| Skills | 5 |
| GitHub commits | 10 |
| Waves completed | 12 |
| Station sources | 1 (unified) |

## What exists
- SPEC.md + guardrails + wave_protocol
- gh-sync/: memory, skills (5), specs
- 14 API routes under /api/harness/*
- 6-tab dashboard with live 3D avatar as entry
- Single 3D file: agent-3d-sandbox.tsx (VRM+Chibi+World+Camera, 797 lines)
- 3D shared: agent-3d-shared.ts (mousePosition, STATIONS)
- Camera follow, bloom post-processing, state-reactive lighting

## What's next (priority order)
1. Verify VRM avatar loads visually (env resource limits prevent testing)
2. Add more character animations (jump, spin, wave)
3. Add sound effects (non-spammy) for state changes
4. Loop replay with Argentina timestamps
5. Package exportable turborepo module

## Known Issues
- Dev server dies during Three.js page compilation (env resource limit, not code bug)
- API routes work fine (200 OK) — only full page / is heavy
- Lint clean: 0 errors, 0 warnings
