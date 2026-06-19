# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 03:50 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 66)
- **Waves in DB**: 60
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 112 |
| Waves in DB | 60 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Decisions with outcomes | 100% (auto-derived) |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, velocity, duration bars
- Overview: health score, sparklines, error banner, wave duration chart
- Decisions tab: outcome badges, category colors, filters
- **Decisions API**: auto-derives outcome from wave status + action at creation
- Agent Live: 3D avatar, phase tracker, health bar, error states
- All 6 tabs: error state handling, unified colors, shared constants
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Milestones or evolution timeline view
2. Wave comparison/detail view
3. Decision outcome auto-update when wave status changes (not just at creation)