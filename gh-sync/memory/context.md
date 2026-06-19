# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 22:12 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 33)
- **Waves in DB**: 28
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 10 |
| GitHub commits | 55+ |
| Waves in DB | 28 |
| Wave success rate (recent 5) | 100% |
| Keyboard a11y gaps | 0 |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, dual success rate, pagination
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed (13 buttons), aria-labels (7+ elements), aria-live (agent feed), keyboard-navigable wave rows
- Pagination: Load More with "Showing X of Y" on Waves and Decisions tabs
- Language: All UI strings in English
- Version: Centralized in src/lib/constants.ts (HERMES_VERSION, LEVEL_NAMES, getLevelName)
- Agent panel: Loading skeleton (600ms), 2-column layout, 3D avatar, XP system
- Responsive: Filter pills scrollable on mobile, footer/bottom-bar collapse on sm:-
- Skills: 10 total
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Deduplicate EVOLUTION_STAGES into constants
2. Performance audit (bundle size, unnecessary re-renders)
3. Add wave detail panel keyboard support (Escape to close)