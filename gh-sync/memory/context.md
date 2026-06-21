# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-21 08:15 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 228)
- **Waves in DB**: 158
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 9 (+ 1 template) |
| Components | 29 |
| Exported components | 10 |
| GitHub commits | ~403 |
| Waves in DB | 158 |
| Wave success rate (recent 5) | 60% |
| Health score | 76/100 |
| execSync calls | 0 |
| raw console.error in API | 0 |
| silent .catch() | 0 |
| unprotected fetch→json | 0 |
| Routes with zod validation | 8 of 9 |
| Bare req.json() calls | 0 |
| Ungated client console.warn | 0 |
| Shared zod schemas | 8 |
| Skills tracked in git | 9 (+ 1 template) |

## What exists
- All 6 tabs, mobile responsive, ARIA complete, keyboard navigable
- Skills API, agent-status validation, demo auth, SSE cancel(), async execFile
- Centralized logger (logError + logDebug) across all 14 API routes
- ALL client-side fetch calls check .ok before .json()
- Wave replay auto-stops, phase timeline labeled estimated
- Shared zod schemas (src/lib/schemas.ts) with 8 input validators + validationError helper
- 2D Canvas avatar with orbiting ring, particle trails, station glow, vignette (W228)
- Health score guarded against 0/0 NaN (W227)
- Donut charts use percentage radii — no mobile clipping (W227)
- GitHub sync does real git push inline, status correct (W228)
- Dead deps removed: postprocessing, @types/three (W227)
- Page compiles in <1s

## QA Status (W228)
- Agent Live: ✅ avatar visible, health score correct, no layout issues
- Overview: ✅ stat cards, charts, no truncation
- Waves: ✅ no duplicates, proper status colors
- Decisions: ✅ renders correctly
- Analytics: ✅ charts render (donut, timeline, breakdown)
- GitHub: ✅ shows connected status (fixed from "syncing")
- Mobile (375px): ✅ responsive, no overflow, tabs shortened

## What's next
1. Consider removing dead 3D component files (agent-3d-*.tsx)
2. Consider zod for agent-status POST (low priority)
3. Consider per-wave replay with real phase data (requires schema change)