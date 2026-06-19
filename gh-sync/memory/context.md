# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 05:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 76)
- **Waves in DB**: 70
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 132 |
| Waves in DB | 70 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Harness components | 18 |

## What exists
- Dashboard: single-fetch, 3-col overview, velocity, duration bars
- Overview tab: 768 lines (was 1119), 7 remaining inline functions
- Extracted overview: HeroStatusCard, QuickMetricsChart, WaveDurationBars
- Extracted research: MemorySection, SkillsSection, DecisionTimeline, WaveCategoryBreakdown, DonutChartCard, ErrorBlock
- DecisionTimeline: click to expand reasoning, AnimatePresence, keyboard accessible
- Dashboard API returns 50 recent decisions
- Outcome pipeline: auto-derive at creation + cascade on wave PATCH
- Agent Live: 3D avatar (Suspense), health bar (always visible)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Extract remaining overview inline components (SpecCompliance, Milestones, RecentCommits)
2. Insights.md token cap monitoring
3. Skills usage tracking