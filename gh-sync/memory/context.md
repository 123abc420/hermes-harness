# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-21 12:04 UTC+8

## System Status
- **Phase**: Multi-Agent Visual Era (Wave 238)
- **Waves in DB**: 164
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 20 |
| Dashboard tabs | 6 |
| Skills | 10 (+ 1 template) |
| Components | 22 |
| Exported components | 10 |
| GitHub commits | ~422 |
| Waves in DB | 163 |
| Wave success rate (recent 5) | 60% |
| Health score | 76/100 |
| Network nodes | Multi-agent (orchestrator + sub-agents) |
| execSync calls | 0 |
| raw console.error in API | 0 |
| silent .catch() | 0 |
| unprotected fetch→json | 0 |
| Routes with zod validation | 8 of 9 |
| Bare req.json() calls | 0 |
| Ungated client console.warn | 0 |
| Shared zod schemas | 8 |
| Skills tracked in git | 10 (+ 1 template) |
| VALID_NODE_TYPES dead code | 0 (removed W234) |
| Activity log capacity | 50 (server) / 80 (client) |
| Canvas version | v2.4 (W237) |
    | Performance | 3 useMemo + 6 useCallback optimizations |
| State color source | STATE_RGB in constants.ts (single truth) |
| page.tsx / harness-dashboard duplication | 0 (deduplicated W237b) |
| Tab switch animation | motion.div key={activeTab} (fixed W238) |
| SVG gradient IDs | useId() (fixed W238) |

## What exists
- All 6 tabs, mobile responsive, ARIA complete, keyboard navigable
- **Agent Live multi-agent node network canvas v2.3** (W236)
  - Dot grid — modern look
  - Dual-layer nebula (primary state + secondary ambient)
  - Ambient pulse waves emitting from active nodes
  - Glowing nodes with energy particle trails along bezier curves
  - **Smart bezier control points** — curves perpendicular to line, distance-scaled, direction-seeded (W236)
  - Hover connection highlight (proximity-based bezier distance)
  - Selected node breathing halo with color-matched gradient
  - Node name labels on ALL nodes (orchestrator shows "HERMES")
  - Wave progress ring with leading dot + glow
  - **Two-tier node spawn radius** — first 4 agents at 0.18, rest at 0.28 (W236)
  - Click-to-select nodes with detail popup (NodePopup)
  - Organic drift animation for all nodes
  - STATE_RGB imported from constants.ts (single source of truth)
- **Agent Live HUD overlay v2.3** (W235+ polished) with:
  - Glassmorphism stat chips (backdrop-blur-xl, hover border glow)
  - Staggered entry animations for bottom stats
  - Wave progress bar with gradient glow effect
  - Breathing glow on state badge (animated box-shadow, 2.5s cycle)
  - Shimmer sweep on health + XP progress bars
  - Spring animations on decision counter (+N)
  - Health/XP bars as motion.div animated width
  - Node count badge, phase tracker, level
  - Sub-agent badges with glow dots
  - **State filter pills use getStateHex() from constants.ts** (W236)
- **page.tsx premium footer** (W236)
  - Parallax dot-pattern background (scroll-reactive)
  - Sliding tab indicator with spring motion
  - Wave activity sparkline (inline SVG)
  - Success rate pulse bar (animated)
  - System uptime from first wave
  - Gradient footer separator
  - Per-tab dot color indicators
- **agent-live-broadcast skill v2.0** with multi-agent protocol
  - 8 payload types
  - Sub-agent color palette (6 roles)
  - Full wave broadcast sequence (32 steps)
- **wave_protocol.md** includes broadcast steps at every phase
- **API route** supports all v2.0 payload types
- Health score guarded against 0/0 NaN
- Donut charts use percentage radii — no mobile clipping
- GitHub sync does real git push inline, status correct
- Page compiles in <1s

## What's next
1. Visual QA of node canvas with real broadcast data (sandbox network limits)
2. Per-wave replay with real phase data (requires schema change)
3. More analytics charts
4. Consider animated stat counters (number rolling effect)