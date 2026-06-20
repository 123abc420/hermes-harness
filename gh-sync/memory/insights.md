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

## UX & Responsive

- `flex justify-between` without `flex-wrap` is the #1 mobile overflow cause
- Always add `shrink-0` to children inside scrollable containers
- Zero isError checks across tabs = misleading empty states on network failures
- `flex-1` text children without `min-w-0` = `truncate`/`line-clamp` silently fails. Always pair them
- Fixed heights (e.g., `h-[420px]`) that work on desktop can consume 75%+ of small mobile viewports — use responsive breakpoints
- Dropdown menus with `absolute right-0` overflow off-screen on mobile — use `left-0 sm:left-auto sm:right-0`

## Performance

- Zustand does NOT auto-batch — multiple `set()` = multiple re-renders. Batch into one.
- shadcn/ui `add` generates 30+ files; audit early, remove aggressively

## Type Safety

- `catch (err: any)` disables narrowing — always use `unknown` + `instanceof Error`
- Union types can silently fall out of sync with actual data — grep DB/API for all status values
- Props in the type annotation but NOT in the destructured parameter list = silent no-op (no build error). Always cross-check both lists when adding props

## DRY & Shared Utilities

- Extract early: duplicated logic across routes/components → lib/ utilities with typed interfaces
- ESM `export let` is not reassignable from importers — use mutable object pattern for shared state
- When consolidating duplicated logic, verify semantic equivalence — some "copies" have distinct edge-case behavior

## Component Extraction

- Extract hooks for self-contained logic (replay, countdown) — keeps components focused on rendering
- Dialog components are high-value extraction targets: self-contained UI, own state, reusable
- Internal sub-components (<50 lines, single-use) can stay inline — don't over-fragment
- Export shared constants (STATUS_COLORS) from the most natural file — avoids a constants file per component

## Data Hygiene

- Category enums drift over time (refactor vs refactoring) — aliases in code mask DB quality issues
- Fix data FIRST (updateMany), then remove aliases from color maps
- Use groupBy to audit category distribution before and after migration

## JSX Pitfalls

- `className="... {expr()}"` — the {} is LITERAL TEXT inside a string. MUST use backticks for template literals
- SVG `<linearGradient id="...">` IDs must be unique per component instance — always use `useId()`

## 3D Module Architecture

- Large Three.js components (>200 lines) should split into shared/world/character/scene modules
- Module-level mutable VRM state must use a shared object (not `export let`) to avoid ESM import-reassignment errors
- Components that share module-level refs (characterWorldPos, arrivalFlash) must import from same shared module
- Always check `agentState` usage — a child component CANNOT access parent scope variables

## Single-Source-of-Truth Pattern

- Define color/config maps once as a canonical object (e.g. DECISION_CATEGORIES), derive all consumers (TW classes, hex, valid list) from it
- When DB adds a new enum value, only one file needs updating — all 8+ consumers auto-sync
- Fallback defaults in consumers mask missing entries — audit with groupBy to find gaps

## Composite Score Transparency

- Never show an aggregate score without a breakdown — users will ask "why is it X?"
- Expose sub-scores from the API (e.g. healthBreakdown: {spec, success, errors, github})
- Show breakdown in TWO places: always-visible inline bars (hero card) + hover tooltip (header)
- Summary bars in data tabs (waves, decisions) provide at-a-glance context before the table

## Data Type Safety

- Prisma Float columns reject non-numeric values at query time — a single bad row crashes the entire `findMany()`. Always validate data before insert.
- Wrap non-critical queries (e.g. metrics) in `.catch()` so one bad row can't bring down the whole composite API.
- Raw SQL inserts bypass Prisma validation — type mismatches silently persist until Prisma reads them back.

## Event Loop & Process

- `execSync` in API routes blocks the ENTIRE server — even a cached dashboard can't respond while lint runs (up to 60s). ALWAYS use `execFile` (async).
- ReadableStream `cancel()` is NOT optional for SSE — browser tab close doesn't always fire `abort` signal. Without `cancel()`, setInterval timers leak forever.
- Closure scope matters: `cancel()` can't access variables declared inside `start()` — hoist interval refs to the outer scope.

## Git & Persistence

- `.gitignore` patterns without a leading `/` match ANY directory in the tree. `skills/` matches `gh-sync/skills/`. Use `/skills/` for root-only.
- If a file keeps "disappearing" across sessions, check `.gitignore` FIRST — it may never have been tracked.