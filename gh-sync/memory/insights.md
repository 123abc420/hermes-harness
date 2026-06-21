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
- Self-referencing HTTP calls (`curl` to `localhost:3000`) frequently time out from within sandbox. SSE works for browser clients only.

## Wave Engineering

- Waves can stay "running" if interrupted — always check at ASSESS
- Wave engine MUST PATCH wave to "completed" at end of PERSIST
- After multi-file rewrites, grep for imports to find dead files
- The broadcast skill must be embedded in the wave protocol itself. Use `curl --max-time 3 || true`.

## API & Data

- A hook can reference a non-existent API route — no build error, just empty data. ALWAYS verify endpoints exist.
- Composite APIs: always override DB fields with live git data
- Never spread request body into Prisma `data:` — whitelist allowed fields with a Set
- Prisma Float rejects non-numeric at query time — validate before insert. Wrap non-critical queries in `.catch()`.
- POST routes that create records MUST accept an ID/key for upsert — otherwise callers create duplicates.
- Zod schema strips unknown fields silently. Centralize schemas in `src/lib/schemas.ts`.
- Use Prisma-generated types for update data, not `Record<string, unknown>`.

## UX & Responsive

- `flex justify-between` without `flex-wrap` is the #1 mobile overflow cause
- `flex-1` text without `min-w-0` = `truncate`/`line-clamp` fails. Always pair them
- Zero isError checks = misleading empty states on network failures
- Fixed heights consume 75%+ of small mobile viewports — use responsive breakpoints

## Performance

- Zustand does NOT auto-batch — multiple `set()` = multiple re-renders. Batch into one.
- `useStore()` without selector subscribes to ENTIRE store. Always use `useStore(s => s.field)`.
- shadcn/ui `add` generates 30+ files; audit early, remove aggressively

## Type Safety

- `catch (err: any)` disables narrowing — always use `unknown` + `instanceof Error`
- Union types silently fall out of sync with data — grep DB/API for all status values
- `ignoreBuildErrors: true` is a trap — remove it as soon as tsc passes. Add `npx tsc --noEmit` to VERIFY.
- Boundary casts (`as`) are inevitable at framework edges — use at the narrowest possible boundary.
- Props in type annotation but NOT in destructured params = silent no-op.

## DRY & Component Extraction

- Extract early: duplicated logic → lib/ utilities with typed interfaces
- ESM `export let` is not reassignable — use mutable object pattern for shared state
- Extract hooks for self-contained logic (replay, countdown). Internal sub-components (<50 lines, single-use) can stay inline.
- When extracting shared components, check for local shadowed imports that prevent usage.

## Data & Dead Code Hygiene

- Category enums drift over time — aliases mask DB quality issues. Fix data first, then remove aliases.
- When an external service is removed, ALL code referencing it must be removed entirely.
- Dead forwarding code with `.catch(() => logDebug(...))` creates persistent log noise. Remove entirely.

## JSX, SVG & Math Pitfalls

- `className="... {expr()}"` — {} is LITERAL TEXT. MUST use backticks.
- SVG `<linearGradient id>` IDs must be unique per instance — always `useId()`.
- Recharts `Pie` with fixed pixel radii clips on small containers. Use percentage strings.
- Division by zero → `NaN` → `JSON.stringify(NaN)` = `null`. Always guard division.

## Event Loop & Input Validation

- `execSync` blocks ENTIRE server — ALWAYS use `execFile` (async).
- ReadableStream `cancel()` is NOT optional for SSE — hoist interval refs to outer scope.
- `req.json()` without `.catch(() => null)` throws on malformed JSON.
- Use zod `safeParse` with typed schemas. Freeform fields: `z.string().min(1)`, not enums.

## React Hooks

- `useCallback` that references itself → "used before declared" lint. Fix: store fn in ref, update in `useEffect`.
- `useRef.current = value` during render triggers react-hooks/refs error. Assign inside `useEffect`.
- Recursive `setTimeout` is safer than `setInterval` for retry loops.

## Accessibility — Layered Reduced-Motion

- framer-motion needs JS-level `usePrefersReducedMotion()`. CSS `@keyframes` need `@media (prefers-reduced-motion: reduce)`.
- SVG SMIL animations (`<animate>`, `<animateMotion>`) bypass BOTH — gate at JSX level via `reducedMotion` prop.
- Inline `style={{ animation: ... }}` also bypasses CSS media queries — use `...(!reduced && { animation: ... })` spread.

## Agent Live — Replay-First Design

- SVG node graph + timeline replay. Pure SVG with ResizeObserver — zero `requestAnimationFrame`.
- State → color via `getStateHex()`: thinking=cyan, executing=rose, verifying=green, planning=violet, celebrating=amber.
- Replay: activities newest-first in Zustand, reversed for display. Phase grouping dividers.
- Multi-agent: nodes for roles, edges for data flow. Store is single source of truth.
- Replay loop: use ref pattern (isLoopingRef + useEffect sync) for real-time toggle.

## Spec Compliance Accuracy

- Hardcoded `done: true` in checklists creates false compliance signals. Every item should be dynamically checked or honestly reflect what exists.

## Git & Client Logging

- `.gitignore` patterns without leading `/` match ANY directory. Use `/skills/` for root-only.
- `console.warn` in client hooks pollutes production — gate behind `process.env.NODE_ENV !== 'production'`.