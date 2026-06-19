# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 01:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 51)
- **Waves in DB**: 45
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 17 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 90 |
| Waves in DB | 45 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Agent Live: 3D avatar, phase tracker, success rate, SSE + polling, last wave summary, recent decisions feed
- Research tab: Memory (context + insights + **user_profile** now working), Skills (now working), Decision Distribution, Timeline
- Decisions tab: category count badges, **i18n** category in filters
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- UX: Keyboard shortcuts (1-6), kbd badges on lg+
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only
2. Consider adding metric trend sparklines to the stats grid cards
3. Audit all hook→route pairs using hidden-endpoint-audit skill