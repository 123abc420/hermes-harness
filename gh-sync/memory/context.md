# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 02:25 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 57)
- **Waves in DB**: 51
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 100 |
| Waves in DB | 51 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column, health score badge
- Overview stats grid: inline SVG sparklines (last 8 data points per card)
- Overview: Spec compliance card with 3-state checkboxes (done/unknown/failing)
- Agent Live: 3D avatar, phase tracker, success rate, SSE + polling, last wave summary, recent decisions feed (8 category colors), standby indicator with **next-wave countdown**
- Research tab: Memory (context + insights + user_profile), Skills (route exists), Decision Distribution, Timeline
- Decisions tab: category count badges, 9 category colors
- Hooks: API_BASE constant dedupes all 12 URL prefixes
- Skills: 14 total (newest: metric-hygiene)
- Dashboard API: returns `latestMetrics` map, `healthScore` (0-100), error trend, 100 raw metrics
- Data integrity: all completed waves have completedAt set (backfilled 19 in Wave 57)
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- UX: Keyboard shortcuts (1-6), kbd badges on lg+
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Mobile sparkline rendering check
2. Consider health score in Agent Live stats grid
3. Watch for skills route disappearing again