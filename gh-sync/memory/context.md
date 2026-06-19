# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 21:32 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 29)
- **Waves in DB**: 24
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 8 |
| GitHub commits | 51+ |
| Waves in DB | 24 |
| Wave success rate (recent 5) | 100% |
| Spanish strings remaining | 0 |
| Version hardcoded refs | 0 |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, dual success rate, pagination
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed (13 buttons), aria-labels (6 elements), aria-live (agent feed)
- Pagination: Load More with "Showing X of Y" on Waves and Decisions tabs
- Language: All UI strings in English (panel, store, canvas, footer)
- Version: Centralized in src/lib/constants.ts (HERMES_VERSION)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Loading skeleton for agent-live-panel initial render
2. Deduplicate LEVEL_NAMES across 3 files into single shared constant
3. Explore responsive/mobile polish opportunities