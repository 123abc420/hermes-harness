# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 08:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 94)
- **Waves in DB**: 88
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 19 |
| Export modules | 1 |
| GitHub commits | 162 |
| Waves in DB | 88 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |
| Stat cards | 6 |
| Category colors | 11 |

## What exists
- Decisions API: filtered groupBy, clickable Wave→Waves navigation (DecisionCard has own useHarnessStore call)
- Dead research route + ResearchItem type removed (API routes: 16→15)
- Tab 5: "Analytics" with ErrorBlock + Skeleton guards on error/loading
- formatDuration utility in constants.ts (shared across waves-tab)
- All empty states, null guards, keyboard shortcuts, balanced layouts

## What's next
1. Skills usage tracking (which skills informed which decisions)
2. New feature development or UX polish
3. Consider agent live feed improvements