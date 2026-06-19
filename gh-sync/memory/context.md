# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 20:22 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 22)
- **Waves completed**: 20 (17 in DB + 3 manual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (walk + expressions) + Chibi (8 gestures + arrival flash)
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 8 |
| GitHub commits | 19 |
| Waves completed | 20 |
| Spec compliance | 100% |

## What exists
- 3D world: day/night cycle, arrival glow, bloom, camera follow
- Chibi: 8 gestures, walk cycle, eye tracking, blinking, arrival flash
- VRM: bone walk, expressions, eye tracking, auto-blink
- Dashboard: hero status, error trend, spec compliance (100%), activity feed, skills display
- Wave engine: creates, completes via PATCH, writes log files, auto-cleans stale
- Package: @hermes/harness-dashboard v0.1.0 with export contract
- Skills API: reads frontmatter from gh-sync/skills/*.md

## What's next
1. VRM visual verification (env limits)
2. Sound effects for state changes
3. Accessibility improvements (keyboard nav, aria labels)