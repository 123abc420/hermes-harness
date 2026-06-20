# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 09:00 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 98)
- **Waves in DB**: 92
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 19 |
| Export modules | 1 |
| GitHub commits | 167 |
| Waves in DB | 92 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |
| Stat cards | 6 |
| Category colors | 12 (including bug_fix alias) |

## What exists
- Decisions API: filtered groupBy, PATCH with field whitelist (security)
- Header health badge, bug_fix alias, SVG useId(), ErrorBlock/Skeleton guards
- Shared utilities: formatDuration, formatArgentinaTime, isErrorsTrendingDown in constants.ts
- Shared getGitData() in lib/git.ts (used by dashboard + github-status routes)
- 4 charts with ARIA accessibility labels (role="img" + aria-label)
- Prisma query logging gated to dev, WaveStatus includes 'interrupted'
- Dead store actions removed, Decision PATCH whitelisted

## What's next
1. Large component refactoring (agent-3d-sandbox 972 lines, agent-live-panel 645 lines)
2. Remaining chart: wave-duration-bars (motion.div, not Recharts)
3. Extract duplicated agent state color maps (3 definitions)