# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 20:05 UTC+8

## System Status
- **Phase**: Operational (Wave 20 — 3D atmosphere)
- **Waves completed**: 18 (15 in DB + 3 manual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (walk + expressions) + Chibi (8 gestures + arrival flash)
- **Spec compliance**: 93.75% (14/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 7 |
| GitHub commits | 16 |
| Waves completed | 18 |
| Spec compliance | 93.75% |

## What exists
- 3D world: day/night cycle (Argentina time), arrival glow, bloom, camera follow
- Chibi: 8 gestures, walk cycle, eye tracking, blinking, arrival flash
- VRM: bone walk, expressions, eye tracking, auto-blink
- Dashboard: hero status, error trend, spec compliance, activity feed
- Wave engine: creates, completes via PATCH, writes log files, auto-cleans stale

## What's next
1. Turborepo Package Layout (last spec gap — risky)
2. VRM visual verification (env limits)
3. Sound effects for state changes