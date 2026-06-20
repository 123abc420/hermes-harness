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

## Performance

- Zustand does NOT auto-batch — multiple `set()` = multiple re-renders. Batch into one.
- shadcn/ui `add` generates 30+ files; audit early, remove aggressively

## Type Safety

- `catch (err: any)` disables narrowing — always use `unknown` + `instanceof Error`
- Union types can silently fall out of sync with actual data — grep DB/API for all status values

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