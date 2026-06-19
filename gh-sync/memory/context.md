# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 21:12 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 27)
- **Waves in DB**: 22
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 8 |
| GitHub commits | 49+ |
| Waves in DB | 22 |
| Wave success rate (recent 5) | 100% |
| ARIA attributes | 18 |
| Tabs with error handling | 5/5 |
| Error boundaries | 1 (global) |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, real commit history, dual success rate
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed (13 filter buttons), aria-labels (6 interactive elements), aria-live (agent feed)
- Category colors: 8 categories including skill (pink) and insight (amber)
- Package: @hermes/harness-dashboard v0.1.0 with export contract

## What's next
1. Pagination/infinite scroll for Waves and Decisions tabs
2. Language normalization (agent panel Spanish → English)
3. Loading state for agent-live-panel