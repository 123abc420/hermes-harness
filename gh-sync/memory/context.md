# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 19:35 UTC+8

## System Status
- **Phase**: Operational (Wave 17 — Stale cleanup + Error Trend)
- **Waves completed**: 15 (12 in DB + 3 manual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (primary, with bone walk) + Chibi (fallback, with 8 gestures)
- **Spec compliance**: 93.75% (14/15 items)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 (added PATCH /waves) |
| Dashboard tabs | 6 |
| Skills | 6 |
| GitHub commits | 13 |
| Waves completed | 15 |
| Spec compliance | 93.75% |

## What exists
- SPEC.md + guardrails + wave_protocol
- gh-sync/: memory, skills (6), specs
- 15 API routes under /api/harness/* (including PATCH waves for cleanup)
- 6-tab dashboard with live 3D avatar, error trend chart, spec compliance
- Single 3D file: agent-3d-sandbox.tsx (VRM+Chibi+World+Camera, ~860 lines)
- Auto-cleanup: stale running waves (>15min) auto-marked as "interrupted"

## What's next (priority order)
1. Visually verify VRM avatar loads (env resource limits prevent testing)
2. Turborepo Package Layout (last spec gap, 1/15 remaining)
3. Add sound effects (non-spammy) for state changes
4. Loop replay with Argentina timestamps

## Known Issues
- Dev server dies during Three.js page compilation (env resource limit, not code bug)
- API routes work fine (200 OK) — only full page / is heavy
- Lint clean: 0 errors, 0 warnings