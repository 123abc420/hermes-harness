# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-21 10:41 UTC+8

## System Status
- **Phase**: Multi-Agent Visual Era (Wave 234)
- **Waves in DB**: 162
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 19 |
| Dashboard tabs | 6 |
| Skills | 10 (+ 1 template) |
| Components | 22 |
| Exported components | 10 |
| GitHub commits | ~416 |
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

## What exists
- All 6 tabs, mobile responsive, ARIA complete, keyboard navigable
- **Agent Live multi-agent node network canvas** (W233)
  - Starfield background with nebula gradients
  - Glowing nodes with energy particles flowing along connections
  - Curved connection lines between nodes
  - Wave progress ring around orchestrator
  - Click-to-select nodes with detail popup (NodePopup)
  - Organic drift animation for all nodes
- **Agent Live HUD overlay** with:
  - Wave overview bar: "WAVE N / X" + progress + phase badge
  - Decision counter with per-wave increment (+N)
  - Node count badge
  - Phase tracker, health, XP, waves, improvements
  - Sub-agent badges with color dots
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
1. Next cron wave will use v2.0 broadcast protocol (embedded in wave_protocol.md)
2. Per-wave replay with real phase data (requires schema change)
3. More analytics charts
4. Visual QA of node canvas with real broadcast data