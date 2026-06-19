# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 19:25 UTC+8

## System Status
- **Phase**: Operational (Wave 16 — 3D character animation)
- **Waves completed**: 14 (11 in DB + 3 manual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (primary, with bone walk) + Chibi (fallback, with 8 gestures)
- **Spec compliance**: 87.5% (13/15 items)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 6 |
| Skills | 6 |
| GitHub commits | 12 |
| Waves completed | 14 |
| Spec compliance | 87.5% |

## What exists
- SPEC.md + guardrails + wave_protocol
- gh-sync/: memory, skills (6), specs
- 14 API routes under /api/harness/*
- 6-tab dashboard with live 3D avatar as entry
- Single 3D file: agent-3d-sandbox.tsx (VRM+Chibi+World+Camera, ~860 lines)
- 3D shared: agent-3d-shared.ts (mousePosition, STATIONS)
- Camera follow, bloom post-processing, state-reactive lighting
- VRM: bone-driven walk animation, expressions, eye tracking, auto-blink
- Chibi: walk cycle, 8 state gestures, eye tracking, blinking, blush

## What's next (priority order)
1. Visually verify VRM avatar loads (env resource limits prevent testing)
2. Add sound effects (non-spammy) for state changes
3. Loop replay with Argentina timestamps
4. Turborepo Package Layout (spec gap)
5. Error Rate Trend tracking (spec gap)

## Known Issues
- Dev server dies during Three.js page compilation (env resource limit, not code bug)
- API routes work fine (200 OK) — only full page / is heavy
- Lint clean: 0 errors, 0 warnings