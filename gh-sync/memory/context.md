# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 02:05 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 55)
- **Waves in DB**: 49
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 96 |
| Waves in DB | 49 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Overview stats grid: inline SVG sparklines (last 8 data points per card)
- Overview: Spec compliance card with 3-state checkboxes (done/unknown/failing)
- Agent Live: 3D avatar, phase tracker, success rate, SSE + polling, last wave summary, recent decisions feed (8 category colors), standby indicator when idle
- Research tab: Memory (context + insights + user_profile), Skills (route exists), Decision Distribution, Timeline
- Decisions tab: category count badges, 9 category colors
- Hooks: API_BASE constant dedupes all 12 URL prefixes
- Skills: 14 total (newest: metric-hygiene)
- Dashboard API: returns `latestMetrics` map (deduped per-key), 100 raw metrics
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- UX: Keyboard shortcuts (1-6), kbd badges on lg+
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Monitor sparkline rendering performance on mobile
2. Consider consolidating one-off metric keys in DB
3. Watch for skills route disappearing again (file persistence issue)