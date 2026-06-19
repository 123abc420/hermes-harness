# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 01:10 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 50)
- **Waves in DB**: 44
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 17 |
| Dashboard tabs | 6 |
| Skills | 13 |
| GitHub commits | 88 |
| Waves in DB | 44 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Agent Live: 3D avatar, phase tracker, success rate, SSE + polling, last wave summary, **recent decisions feed**
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- UX: Keyboard shortcuts (1-6) for tab switching, kbd badges on lg+
- Decisions tab: **category count badges** in filter buttons
- Research tab: **Skills section now works** (was broken — missing API route)
- UI: 14 components, 8 radix deps, clean imports
- Overview: npm_dependencies in hero subtitle + METRIC_LABELS
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only
2. Consider adding metric trend sparklines to the stats grid cards
3. Add user_profile.md display to Research tab memory section