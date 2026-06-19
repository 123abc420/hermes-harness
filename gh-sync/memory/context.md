# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 00:35 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 47)
- **Waves in DB**: 41
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 13 |
| GitHub commits | 80 |
| Waves in DB | 41 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity
- Waves table: duration column, detail dialog, status filters
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- 3D Scene: CharacterBridge split, 6 memo-ized components
- UI: 14 components, 8 radix deps, clean exports
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only
2. Agent Live tab: show current wave phase + recent decisions
3. Track npm_dependencies metric over time