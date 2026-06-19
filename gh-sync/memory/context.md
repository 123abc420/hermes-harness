# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 02:35 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 58)
- **Waves in DB**: 52
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 102 |
| Waves in DB | 52 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column, health score badge
- Overview stats grid: inline SVG sparklines (last 8 data points per card)
- Overview: Spec compliance card with 3-state checkboxes (done/unknown/failing)
- Agent Live: 3D avatar, phase tracker, success rate, SSE + polling, last wave summary, recent decisions feed (8 category colors), standby indicator with next-wave countdown, **health score bar**, **error state indicators for waves/decisions**
- Research tab: Memory (context + insights + user_profile), Skills (route exists), Decision Distribution, Timeline
- Decisions tab: category count badges, 9 category colors
- Hooks: API_BASE constant dedupes all 12 URL prefixes
- Skills: 14 total (newest: metric-hygiene)
- Dashboard API: returns latestMetrics map, healthScore (0-100), error trend, raw metrics
- Data integrity: all completed waves have completedAt set
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- UX: Keyboard shortcuts (1-6), kbd badges on lg+
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0
- Error handling: Agent Live shows WifiOff cards when waves/decisions API fail

## What's next
1. Mobile sparkline rendering check
2. Consider adding health score trend (up/down/stable arrow)
3. Watch for skills route disappearing again