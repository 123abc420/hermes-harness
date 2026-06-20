# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 08:50 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 97)
- **Waves in DB**: 91
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 19 |
| Export modules | 1 |
| GitHub commits | 166 |
| Waves in DB | 91 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |
| Stat cards | 6 |
| Category colors | 12 (including bug_fix alias) |

## What exists
- Decisions API: filtered groupBy, PATCH with field whitelist (security)
- Header health badge uses template literal
- bug_fix category alias in color map
- SVG gradient IDs use React useId()
- Tab 5: "Analytics" with ErrorBlock + Skeleton guards
- formatDuration + formatArgentinaTime shared utilities in constants.ts
- WaveStatus type includes 'interrupted'
- Dead store actions removed
- Prisma query logging gated to dev only
- All empty states, null guards, keyboard shortcuts, balanced layouts

## What's next
1. Chart accessibility labels (aria-label on Recharts containers)
2. Large component refactoring (agent-3d-sandbox 972 lines, agent-live-panel 645 lines)
3. Duplicated git data fetching logic (dashboard + github-status routes)