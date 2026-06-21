# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-21 10:58 UTC+8

## System Status
- **Phase**: Multi-Agent Visual Era (Wave 235)
- **Waves in DB**: 162
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 20 |
| Dashboard tabs | 6 |
| Skills | 10 (+ 1 template) |
| Components | 22 |
| Exported components | 10 |
| GitHub commits | ~417 |
| Waves in DB | 162 |
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
| Canvas version | v2.2 (W235) |

## What exists
- All 6 tabs, mobile responsive, ARIA complete, keyboard navigable
- **Agent Live multi-agent node network canvas v2.2** (W235)
  - Dot grid (replacing line grid) — modern look
  - Dual-layer nebula (primary state + secondary ambient)
  - Ambient pulse waves emitting from active nodes
  - Glowing nodes with energy particle trails along bezier curves
  - Hover connection highlight (proximity-based bezier distance)
  - Selected node breathing halo with color-matched gradient
  - Node name labels on ALL nodes (orchestrator shows "HERMES")
  - Wave progress ring with leading dot + glow
  - Curved connection lines between nodes
  - Click-to-select nodes with detail popup (NodePopup)
  - Organic drift animation for all nodes
- **Agent Live HUD overlay v2** (W235) with:
  - Glassmorphism stat chips (backdrop-blur-xl, hover border glow)
  - Staggered entry animations for bottom stats
  - Wave progress bar with gradient glow effect
  - Spring animations on decision counter (+N)
  - Health/XP bars as motion.div animated width
  - Node count badge, phase tracker, level
  - Sub-agent badges with glow dots
- **agent-live-broadcast skill v2.0** with multi-agent protocol
  - 8 payload types: status, activity, sub-agent, sub-agent-update, sub-agent-remove, sub-agent-clear, node-pulse, decision-count, full-update
  - Sub-agent color palette (6 roles)
  - Full wave broadcast sequence (32 steps)
  - Phase progress guidelines with typical sub-agents
- **wave_protocol.md** now includes broadcast steps at every phase
- **API route** supports all v2.0 payload types (sub-agent-update, node-pulse, decision-count)
- Dead forwardToService code removed (W230)
- Health score guarded against 0/0 NaN
- Donut charts use percentage radii — no mobile clipping
- GitHub sync does real git push inline, status correct
- Page compiles in <1s

## What's next
1. Visual QA of node canvas with real broadcast data (sandbox network limits)
2. Per-wave replay with real phase data (requires schema change)
3. More analytics charts
4. Consider animated stat counters (number rolling effect)