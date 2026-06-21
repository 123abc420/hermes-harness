# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-21 15:33 UTC+8

## System Status
- **Phase**: Multi-Agent Visual Era (Wave 250)
- **Waves in DB**: 161
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 20 |
| Dashboard tabs | 6 |
| Skills | 10 (+ 1 template) |
| Components | 21 (BuildHealthCard removed, W247) |
| Exported components | 10 |
| GitHub commits | ~476 |
| Waves in DB | 161 |
| Wave success rate (recent 5) | 93.5% |
| Health score | 80+/100 |
| Network nodes | Multi-agent (orchestrator + sub-agents) |
| execSync calls | 0 |
| raw console.error in API | 0 |
| silent .catch() | 0 (logged via logDebug, W241) |
| unprotected fetch→json | 0 |
| Routes with zod validation | 9 of 9 (agent-status added W249) |
| Bare req.json() calls | 0 |
| Ungated client console.warn | 0 |
| Shared zod schemas | 9 (agentStatusPostSchema, W249) |
| Skills tracked in git | 10 (+ 1 template) |
| VALID_NODE_TYPES dead code | 0 (removed W234) |
| Activity log capacity | 50 (server) / 80 (client) |
| Canvas version | v2.4 (W237) |
| State color source | STATE_RGB in constants.ts (single truth) |
| page.tsx / harness-dashboard duplication | 0 (deduplicated W237b) |
| Tab switch animation | motion.div key={activeTab} (fixed W238) |
| SVG gradient IDs | useId() (fixed W238) |
| Stuck waves in DB | 0 (patched W239) |
| Hardcoded localhost URLs | 0 (fixed W239) |
| Misleading getStateRgb alias | 0 (renamed getStateColor, W240) |
| ACTIVITY_FILTERS icon duplication | 0 (derived from STATE_ICONS, W240) |
| Dead exports in schemas.ts | 0 (KNOWN_ACTIONS + safeParse removed, W241) |
| Unused imports | 0 (React removed from canvas, W241) |
| Dead hooks | 0 (useMetrics + useSpec removed, W242) |
| Record<string,unknown> in agent-status | 0 (typed interfaces, W242) |
| Dead dependencies | 0 (16 removed, W243) |
| Dead UI components | 0 (label/progress/toggle/build-health removed) |
| Duplicated types (WaveStatus, DecisionPriority) | 0 (single-sourced from schemas, W243) |
| Dead directories (examples/, mini-services/) | 0 (deleted W244) |
| Unvalidated POST routes | 0 (agent-status Zod-validated, W249) |
| Full-update injection risk | 0 (FULL_UPDATE_KEYS whitelist, W249) |
| Record<string,unknown> in API routes | 4 (all justified: YAML parser, forwarder, loose shape fields) |
| ignoreBuildErrors | false (strict TS enforced, W245) |
| Header color drift | 0 (uses getStateHex, W246) |
| Record<string,unknown> in use-agent-live | 0 (typed ServerXxx interfaces, W246) |
| Untyped PRIORITY_STYLES | 0 (DecisionPriority key, W246) |
| Dead BuildHealth infrastructure | 0 (removed W247) |
| DecisionCategory sync gap | 0 (derived from VALID_CATEGORIES, W247) |
| SSE duplication | 0 (createSSEConnection factory, W247) |
| Prisma-typed query params | 4 routes (W248) |
| useState for non-rendering values | 0 (scrollY+debounceRef→useRef, W249) |
| as AgentVisualState[] assertions | 0 (AgentSkill interface, W250) |
| cn() adoption | 6 harness files (W250) |
| Template-literal className in harness | 42 across 17 files (W250) |

## What exists
- All 6 tabs, mobile responsive, ARIA complete, keyboard navigable
- **Agent Live multi-agent node network canvas v2.4** (W236)
- **Agent Live HUD overlay v2.3** with glassmorphism, animations
- **page.tsx premium footer** (W236)
- **agent-live-broadcast skill v3.0** with multi-agent protocol
- Health score guarded against 0/0 NaN
- Donut charts use percentage radii
- GitHub sync does real git push inline
- **SSE reconnection via createSSEConnection factory** (W247)
- **Zod-validated agent-status POST** with .strict() (W249)
- **FULL_UPDATE_KEYS whitelist** prevents body injection (W249)
- **Typed DEMO_SEQUENCE** as discriminated union (W249)
- **Generic csv-export** preserves type safety at call sites (W249)
- **DecisionCategory derived from VALID_CATEGORIES** (W247, 20 categories)

## What's next
1. Visual QA of node canvas with real broadcast data (sandbox network limits)
2. Per-wave replay with real phase data (requires schema change)
3. More analytics charts
4. Consider animated stat counters (number rolling effect)