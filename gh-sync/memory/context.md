# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 21:22 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 28)
- **Waves in DB**: 23
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 8 |
| GitHub commits | 50+ |
| Waves in DB | 23 |
| Wave success rate (recent 5) | 100% |
| Tabs with pagination | 2 (Waves, Decisions) |
| Tabs with error handling | 5/5 |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, dual success rate, pagination
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed (13 buttons), aria-labels (6 elements), aria-live (agent feed)
- Pagination: Load More with "Showing X of Y" on Waves and Decisions tabs
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Language normalization (agent panel Spanish → English)
2. Loading state for agent-live-panel
3. Centralize version string (v0.4.0 hardcoded in 2 places)