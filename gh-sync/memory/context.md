# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 06:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 82)
- **Waves in DB**: 76
- **Spec compliance**: 100% (15/16, now includes build health)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 142 |
| Waves in DB | 76 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |
| Harness components | 25 |

## What exists
- Dashboard: single-fetch, 3-col overview, velocity, duration bars, build health
- Overview tab: 193 lines (layout orchestrator + BuildHealthCard)
- Build Health Card: lint status with 5-min cache, errors/warnings display
- HarnessDashboard: composite export for drop-in embedding
- Memory health bars: color-coded usage indicators in Research tab
- Extracted overview: HeroStatusCard, QuickMetricsChart, WaveDurationBars, SpecComplianceCard, MilestonesTimeline, StatsGrid, MiniWaveTimeline, ErrorTrendChart, RecentCommitsCard, BuildHealthCard
- Extracted research: MemorySection (with health bars), SkillsSection, DecisionTimeline, WaveCategoryBreakdown, DonutChartCard, ErrorBlock
- Export contract: HarnessDashboard + HarnessErrorBoundary now exported
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Skills usage tracking (which skills informed which decisions)
2. New feature development or UX polish
3. Trim insights.md (currently ~43% of cap)