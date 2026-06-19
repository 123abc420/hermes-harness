# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 02:45 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 59)
- **Waves in DB**: 53
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 103 |
| Waves in DB | 53 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column, health score badge
- Overview stats grid: **responsive SVG sparklines** (w-full + viewBox, scale to card width)
- Overview: Spec compliance card with 3-state checkboxes, **error banner with retry button**
- Agent Live: 3D avatar, phase tracker, success rate, SSE + polling, last wave summary, recent decisions feed, standby with countdown, health score bar, error state indicators
- Research tab: Memory, Skills, Decision Distribution, Timeline (all with error handling)
- Decisions tab: category count badges, 9 category colors, error handling
- Waves tab: error handling
- GitHub tab: error handling
- **All 6 tabs now have explicit error state handling**
- Hooks: API_BASE constant dedupes all 12 URL prefixes
- Skills: 14 total (newest: metric-hygiene)
- Dashboard API: returns latestMetrics map, healthScore (0-100), error trend
- UX: Keyboard shortcuts (1-6), kbd badges on lg+
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Consider health score trend arrow (up/down/stable)
2. Watch for skills route disappearing again
3. Explore adding a wave comparison view