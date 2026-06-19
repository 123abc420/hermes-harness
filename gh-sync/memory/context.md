# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 06:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 83)
- **Waves in DB**: 77
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 18 |
| Dashboard tabs | 6 |
| Skills | 15 |
| GitHub commits | 144 |
| Waves in DB | 77 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |
| Harness components | 25 |

## What exists
- Dashboard: single-fetch, 3-col overview, velocity, duration bars, build health
- Overview tab: 193 lines (layout orchestrator + BuildHealthCard)
- Build Health Card: lint status with 5-min cache, errors/warnings display
- HarnessDashboard: composite export for drop-in embedding
- Skills Section: category filter pills with AnimatePresence, 7 categories
- Memory health bars: color-coded usage indicators in Research tab
- Export contract: HarnessDashboard + HarnessErrorBoundary exported
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Skills usage tracking (which skills informed which decisions)
2. New feature development or UX polish
3. Trim insights.md (currently ~43% of cap)