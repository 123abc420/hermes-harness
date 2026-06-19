# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 05:10 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 74)
- **Waves in DB**: 68
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 128 |
| Waves in DB | 68 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Harness components | 14 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, velocity, duration bars
- Overview: health score, sparklines, error banner, evolution milestones, wave duration
- Decisions tab: outcome badges, category colors, filters
- Research tab: memory, skills, category donut, outcome donut, wave category breakdown, decision timeline (expandable)
- Shared components: DonutChartCard, ErrorBlock, MemorySection, SkillsSection, WaveCategoryBreakdown
- Dashboard API returns 50 recent decisions
- Outcome pipeline: auto-derive at creation + cascade on wave PATCH
- Agent Live: 3D avatar (Suspense), health bar (always visible)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Insights.md token cap monitoring (visual indicator)
2. Skills usage tracking (which skills informed which decisions)
3. Extract DecisionTimeline to its own component