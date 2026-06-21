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

## 3D Module Architecture

- Large Three.js components (>200 lines) should split into shared/world/character/scene modules
- Module-level mutable state must use shared object (not `export let`) to avoid ESM import-reassignment errors
- Components sharing module-level refs must import from same shared module

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

## 3D Library Weight

- `@pixiv/three-vrm` (5.9MB) pulls WASM/GLSL shaders that cause Turbopack to hang in sandbox.
- `@react-three/postprocessing` (3.9MB) adds significant compile overhead for marginal visual gain.
- 10MB VRM model files in `public/` bloat the asset pipeline.
- ChibiCharacter (pure Three.js geometry, ~400 lines) renders instantly and looks great — prefer procedural geometry over model loading.
- If a library causes Turbopack to hang, remove it. The sandbox has CPU/memory constraints that make heavy WASM compilation infeasible.

## Dashboard Math Safety

- Division by zero in API routes produces `NaN` → `JSON.stringify(NaN)` = `null` in HTTP response. Always guard with `length > 0 ? ... : 0`.
- Client-side `value !== undefined` does NOT catch `null` (since `null !== undefined` is true). Use `value != null && typeof value === 'number'` for numeric display.

## Recharts Mobile Safety

- Recharts `Pie` with fixed pixel `innerRadius`/`outerRadius` clips when container is smaller than the radius. Use percentage strings (`"30%"`, `"46%"`) — they scale proportionally to the SVG viewport.

## Async Status Transitions

- `setTimeout` in API routes is unreliable — serverless/edge runtimes freeze the function after response is sent. The timer never fires.
- For status machines (syncing → connected), perform the real work inline and update status in the same request lifecycle.
- If simulating async work, use a polling pattern from the client instead of server-side setTimeout.
## Agent Live Visual Design

- Full-bleed canvas with HUD overlays > 2-column grid. The character should dominate the view.
- Canvas `position: absolute; inset-0; w-full h-full` inside a relative container gives the panel full control over canvas sizing.
- State-reactive backgrounds (brain waves, energy surges, spirals) make the avatar feel alive even when no data arrives.
- Particle bursts on state transitions provide immediate visual feedback for status changes.
- `rgba()` helper function with pre-computed RGB tuples per state is more efficient than string parsing in the draw loop.
- Scale factor `Math.min(W/500, H/600) * 2.2` keeps character proportional across screen sizes.

## Real-Time Broadcast Pattern

- Agent Live is dead without POST updates to `/api/harness/agent-status` during waves.
- The `agent-live-broadcast` skill provides a curl-based protocol for phase-by-phase updates.
- State → visual mapping matters: thinking=brain waves, executing=energy surges, celebrating=golden rings, error=red pulse, evolving=spiral, planning=hex grid.

## Canvas ResizeObserver Pattern

- Canvas with `absolute inset-0 w-full h-full` needs ResizeObserver — `useEffect([], [])` with `getBoundingClientRect()` captures stale dimensions after window resize.
- Store layout values in a `useRef` object. The draw loop reads from the ref each frame, so ResizeObserver updates are picked up on the next animation frame without re-creating the entire effect.
- Use `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` instead of `ctx.scale(dpr, dpr)` in resize — `setTransform` is absolute (not cumulative), so it's safe to call repeatedly.
- Don't forget `ro.disconnect()` in the effect cleanup.

## Canvas State Effect Completeness

- Each agent state should have a unique visual pattern. If a state has no effect, the canvas looks "dead" during that phase.
- 10 states = 10 unique effects. Missing any makes the "mind reflection" concept incomplete.

## Hooks Inside useEffect

- Never call `useRef()` inside a `useEffect` callback — React's rules-of-hooks linter catches this.
- For mutable draw-loop state (timers, targets), declare refs at the component level, not inside the effect. The draw loop reads them via closure over the ref's `.current`.

## Ambient Canvas Layers

- Three independent ambient layers (data rain, heartbeat pulses, character personality) make the canvas feel alive 24/7 without any wave activity.
- Data rain at 3-6% opacity is perceptible but not distracting. State-tinted so it matches the current mood.
- Character look-around every 5-8s with smooth interpolation breaks the "staring" effect. Mouse overrides auto-look.
