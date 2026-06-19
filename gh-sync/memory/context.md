# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 05:50 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 79)
- **Waves in DB**: 73
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 136 |
| Waves in DB | 73 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Harness components | 22 |

## What exists
- Dashboard: single-fetch, 3-col overview, velocity, duration bars
- Overview tab: 300 lines (was 769 at start, 61% total reduction)
- Remaining inline in overview-tab: ErrorTrendChart, RecentCommitsCard, loading skeletons
- Extracted overview: HeroStatusCard, QuickMetricsChart, WaveDurationBars, SpecComplianceCard, MilestonesTimeline, StatsGrid, MiniWaveTimeline
- Extracted research: MemorySection, SkillsSection, DecisionTimeline, WaveCategoryBreakdown, DonutChartCard, ErrorBlock
- Dashboard API returns 50 recent decisions
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Extract ErrorTrendChart + RecentCommitsCard (final overview cleanup)
2. Insights.md token cap monitoring
3. Skills usage tracking