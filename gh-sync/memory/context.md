# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 04:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 70)
- **Waves in DB**: 64
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 120 |
| Waves in DB | 64 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, velocity, duration bars
- Overview: health score, sparklines, error banner, evolution milestones, wave duration
- Decisions tab: outcome badges, category colors, filters
- Research tab: **outcome distribution donut**, category pie, decision timeline, memory, skills
- Outcome pipeline: auto-derive at creation + cascade on wave PATCH
- Agent Live: 3D avatar (Suspense), health bar (always visible)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Wave comparison/detail view
2. Extract SkillsSection from research-tab
3. Insights.md token cap monitoring