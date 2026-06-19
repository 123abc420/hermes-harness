# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 03:15 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 62)
- **Waves in DB**: 56
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 106 |
| Waves in DB | 56 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Overview: health score badge with trend arrow, responsive sparklines, error banner with retry
- Agent Live: 3D avatar, phase tracker, health bar with trend arrow, error state indicators, standby with countdown
- All 6 tabs: explicit error state handling
- Unified category colors: lib/category-colors.ts (tw + hex)
- **Shared chart constants**: CHART_TOOLTIP_STYLE, CHART_TOOLTIP_STYLE_DARK in constants.ts
- Keyboard shortcut help: ? button in footer
- Insights: covers all major learning clusters through W61
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Explore adding a wave comparison or detail view
2. Consider wave duration visualization
3. Decision outcome tracking (outcome field always null)