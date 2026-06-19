# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 05:00 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 73)
- **Waves in DB**: 67
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 126 |
| Waves in DB | 67 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Harness components | 13 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, velocity, duration bars
- Overview: health score, sparklines, error banner, evolution milestones, wave duration
- Decisions tab: outcome badges, category colors, filters
- Research tab: memory (extracted), skills (extracted), category pie, outcome donut, wave category breakdown, decision timeline (expandable)
- DecisionTimeline: click to expand reasoning, AnimatePresence, keyboard accessible
- Extracted components: MemorySection, SkillsSection, WaveCategoryBreakdown, ErrorBlock
- Dashboard API returns 50 recent decisions
- Outcome pipeline: auto-derive at creation + cascade on wave PATCH
- Agent Live: 3D avatar (Suspense), health bar (always visible)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Insights.md token cap monitoring (visual indicator)
2. Skills usage tracking (which skills informed which decisions)
3. Extract DecisionDistribution/OutcomeDistribution as shared DonutChart component