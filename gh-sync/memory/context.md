# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 21:42 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 30)
- **Waves in DB**: 25
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 8 |
| GitHub commits | 52+ |
| Waves in DB | 25 |
| Wave success rate (recent 5) | 100% |
| LEVEL_NAMES duplicates | 1 (canonical in constants.ts) |
| Spanish strings remaining | 0 |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, dual success rate, pagination
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed (13 buttons), aria-labels (6 elements), aria-live (agent feed)
- Pagination: Load More with "Showing X of Y" on Waves and Decisions tabs
- Language: All UI strings in English
- Version: Centralized in src/lib/constants.ts (HERMES_VERSION, LEVEL_NAMES, getLevelName)
- Agent panel: Loading skeleton (600ms), 2-column layout, 3D avatar, XP system
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Responsive/mobile polish (test on small viewports)
2. Deduplicate EVOLUTION_STAGES into constants (canvas still has local copy with extra visual fields)
3. Add keyboard navigation support (Tab order, Escape to close)