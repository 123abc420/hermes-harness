# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 05:40 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 78)
- **Waves in DB**: 71
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 134 |
| Waves in DB | 71 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Harness components | 20 |

## What exists
- Dashboard: single-fetch, 3-col overview, velocity, duration bars
- Overview tab: 589 lines (was 769), 5 remaining inline (Sparkline, StatCard, StatsGrid, ErrorTrendChart, MiniWaveTimeline, RecentCommitsCard)
- Extracted overview: HeroStatusCard, QuickMetricsChart, WaveDurationBars, SpecComplianceCard, MilestonesTimeline
- Extracted research: MemorySection, SkillsSection, DecisionTimeline, WaveCategoryBreakdown, DonutChartCard, ErrorBlock
- Dashboard API returns 50 recent decisions
- Outcome pipeline: auto-derive at creation + cascade on wave PATCH
- Agent Live: 3D avatar (Suspense), health bar (always visible)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Extract remaining overview inline components (StatsGrid, MiniWaveTimeline, RecentCommitsCard, ErrorTrendChart)
2. Insights.md token cap monitoring
3. Skills usage tracking