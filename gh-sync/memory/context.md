# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 21:02 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 26)
- **Waves in DB**: 21 (Wave 21 in DB = Wave 26 actual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (walk + expressions) + Chibi (8 gestures + arrival flash)
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 8 |
| GitHub commits | 47+ |
| Waves in DB | 21 |
| Wave success rate (overall) | 67% |
| Wave success rate (recent 5) | 100% |
| Tabs with error handling | 5/5 |
| Error boundaries | 1 (global) |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance (100%), real commit history, dual success rate
- Error handling: ErrorBlock component (5 tabs), HarnessErrorBoundary (global), isError+retry on all data hooks
- Category colors: 8 categories including skill (pink) and insight (amber)
- Dashboard API: real git data, recent success rate
- Package: @hermes/harness-dashboard v0.1.0 with export contract

## What's next
1. Accessibility: aria-labels, keyboard navigation, aria-live for agent feed
2. Pagination/infinite scroll for Waves and Decisions tabs
3. Language normalization (agent panel Spanish → English)