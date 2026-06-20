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