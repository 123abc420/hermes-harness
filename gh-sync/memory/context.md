# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 04:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 69)
- **Waves in DB**: 63
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 118 |
| Waves in DB | 63 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Decision outcomes | 100% |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, velocity, duration bars
- Overview: health score, sparklines, error banner, **evolution milestones**, wave duration chart
- Decisions tab: outcome badges, category colors, filters
- Outcome pipeline: auto-derive at creation + cascade on wave PATCH
- Agent Live: 3D avatar (Suspense-wrapped), health bar (always visible)
- All 6 tabs: error handling, unified colors, shared constants
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Wave comparison/detail view
2. Extract SkillsSection from research-tab into its own component
3. Add outcome distribution chart to research tab