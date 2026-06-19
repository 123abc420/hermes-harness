# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 03:05 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 61)
- **Waves in DB**: 55
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 14 |
| GitHub commits | 105 |
| Waves in DB | 55 |
| Wave success rate (recent 5) | 100% |
| Health score | ~90/100 (stable) |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch, 3-col overview, Decision Timeline, wave velocity, duration column
- Overview: health score badge with trend arrow, responsive sparklines, error banner with retry
- Agent Live: 3D avatar, phase tracker, health bar with trend arrow, error state indicators, standby with countdown, **correct architecture category color**
- All 6 tabs: explicit error state handling
- **Unified category colors**: lib/category-colors.ts (single source of truth, tw + hex)
- **Color swap bug fixed**: skill/insight pie chart colors now match badges
- Keyboard shortcut help: ? button in footer with animated popover
- UX: Keyboard shortcuts (1-6), kbd badges on lg+, ? help on all sizes
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Explore adding a wave comparison or diff view
2. Consider outcome tracking for decisions (outcome field always null)
3. Extract chart tooltip style to shared constant