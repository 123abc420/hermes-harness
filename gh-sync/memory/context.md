# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 01:45 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 53)
- **Waves in DB**: 47
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 17 |
| Dashboard tabs | 6 |
| Skills | 13 |
| GitHub commits | 92 |
| Waves in DB | 47 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Overview stats grid: inline SVG sparklines (last 8 data points per card)
- Agent Live: 3D avatar, phase tracker, success rate, SSE + polling, last wave summary, recent decisions feed
- Research tab: Memory (context + insights + user_profile), Skills, Decision Distribution, Timeline
- Decisions tab: category count badges, 8 category colors (code_quality, feature, fix, refactor, performance, architecture, skill, insight, i18n)
- Dashboard API: returns `latestMetrics` map (deduped per-key), 100 raw metrics
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- UX: Keyboard shortcuts (1-6), kbd badges on lg+
- Footer: "Agent = Model + Harness" + "Spec-Driven Self-Evolution"
- Package: @hermes/harness-dashboard v0.1.0
- Schema: HarnessMetric now has `createdAt` field (Wave 53)

## What's next
1. Consider wave phase real-time indicator in Agent Live
2. Monitor sparkline rendering performance on mobile
3. Spec compliance "Error Rate Decreasing Trend" still dynamic (not guaranteed true)