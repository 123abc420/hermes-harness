# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 05:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 75)
- **Waves in DB**: 69
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 130 |
| Waves in DB | 69 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Harness components | 15 |

## What exists
- Dashboard: single-fetch, 3-col overview, velocity, duration bars
- Overview: health score, sparklines, error banner, evolution milestones, wave duration
- Decisions tab: outcome badges, category colors, filters, detail dialog
- Research tab: pure layout orchestrator (~130 lines), 6 extracted sub-components
- Extracted: MemorySection, SkillsSection, DecisionTimeline, WaveCategoryBreakdown, DonutChartCard, ErrorBlock
- DecisionTimeline: click to expand reasoning, AnimatePresence, keyboard accessible
- Dashboard API returns 50 recent decisions
- Outcome pipeline: auto-derive at creation + cascade on wave PATCH
- Agent Live: 3D avatar (Suspense), health bar (always visible)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Insights.md token cap monitoring (visual indicator)
2. Skills usage tracking (which skills informed which decisions)
3. Overview tab decomposition (extract inline components)