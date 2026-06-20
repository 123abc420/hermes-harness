# Insights — Learned Patterns

> Accumulated lessons from waves. Append new insights, never overwrite.

## Core Architecture

- Skills should be DATA (markdown), not code. They influence the prompt but don't modify source.
- Memory caps are critical: ~800 tokens for context, ~2000 for insights.
- Frozen-snapshot pattern: Read memory once at session start, writes are visible next session.
- The spec is the single source of truth. Build FROM the spec, not towards it.
- "Improving reliability is less about the model and more about the harness."

## Platform (chat.z.ai)

- z-ai-web-dev-sdk: LLM, web search, page reader, image gen, VLM, TTS, ASR
- Cron minimum interval: 5 minutes. All tools FREE through the platform.
- Turbopack caches aggressively — MUST rm -rf .next after renaming/moving files
- File Persistence: Write tool may not persist — verify with rg after writing

## Wave Engineering

- Live updates: agent-status in each phase generates ~34 events per wave
- "celebrating" status at end shows user a happy character
- Waves can stay "running" if interrupted — always check at ASSESS
- Wave engine MUST PATCH wave to "completed" at end of PERSIST
- After multi-file rewrites, grep for imports to find dead files
- Same type name exported from two modules causes TS errors — use dedup

## API & Data

- A hook can reference an API route that doesn't exist — no build error, just empty data. ALWAYS verify endpoints exist.
- Always verify endpoints exist, not just "does the component render"
- Composite APIs: always override DB fields with live git data
- Prisma groupBy is free count metadata for list endpoints
- readFileSafe silent catch hides wrong paths — verify with content check

## UX & Responsive

- Zero isError checks across tabs = misleading empty states on network failures
- `flex justify-between` without `flex-wrap` is the #1 mobile overflow cause
- Always add `shrink-0` to children inside scrollable containers
- For button groups (4+ items), use `overflow-x-auto` + `shrink-0` per button

## Performance

- Zustand does NOT auto-batch — multiple `set()` = multiple re-renders. Batch into one.
- `Object.fromEntries(arr.map(s => [s.key, s.value]))` derives a Record cleanly
- Fetched-but-unused data is free real estate — check before adding new API calls
- shadcn/ui `add` generates 30+ files; audit early, remove aggressively

## i18n & Normalization

- After any string normalization, grep ENTIRE src/ for the old language
- New categories appear in DB before color maps — always grep schema for valid values
- Wave-by-wave fixes can miss files not in the diff (store init + reset)
- Variant names (refactoring vs refactor) silently render without color — add aliases

## Schema & Color Consistency

- Decision category colors must be synced across ALL components that render them
- insights.md can exceed token cap silently — monitor file size periodically
- Chart tooltip styles are duplicated across components — extract to constants.ts
- Health score trend can be derived from error trend + success rate without storing history
- Categories can appear in DB before being added to maps — always grep DB for actual values

## Component Scope & Hooks

- A child component CANNOT access variables from its parent's function scope — each component needs its own hook calls
- Shared utility functions (formatDuration, tooltip styles) belong in constants.ts, not duplicated inline

## JSX Pitfalls

- `className="... {expr()}"` — the {} is LITERAL TEXT inside a string. MUST use backticks for template literals: `` className={`... ${expr()}`} ``
- SVG `<linearGradient id="...">` IDs must be unique per component instance — always use `useId()` from React