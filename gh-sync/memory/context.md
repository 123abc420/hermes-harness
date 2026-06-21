# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-21 17:45 UTC+8

## System Status
- **Phase**: Replay-First Era (Wave 256)
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 20 |
| Dashboard tabs | 6 |
| Skills | 10 (+ 1 template) |
| Components | 19 (canvas removed, SVG graph + replay added) |
| Exported components | 10 |
| GitHub commits | ~480 |
| Waves in DB | 166 (stuck waves patched W256) |
| Wave success rate (recent 5) | 93.5% |
| Health score | 80+/100 |
| Network nodes | SVG node graph (replay-first design) |
| execSync calls | 0 |
| raw console.error in API | 0 |
| silent .catch() | 0 (logged via logDebug, W241) |
| unprotected fetch→json | 0 |
| Routes with zod validation | 9 of 9 |
| Bare req.json() calls | 0 |
| Ungated client console.warn | 0 |
| Shared zod schemas | 11 |
| Skills tracked in git | 10 (+ 1 template) |
| VALID_NODE_TYPES dead code | 0 (removed W234) |
| Activity log capacity | 50 (server) / 80 (client) |
| Canvas version | N/A (replaced by SVG graph, W256) |
| State color source | getStateHex in constants.ts (single truth) |
| page.tsx / harness-dashboard duplication | 0 (deduplicated W237b) |
| Tab switch animation | motion.div key={activeTab} (fixed W238) |
| SVG gradient IDs | useId() (fixed W238) |
| Stuck waves in DB | 0 (patched W256) |
| Hardcoded localhost URLs | 0 (fixed W239) |
| Dead hooks | 0 (useMetrics + useSpec removed, W242) |
| Dead dependencies | 0 (16 removed, W243) |
| Dead UI components | 0 (canvas + HUD removed, W256) |
| Duplicated types | 0 (single-sourced from schemas, W243) |
| Dead directories | 0 (deleted W244) |
| Full-update injection risk | 0 (typed field extraction + Zod, W250) |
| ignoreBuildErrors | true (resilience mode, W256) |
| cn() adoption | 17 harness files (W250) |
| Inline .then(r =>) fetch chains | 0 (fetchJSON shared lib, W251) |
| Sync fs calls in API routes | 0 (async readdir/stat, W252) |
| Missing color map keys | 0 (error+success added, W253) |
| Loose Record color maps | 0 (typed with union keys, W253) |
| TS errors | 0 |

## What exists
- All 6 tabs, mobile responsive, ARIA complete, keyboard navigable
- **Agent Live Panel v5.0 — Replay-First Design** (W256)
  - Compact status bar: LIVE/OFFLINE indicator, state+message, wave count, decisions, version badge
  - `WaveReplayView`: timestamped timeline with play/pause/skip/loop/speed controls
  - Phase progress bar (6 segments: ASSESS→PLAN→EXECUTE→VERIFY→PERSIST→REPORT)
  - `AgentNetworkGraph`: clean SVG node graph, zero animation frames
- **agent-live-broadcast skill v3.0** with multi-agent protocol
- **wave-engine skill v3.0** — full 6-phase protocol with broadcast sequences
- Health score guarded against 0/0 NaN
- Donut charts use percentage radii
- GitHub sync does real git push inline
- **SSE reconnection via createSSEConnection factory** (W247)
- **Zod-validated agent-status POST** with .strict() (W249)
- **Shared `fetchJSON` in lib/fetch-json.ts** — 3 consumers (W251)
- **Typed full-update extraction + Zod arrays** (W250)
- **Generic csv-export** preserves type safety (W249)
- **DecisionCategory derived from VALID_CATEGORIES** (W247, 20 categories)
- **useDecisionTrends shared hook** with fetchJSON reuse (W250)
- **Per-hook staleTime tuning**: skills/github 60s, memory 30s (W250)
- **aria-label on all interactive elements** (W250)

## What's next
1. Persist wave activities to DB for cross-reload replay
2. Live view — show wave execution in real-time (user deferred: "mas dificil")
3. More analytics charts
4. Consider animated stat counters (number rolling effect)