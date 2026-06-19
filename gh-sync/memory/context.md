# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 06:10 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 81)
- **Waves in DB**: 75
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 140 |
| Waves in DB | 75 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Harness components | 24 |

## What exists
- Dashboard: single-fetch, 3-col overview, velocity, duration bars
- Overview tab: 183 lines (pure layout orchestrator, 76% reduction from 769)
- Memory health bars: color-coded usage indicators in Research tab
- Extracted overview: HeroStatusCard, QuickMetricsChart, WaveDurationBars, SpecComplianceCard, MilestonesTimeline, StatsGrid, MiniWaveTimeline, ErrorTrendChart, RecentCommitsCard
- Extracted research: MemorySection (with health bars), SkillsSection, DecisionTimeline, WaveCategoryBreakdown, DonutChartCard, ErrorBlock
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Skills usage tracking (which skills informed which decisions)
2. New feature development or UX polish
3. Trim insights.md (currently ~43% of cap)