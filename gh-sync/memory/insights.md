# Insights — Learned Patterns

> Accumulated lessons from waves. Append new insights, never overwrite.

## Core Architecture

- Skills should be DATA (markdown), not code. They influence the prompt but don't modify source.
- Memory caps are critical: ~800 tokens for context, ~2000 for insights.
- The spec is the single source of truth. Build FROM the spec, not towards it.
- "Improving reliability is less about the model and more about the harness."

## Platform (chat.z.ai)

- Turbopack caches aggressively — MUST rm -rf .next after renaming/moving files
- Cron minimum interval: 5 minutes. All tools FREE through the platform.

## Wave Engineering

- Waves can stay "running" if interrupted — always check at ASSESS
- Wave engine MUST PATCH wave to "completed" at end of PERSIST
- After multi-file rewrites, grep for imports to find dead files

## API & Data

- A hook can reference an API route that doesn't exist — no build error, just empty data. ALWAYS verify endpoints exist.
- Composite APIs: always override DB fields with live git data
- Prisma groupBy is free count metadata for list endpoints
- Never spread request body directly into Prisma `data:` — whitelist allowed fields with a Set
- Prisma Float columns reject non-numeric at query time — one bad row crashes `findMany()`. Validate before insert.
- Raw SQL inserts bypass Prisma validation — type mismatches persist silently until Prisma reads them back.
- Wrap non-critical queries (metrics) in `.catch()` so one bad row can't bring down the composite API.

## UX & Responsive

- `flex justify-between` without `flex-wrap` is the #1 mobile overflow cause
- Always add `shrink-0` to children inside scrollable containers
- Zero isError checks = misleading empty states on network failures
- `flex-1` text without `min-w-0` = `truncate`/`line-clamp` fails. Always pair them
- Fixed heights consume 75%+ of small mobile viewports — use responsive breakpoints
- Dropdown `absolute right-0` overflows mobile — use `left-0 sm:left-auto sm:right-0`

## Performance

- Zustand does NOT auto-batch — multiple `set()` = multiple re-renders. Batch into one.
- shadcn/ui `add` generates 30+ files; audit early, remove aggressively

## Type Safety

- `catch (err: any)` disables narrowing — always use `unknown` + `instanceof Error`
- Union types silently fall out of sync with data — grep DB/API for all status values
- Props in type annotation but NOT in destructured params = silent no-op. Always cross-check.

## DRY & Shared Utilities

- Extract early: duplicated logic → lib/ utilities with typed interfaces
- ESM `export let` is not reassignable — use mutable object pattern for shared state
- When consolidating duplicates, verify semantic equivalence — some "copies" have distinct edge-case behavior

## Component Extraction

- Extract hooks for self-contained logic (replay, countdown) — keeps components focused on rendering
- Dialog components are high-value extraction targets: self-contained, own state, reusable
- Internal sub-components (<50 lines, single-use) can stay inline — don't over-fragment
- Export shared constants (STATUS_COLORS) from the most natural file — avoids per-component constants files

## Data Hygiene

- Category enums drift over time — aliases mask DB quality issues. Fix data first (updateMany), then remove aliases.
- Use groupBy to audit category distribution before and after migration.

## JSX Pitfalls

- `className="... {expr()}"` — {} is LITERAL TEXT in a string. MUST use backticks.
- SVG `<linearGradient id="...">` IDs must be unique per instance — always use `useId()`.

## Single-Source-of-Truth Pattern

- Define color/config maps once as canonical object, derive all consumers from it
- When DB adds enum value, only one file needs updating — all 8+ consumers auto-sync
- Never show aggregate score without breakdown — expose sub-scores in two places (inline + tooltip)

## Event Loop & Process

- `execSync` blocks ENTIRE server — ALWAYS use `execFile` (async).
- ReadableStream `cancel()` is NOT optional for SSE — browser tab close doesn't always fire abort. Hoist interval refs to outer scope.
- `req.json()` without `.catch(() => null)` throws on malformed JSON — always use the safety pattern.

## Input Validation (Zod)

- `req.json()` then `if (!field)` is fragile — use zod `safeParse` with typed schemas.
- Enum values drift from DB — query `DISTINCT` before writing schemas.
- Freeform fields (category, action): `z.string().min(1)`, not enums. Centralize in `src/lib/schemas.ts`.

## Git & Persistence

- `.gitignore` patterns without leading `/` match ANY directory. `skills/` matches `gh-sync/skills/`. Use `/skills/` for root-only.
- If a file keeps "disappearing", check `.gitignore` FIRST.

## Client-Side Logging

- `console.warn` in client hooks pollutes production — gate behind `process.env.NODE_ENV !== 'production'`.
- Server-side `logError`/`logDebug` are server-only. Client code needs its own dev-gate pattern.

## Sandbox Process Lifecycle

- chat.z.ai sandbox kills ALL child processes when a `bash` tool call ends (cgroup-level cleanup).
- `nohup`, `setsid`, `disown`, `detached: true` — NONE survive the cgroup cleanup.
- The ONLY strategy: start the server fresh in EVERY wave/response, keep it alive with `sleep` during the tool call.
- Production build (`next start` from `.next/standalone/`) starts in ~1s — fast enough for per-wave startup.

