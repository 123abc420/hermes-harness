# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 17:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 147)
- **Waves in DB**: 147
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 6 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~275 |
| Waves in DB | 145 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |
| execSync calls | 0 |
| raw console.error in API | 0 |
| silent .catch() | 0 |
| unprotected fetch→json | 0 |
| Routes with zod validation | 8 of 9 (all body-parsing routes except agent-status POST) |
| Shared zod schemas | 8 |
| Skills tracked in git | 6 |

## What exists
- All 6 tabs, mobile responsive, ARIA complete, keyboard navigable
- Skills API, agent-status validation, demo auth, SSE cancel(), async execFile
- Centralized logger (logError + logDebug) across all 14 API routes
- ALL client-side fetch calls check .ok before .json()
- Wave replay auto-stops, phase timeline labeled estimated
- Shared zod schemas (src/lib/schemas.ts) with 8 input validators + validationError helper

## What's next
1. Consider zod for agent-status POST (complex discriminated union — low priority, already has manual validation)
2. Consider per-wave replay with real phase data (requires schema change)
3. All known issues resolved — zod coverage nearly complete