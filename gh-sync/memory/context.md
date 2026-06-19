# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 19:55 UTC+8

## System Status
- **Phase**: Operational (Wave 19 — Wave logs + UI fixes)
- **Waves completed**: 17 (14 in DB + 3 manual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (primary, with bone walk) + Chibi (fallback, with 8 gestures)
- **Spec compliance**: 93.75% (14/15 items)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 7 |
| GitHub commits | 15 |
| Waves completed | 17 |
| Spec compliance | 93.75% |

## What exists
- SPEC.md + guardrails + wave_protocol
- gh-sync/: memory, skills (7), specs, logs/waves/ (14 files)
- 15 API routes under /api/harness/*
- 6-tab dashboard: hero with wave status, stats, spec compliance, metrics, error trend, activity
- Wave engine completes waves via PATCH, writes log files
- Waves tab: filter by All/Running/Completed/Interrupted/Failed

## What's next
1. Turborepo Package Layout (last spec gap — risky restructure)
2. Visually verify VRM avatar (env limits)
3. Sound effects for state changes

## Known Issues
- Dev server dies during Three.js page compilation (env resource limit)
- API routes fine (200 OK). Lint: 0 errors.