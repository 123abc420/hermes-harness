# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 03:40 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 65)
- **Waves in DB**: 59
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 110 |
| Waves in DB | 59 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Decisions with outcomes | 134/134 (100%) |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration bars
- Overview: health score badge, sparklines, error banner, wave duration chart
- Decisions tab: **outcome badges** (success_verified/failed/pending), category colors, filters
- Agent Live: 3D avatar, phase tracker, health bar, error states, standby
- All 6 tabs: error state handling
- Unified category colors, shared chart constants
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Milestones or evolution timeline view
2. Wave comparison/detail view
3. Auto-set outcome at wave end (not just backfill)