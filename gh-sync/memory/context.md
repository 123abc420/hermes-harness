# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 19:45 UTC+8

## System Status
- **Phase**: Operational (Wave 18 — Wave completion + Hero display)
- **Waves completed**: 16 (13 in DB + 3 manual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (primary, with bone walk) + Chibi (fallback, with 8 gestures)
- **Spec compliance**: 93.75% (14/15 items)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 6 |
| GitHub commits | 14 |
| Waves completed | 16 |
| Spec compliance | 93.75% |

## What exists
- SPEC.md + guardrails + wave_protocol
- gh-sync/: memory, skills (6), specs
- 15 API routes under /api/harness/*
- 6-tab dashboard: hero with wave status, stats, spec compliance, metrics, error trend, activity
- Wave engine properly completes waves via PATCH (since Wave 18)
- Auto-cleanup: stale running waves (>15min) auto-marked "interrupted"

## What's next (priority order)
1. Turborepo Package Layout (last spec gap, 1/15 — risky restructure)
2. Visually verify VRM avatar loads (env resource limits)
3. Add sound effects (non-spammy) for state changes
4. Loop replay with Argentina timestamps

## Known Issues
- Dev server dies during Three.js page compilation (env resource limit, not code bug)
- API routes work fine (200 OK)
- Lint clean: 0 errors, 0 warnings