# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 00:45 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 48)
- **Waves in DB**: 42
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 13 |
| GitHub commits | 83 |
| Waves in DB | 42 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Agent Live: 3D avatar, phase tracker, success rate in stat card, SSE + polling
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- UI: 14 components, 8 radix deps, clean imports
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only
2. Consider adding keyboard shortcuts (e.g., 1-6 for tab switching)
3. Agent live panel: show latest wave summary after completion