## Dashboard Math Safety

- Division by zero in API routes produces `NaN` → `JSON.stringify(NaN)` = `null` in HTTP response. Always guard with `length > 0 ? ... : 0`.
- Client-side `value !== undefined` does NOT catch `null` (since `null !== undefined` is true). Use `value != null && typeof value === 'number'` for numeric display.

## Recharts Mobile Safety

- Recharts `Pie` with fixed pixel `innerRadius`/`outerRadius` clips when container is smaller than the radius. Use percentage strings (`"30%"`, `"46%"`) — they scale proportionally to the SVG viewport.

## Async Status Transitions

- `setTimeout` in API routes is unreliable — serverless/edge runtimes freeze the function after response is sent. The timer never fires.
- For status machines (syncing → connected), perform the real work inline and update status in the same request lifecycle.
- If simulating async work, use a polling pattern from the client instead of server-side setTimeout.
## Agent Live Visual Design (Replay-First, W256)

- SVG node graph + timeline replay replaced the canvas avatar system (W256).
- `AgentNetworkGraph` uses pure SVG with ResizeObserver — zero requestAnimationFrame, zero particles.
- Replay timeline shows timestamped activities with play/pause/loop/speed controls.
- Compact status bar (LIVE/OFFLINE, state, message, wave count, version) above the replay view.
- Nodes receive state-reactive glow via SVG `<animate>` — no JS animation loop needed.

## Real-Time Broadcast Pattern

- Agent Live is dead without POST updates to `/api/harness/agent-status` during waves.
- The `agent-live-broadcast` skill provides a curl-based protocol for phase-by-phase updates.
- State → color mapping matters: thinking=cyan, executing=rose, verifying=green, planning=violet, celebrating=amber, error=red. Consistent via `getStateHex()`.

## SVG Graph ResizeObserver Pattern (W256)

- SVG uses `useCallback` ref + `ResizeObserver` to track container dimensions.
- No `useMemo` for ResizeObserver (causes React child error) — use `useRef<ResizeObserver>` + `useCallback`.
- No DPR scaling needed — SVG is resolution-independent.
- Always disconnect observer in the callback ref when a new element arrives.

## SVG Node State Visuals (W256)

- Each node state maps to a color via `getStateHex()` — consistent across graph, timeline, and status bar.
- Active nodes (executing, thinking, verifying) get a pulsing glow ring via SVG `<animate>`.
- Idle/offline nodes render dimmer — inner dot is hollow, state indicator at 30% opacity.
- No per-state animation effects needed — the timeline provides the "alive" feeling.

## Multi-Agent Visual Design (Replay-First, W256)

- SVG node graph shows agent world — nodes for roles, edges for data flow, animated dots for active connections.
- Store is single source of truth for node state — graph reads from Zustand store.
- Hover shows message tooltip. Click selects node with dashed selection ring (AnimatePresence).
- Orchestrator node is always visible as fallback.

## Replay System Design (W256)

- Activities stored newest-first in Zustand; reversed for oldest-to-newest display.
- Phase grouping dividers inserted when phase changes between consecutive entries.
- No auto-scroll — timeline clips to viewport via `overflow-hidden` (W258/W259).
- Speed options: 0.5x (3s), 1x (1.5s), 2x (750ms), 4x (375ms) per step.
- Loop mode replays automatically from oldest when reaching newest.

## Sandbox Network Isolation

- chat.z.ai sandbox uses cgroup network restrictions — `curl`/`fetch` from within the sandbox to `localhost:3000` frequently times out.
- Server binds to `0.0.0.0:3000` but self-referencing HTTP calls from within the same sandbox are unreliable.
- The Agent Live SSE system works fine for browser clients (they connect from outside the sandbox). The issue is only with server-to-self calls.
- When removing a dependency on an external service, also remove all forwarding/retry code — dead forwarding code generates log noise on every request.

## Dead Code Hygiene

- When an external service is removed (e.g., port-3005 mini-service), ALL code that references it must be removed: the function, the constant, and every call site.
- Best-effort forwarding with `.catch(() => logDebug(...))` seems harmless but creates persistent log noise. Remove entirely if the service is gone.

## Skill ↔ Cron Integration

- The broadcast skill must be embedded in the wave protocol itself, not just referenced.
- Every phase transition should have explicit broadcast steps in wave_protocol.md.
- Use `curl --max-time 3 || true` pattern — broadcasts should never block a wave.
- The `broadcast()` shell function makes it trivial to include in every wave.

## Stale Component Duplication

- When `page.tsx` and `harness-dashboard.tsx` both render the same dashboard, improvements to one silently miss the other. The one actually rendered (page.tsx) gets stale.
- This is the #1 feature gap risk in exportable module architectures.
- **FIXED (W237b)**: page.tsx is now a 12-line thin wrapper that imports HarnessDashboard. No duplication possible.
- **LESSON**: When extracting shared components, also check for local shadowed imports that prevent the shared version from being used.
