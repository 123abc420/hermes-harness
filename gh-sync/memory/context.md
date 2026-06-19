# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 03:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 64)
- **Waves in DB**: 58
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 108 |
| Waves in DB | 58 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Overview: health score badge with trend arrow, responsive sparklines, error banner, **wave duration bar chart**
- Agent Live: 3D avatar, phase tracker, health bar with trend arrow, error state indicators, standby
- All 6 tabs: explicit error state handling
- All 4 decision badge consumers use shared CATEGORY_TW
- Wave detail dialog: category colors, action, description, targetFile
- Unified category colors: lib/category-colors.ts
- Shared chart constants: CHART_TOOLTIP_STYLE in constants.ts
- Keyboard shortcut help: ? button in footer
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Decision outcome tracking (outcome field always null)
2. Consider a "milestones" or "evolution timeline" view
3. Wave comparison/detail view