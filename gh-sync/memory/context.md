# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 01:00 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 49)
- **Waves in DB**: 43
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 13 |
| GitHub commits | 86 |
| Waves in DB | 43 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Agent Live: 3D avatar, phase tracker, success rate, SSE + polling, **last wave summary card**
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- UX: **Keyboard shortcuts (1-6)** for tab switching, kbd badges on lg+
- UI: 14 components, 8 radix deps, clean imports
- Overview: npm_dependencies in hero subtitle + METRIC_LABELS
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only
2. Agent live: show current wave phase as a real-time indicator (not just during active SSE)
3. Consider adding a "recent decisions" feed to Agent Live tab