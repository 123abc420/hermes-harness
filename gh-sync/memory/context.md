# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 03:25 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 63)
- **Waves in DB**: 57
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 107 |
| Waves in DB | 57 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Overview: health score badge with trend arrow, responsive sparklines, error banner with retry
- Agent Live: 3D avatar, phase tracker, health bar with trend arrow, error state indicators, standby with countdown
- All 6 tabs: explicit error state handling
- **All 4 decision badge consumers** use shared CATEGORY_TW (decisions-tab, agent-live, waves detail, research via hex)
- Wave detail dialog: shows category colors, action, description, **targetFile**
- Unified category colors: lib/category-colors.ts
- Shared chart constants: CHART_TOOLTIP_STYLE in constants.ts
- Keyboard shortcut help: ? button in footer
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Wave duration visualization (chart or bars)
2. Decision outcome tracking (outcome field always null)
3. Consider a "milestones" or "evolution timeline" view