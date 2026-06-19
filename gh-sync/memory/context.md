# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 22:40 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 35)
- **Waves in DB**: 29
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 10 |
| GitHub commits | 56+ |
| Waves in DB | 29 |
| Wave success rate (recent 5) | 100% |
| Keyboard a11y gaps | 0 |
| Spanish strings | 0 |
| Mobile overflow issues | 0 |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, dual success rate, pagination
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed (13 buttons), aria-labels (7+ elements), aria-live (agent feed), keyboard-navigable wave rows
- Pagination: Load More with "Showing X of Y" on Waves and Decisions tabs
- Language: All UI strings in English (including store defaults)
- Version: Centralized in src/lib/constants.ts (HERMES_VERSION, EVOLUTION_STAGES, LEVEL_NAMES, getLevelName)
- Agent panel: Loading skeleton (600ms), 2-column layout, 3D avatar, XP system
- Responsive: Filter pills scrollable on mobile, footer/bottom-bar collapse on sm:-
- Skills: 10 total
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. Performance audit (bundle size, React.memo on heavy components)
2. Add wave detail panel description field or metrics snapshot display
3. Consider adding a "changelog" or "release notes" skill for generating human-readable summaries