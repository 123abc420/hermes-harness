# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 22:02 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 32)
- **Waves in DB**: 27
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 10 |
| GitHub commits | 54+ |
| Waves in DB | 27 |
| Wave success rate (recent 5) | 100% |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, dual success rate, pagination
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed (13 buttons), aria-labels (6 elements), aria-live (agent feed)
- Pagination: Load More with "Showing X of Y" on Waves and Decisions tabs
- Language: All UI strings in English
- Version: Centralized in src/lib/constants.ts (HERMES_VERSION, LEVEL_NAMES, getLevelName)
- Agent panel: Loading skeleton (600ms), 2-column layout, 3D avatar, XP system
- Responsive: Filter pills scrollable on mobile, footer/bottom-bar collapse on sm:-
- Skills: 10 total (2 new: responsive-audit, language-normalization)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Deduplicate EVOLUTION_STAGES into constants (canvas still has local copy with extra visual fields)
2. Add keyboard navigation support (Tab order, Escape to close)
3. Performance audit (bundle size, unnecessary re-renders)