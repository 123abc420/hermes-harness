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
- Sandbox kills ALL child processes on tool call end (cgroup). `nohup`/`setsid`/`disown` — NONE survive.
- Start server fresh EVERY wave. Production build starts in ~1s.

## Wave Engineering

- Waves can stay "running" if interrupted — always check at ASSESS
- Wave engine MUST PATCH wave to "completed" at end of PERSIST
- After multi-file rewrites, grep for imports to find dead files
- The broadcast skill must be embedded in the wave protocol itself. Use `curl --max-time 3 || true`.

## API & Data

- A hook can reference a non-existent API route — no build error, just empty data. ALWAYS verify endpoints exist.
- Composite APIs: always override DB fields with live git data
- Never spread request body into Prisma `data:` — whitelist allowed fields with a Set
- Prisma Float rejects non-numeric at query time — one bad row crashes `findMany()`. Validate before insert.
- Wrap non-critical queries (metrics) in `.catch()` so one bad row can't bring down the composite API.

## UX & Responsive

- `flex justify-between` without `flex-wrap` is the #1 mobile overflow cause
- `flex-1` text without `min-w-0` = `truncate`/`line-clamp` fails. Always pair them
- Zero isError checks = misleading empty states on network failures
- Fixed heights consume 75%+ of small mobile viewports — use responsive breakpoints

## Performance

- Zustand does NOT auto-batch — multiple `set()` = multiple re-renders. Batch into one.
- shadcn/ui `add` generates 30+ files; audit early, remove aggressively

## Type Safety

- `catch (err: any)` disables narrowing — always use `unknown` + `instanceof Error`
- Union types silently fall out of sync with data — grep DB/API for all status values
- Props in type annotation but NOT in destructured params = silent no-op.

## DRY & Component Extraction

- Extract early: duplicated logic → lib/ utilities with typed interfaces
- ESM `export let` is not reassignable — use mutable object pattern for shared state
- Extract hooks for self-contained logic (replay, countdown) — keeps components focused on rendering
- Internal sub-components (<50 lines, single-use) can stay inline — don't over-fragment
- When extracting shared components, check for local shadowed imports that prevent the shared version from being used.

## Data & Dead Code Hygiene

- Category enums drift over time — aliases mask DB quality issues. Fix data first (updateMany), then remove aliases.
- When an external service is removed, ALL code referencing it must be removed (function, constant, every call site).
- Dead forwarding code with `.catch(() => logDebug(...))` creates persistent log noise. Remove entirely.

## JSX & SVG Pitfalls

- `className="... {expr()}"` — {} is LITERAL TEXT in a string. MUST use backticks.
- SVG `<linearGradient id>` IDs must be unique per instance — always `useId()`.
- Recharts `Pie` with fixed pixel radii clips on small containers. Use percentage strings.

## Event Loop & Input Validation

- `execSync` blocks ENTIRE server — ALWAYS use `execFile` (async).
- ReadableStream `cancel()` is NOT optional for SSE — hoist interval refs to outer scope.
- `req.json()` without `.catch(() => null)` throws on malformed JSON.
- Use zod `safeParse` with typed schemas. Freeform fields: `z.string().min(1)`, not enums. Centralize in `src/lib/schemas.ts`.

## Math Safety

- Division by zero → `NaN` → `JSON.stringify(NaN)` = `null`. Always guard with `length > 0 ? ... : 0`.
- `value !== undefined` does NOT catch `null`. Use `value != null && typeof value === 'number'`.

## Git & Persistence

- `.gitignore` patterns without leading `/` match ANY directory. Use `/skills/` for root-only.

## Client-Side Logging

- `console.warn` in client hooks pollutes production — gate behind `process.env.NODE_ENV !== 'production'`.

## Agent Live — Replay-First Design (W256+)

- SVG node graph + timeline replay replaced canvas. Pure SVG with ResizeObserver — zero `requestAnimationFrame`.
- State → color via `getStateHex()`: thinking=cyan, executing=rose, verifying=green, planning=violet, celebrating=amber.
- Active nodes get SVG `<animate>` glow ring. No JS animation loop.
- Replay: activities newest-first in Zustand, reversed for display. Phase grouping dividers. No auto-scroll — clips to viewport (W258/W259).
- Multi-agent: nodes for roles, edges for data flow, animated dots for active connections. Store is single source of truth.
- Broadcast skill: POST to `/api/harness/agent-status` at every phase transition. `curl --max-time 3 || true`.
- Replay loop: isLooping captured by setInterval — use ref pattern (isLoopingRef + useEffect sync) for real-time toggle (W265).

## Sandbox Network

- Self-referencing HTTP calls (`curl` to `localhost:3000`) frequently time out from within the sandbox.
- SSE works fine for browser clients (outside sandbox). Issue is server-to-self only.

## React Hooks — Recursive Callbacks

- A `useCallback` that references itself creates a "used before declared" lint error. Fix: store the fn in a ref, update ref in `useEffect`, call via `ref.current()` inside the callback.
- `useRef.current = value` during render triggers react-hooks/refs lint error. Must assign inside `useEffect`.
- Recursive `setTimeout` is safer than `setInterval` for retry loops — each attempt independently schedules the next, no dead-state if the interval is cleared.

## Type Safety — Enforcement

- `ignoreBuildErrors: true` is a trap — it lets type errors accumulate silently until fixing them requires a dedicated sweep. Remove it as soon as tsc passes.
- When narrowing union types (e.g., `string` → `TabValue`), boundary casts are inevitable at framework edges (shadcn `onValueChange`, `CommandPalette` callbacks). Use `as` at the narrowest possible boundary.
- Generic JSX syntax (`<Component<Type>`) isn't supported by all ESLint parsers. Type the callback parameter directly instead.
- After removing `ignoreBuildErrors`, add `npx tsc --noEmit` to the VERIFY phase so future waves catch type errors immediately.

## API Upsert Patterns

- POST routes that create records MUST accept an ID/key for upsert — otherwise callers create duplicates when trying to update. The waves POST created phantom entries for years before W278 fixed it.
- Zod schema strips unknown fields silently. If the wave protocol sends `waveNumber` and `status` but the schema only accepts `summary`, those fields vanish without error.
- Use Prisma-generated types (`HarnessWaveUpdateInput`) for update data, not `Record<string, unknown>`. Prisma validates types at compile time.

## Zustand Subscription Patterns

- `useStore()` without a selector subscribes to the ENTIRE store — every field change triggers re-render. Always use `useStore(s => s.field)` for stable refs like functions, or `useShallow` for multiple fields.
- Zustand actions (functions) are stable references — selecting `s => s.setStatus` never causes re-renders.

## Accessibility — Layered Reduced-Motion

- framer-motion components need JS-level `usePrefersReducedMotion()` (W277). But CSS `@keyframes` animations (animate-ping, animate-pulse, custom rotations) bypass React entirely.
- The global CSS `@media (prefers-reduced-motion: reduce)` rule is the safety net for all non-framer-motion animations. Add it once in globals.css.
- **SVG SMIL animations (`<animate>`, `<animateMotion>`) bypass BOTH framer-motion AND CSS media queries.** They must be gated at the JSX level via a `reducedMotion` prop (W288).

## Spec Compliance Accuracy

- Hardcoded `done: true` in checklists creates false compliance signals. Every checklist item should either be dynamically checked or honestly reflect what exists.