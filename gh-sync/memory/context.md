# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 04:10 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 68)
- **Waves in DB**: 62
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 116 |
| Waves in DB | 62 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Decision outcomes | 100% (creation + cascade) |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, velocity, duration bars
- Overview: health score, sparklines, error banner, wave duration chart
- Decisions tab: outcome badges, category colors, filters
- Outcome pipeline: auto-derive at creation + cascade on wave PATCH
- Agent Live: 3D avatar (Suspense-wrapped), phase tracker, health bar (always visible)
- All 6 tabs: error state handling, unified colors, shared constants
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Milestones or evolution timeline view
2. Wave comparison/detail view
3. Extract SkillsSection from research-tab into its own component