# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 06:00 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 80)
- **Waves in DB**: 74
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 138 |
| Waves in DB | 74 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Harness components | 24 |

## What exists
- Dashboard: single-fetch, 3-col overview, velocity, duration bars
- Overview tab: 183 lines (pure layout orchestrator, was 769 — 76% reduction)
- Extracted overview: HeroStatusCard, QuickMetricsChart, WaveDurationBars, SpecComplianceCard, MilestonesTimeline, StatsGrid, MiniWaveTimeline, ErrorTrendChart, RecentCommitsCard
- Extracted research: MemorySection, SkillsSection, DecisionTimeline, WaveCategoryBreakdown, DonutChartCard, ErrorBlock
- Dashboard API returns 50 recent decisions
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Insights.md token cap monitoring (visual indicator)
2. Skills usage tracking (which skills informed which decisions)
3. New feature development or UX polish