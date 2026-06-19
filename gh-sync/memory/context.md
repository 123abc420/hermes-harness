# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 17:50 UTC+8

## System Status
- **Phase**: Operational (VRM 3D character + chibi fallback)
- **Waves completed**: 8+ (10 in worklog)
- **GitHub connected**: Yes (123abc420/hermes-harness, 7 commits)
- **Web app**: Dashboard live, Agent Live tab as default
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Live Service**: WebSocket on 3004 + polling fallback
- **Avatar**: VRM 3D (primary) + Chibi procedural (fallback) — walks between stations

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 6 |
| Skills | 4 |
| GitHub commits | 7 |
| Waves completed | 8+ |
| Total decisions | 12+ |

## What exists
- SPEC.md + guardrails + wave_protocol
- gh-sync/: memory, skills (4), specs
- 14 API routes under /api/harness/*
- 6-tab dashboard with live avatar as entry
- VRM 3D avatar (loads /models/avatar.vrm) with expressions + lookAt + spring bones
- Chibi fallback character (body/head/arms/legs, emotes, chat bubble)
- World with 7 stations (CASA, BIBLIOTECA, OBSERVATORIO, MAPA, TALLER, LABORATORIO, PLAZA)
- Camera auto-follows character between stations
- Trees, rocks, mushrooms, paths, station objects in 3D world

## What's next (priority order)
1. User needs to SEE the result — verify visually
2. Idle active behavior improvements
3. Package exportable turborepo module
4. Production: live service needs process manager
5. More dashboard interactivity

## Known Issues
- Dev server not persisting between shell sessions (env limitation)
- VRM model is a sample (10.8MB) — user may want a different one
- Turbopack cache must be cleared when renaming files