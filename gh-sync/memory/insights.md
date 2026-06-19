# Insights — Learned Patterns

> Accumulated lessons from waves. Append new insights, never overwrite.

## 2026-06-19 — Initial Research Insights

### HERMES Architecture
- Skills should be DATA (markdown), not code. They influence the prompt but don't modify source.
- Memory caps are critical: ~800 tokens for context, ~2000 for insights.
- Frozen-snapshot pattern: Read memory once at session start, writes are visible next session.

### Spec-Driven Development
- The spec is the single source of truth. Build FROM the spec, not towards it.

### Agent Harness Engineering
- "Improving reliability is less about the model and more about the harness."

### Platform (chat.z.ai)
- z-ai-web-dev-sdk: LLM, web search, page reader, image gen, VLM, TTS, ASR
- Cron minimum interval: 5 minutes. All tools FREE through the platform.

## 2026-06-19 — Wave 4: Live Updates Pattern

- El patron funciona: llamar agent-status en cada fase genera actividad en vivo (34 eventos en una wave)
- El tipo "activity" genera entries en el feed; el tipo "status" actualiza el estado completo
- Es crucial enviar "celebrating" al final — el usuario ve al personaje feliz al completar
- Waves pueden quedar atascadas en "running" si el proceso se interrumpe — checkear siempre al ASSESS

## 2026-06-19 — Wave 10: VRM + World Architecture

### VRM Integration
- @pixiv/three-vrm VRMLoaderPlugin works with GLTFLoader for loading .vrm models
- react-hooks/immutability lint blocks VRM mutations inside useFrame — use module-level singleton
- VRM scene faces +Z by default — rotate Math.PI to face camera

### Turbopack
- Turbopack caches aggressively — MUST rm -rf .next after renaming/moving files
- Import paths MUST match exact filename — mismatches cause 500
- Circular deps: shared data goes in a separate module (agent-3d-shared.ts pattern)

### User Expectations
- User wants a CHARACTER, not a geometric shape — "no un circulo horrible"
- Walking between locations, gestures, emotes, chat bubbles are essential
- Chibi fallback ensures the system always shows SOMETHING even if VRM fails to load

### File Persistence
- Write tool may not persist — verify with rg/head after writing
- .tsx files can revert between commands in this env

## 2026-06-19 — Wave 12: Dead Code Discovery

- After multi-file rewrites, always grep for imports to find dead files
- Files from previous waves can survive as orphans — not imported, not deleted

## 2026-06-19 — Wave 13: Spec Compliance Audit

- SPEC Section 5 (export contract) was the #1 unimplemented item — src/index.ts was missing
- Export contract must include ALL stores, not just the dashboard store

## 2026-06-19 — Wave 14: Name Collision

- Same type name exported from two modules causes TS errors — use dedup or skip one export
- AgentVisualState exists in both agent-avatar-canvas.tsx and agent-live-store.ts

## 2026-06-19 — Wave 17-18: Reliability Patterns

### Wave Completion
- Waves are created "running" but the engine never called PATCH to mark them complete
- Result: dashboard showed wrong status. Fix: wave engine must PATCH wave to "completed" at end of PERSIST
- Auto-cleanup (15min threshold) is a safety net, not a replacement for proper completion

### Error Trend
- Added errorTrend to dashboard API — simple query on HarnessWave.errorsCount ordered by waveNumber
- Area chart with stepAfter type works well for discrete wave-by-wave data
- Trend direction: compare last 3 waves vs previous 3 — if <=, trend is "decreasing"

## 2026-06-19 — Wave 21: 100% Compliance

- "Turborepo Package Layout" gap was the hardest — not because it was complex, but because it seemed risky
- Lesson: sometimes the last 10% is just metadata (package.json fields), not code restructure
- Milestone celebrations in UI (star animation) reinforce positive feedback loop for the agent

## 2026-06-19 — Wave 22: Missing API Discovery

- A hook can reference an API route that doesn't exist — no build error, just silent empty data
- useSkills called /api/harness/skills for 10+ waves but the route was never created
- Always verify: does the API endpoint actually exist, not just "does the component render"

## 2026-06-19 — Wave 25: Stale Data in Composite APIs

- A composite API (dashboard) that merges data from DB + git can return stale DB values if it doesn't override them
- Dashboard returned githubStatus.totalCommits=11 from DB even though the dedicated /github/status endpoint already used real git data
- Fix: always override DB fields with live git data in the composite response
- "Recent" metrics (last N items) are more useful than cumulative ones for measuring current system health — recent success rate 100% vs overall 63% tells a very different story

## 2026-06-19 — Wave 26: UX Audit + Error Handling

- A comprehensive UX audit (via subagent) revealed: zero isError checks across ALL tabs, no ErrorBoundary, missing category colors
- TanStack Query returns isError + error on every hook, but components only checked isLoading — network failures showed misleading empty states
- Fix: shared ErrorBlock component with retry, HarnessErrorBoundary class component wrapping tabs
- Quick wins from audits are high-value: 2-min color fix (skill/insight) has immediate visible impact

## 2026-06-19 — Wave 31: Responsive Mobile Patterns

- `flex justify-between` without `flex-wrap` is the #1 mobile overflow cause — content exceeds ~303px usable width at 375px
- For button groups (4+ items), use `overflow-x-auto max-w-[Xpx] sm:max-w-none` + `shrink-0` on each button instead of `flex-wrap`
- For footers/toolbars, hide non-essential text with `hidden sm:inline` rather than trying to make everything fit
- Always add `shrink-0` to children inside scrollable containers — without it, buttons get text truncated
- Subagent audit (Explore agent) is effective for responsive checks — it can read multiple files and estimate widths in parallel
## 2026-06-19 — Wave 35: Dedup + Residual Strings + Store Perf

### Constant Dedup Pattern
- When a local array extends a shared constant (EVOLUTION_STAGES has name + visual fields), move the SUPerset to constants and derive the subset (LEVEL_NAMES) from it
- `Object.fromEntries(arr.map(s => [s.key, s.value]))` cleanly derives a Record from an array of objects
- `as const` on the array preserves literal types

### Zustand Batch set() Pattern
- Multiple `set()` calls in one function = multiple re-renders. Always batch: build a `Partial<State>` object, call `set()` once
- Zustand does NOT auto-batch like React 18 — each `set()` triggers subscribers immediately

### String Audit Completeness
- Wave-by-wave string fixes can miss files not in the diff (store initial state + reset had same string in 2 places)
- After any i18n/normalization pass, grep the ENTIRE src/ for the old language, not just changed files

## 2026-06-20 — Wave 44: Data Utilization

- Fetched-but-unused data is free real estate — RecentCommitsCard needed zero new API calls
- Spec compliance checks should be dynamic from real data, not hardcoded booleans

## 2026-06-20 — Wave 45: Dead Code Hygiene

- shadcn/ui `add` generates 30+ files; most go unused. Audit early, remove aggressively.
- Dead file audit via subagent is fast and thorough — grep for basename across all imports.

## 2026-06-20 — Wave 48: UX Polish

- Keyboard shortcuts need input guard (INPUT/TEXTAREA/contentEditable) to avoid conflicts
- <kbd> badges are a subtle UX cue for discoverability — hide on mobile, show on lg+

## 2026-06-20 — Wave 49: Hidden Bug + Data Density

- A hook can reference an API route for 20+ waves and the bug is invisible if the component has ErrorBlock — always verify endpoints exist
- Prisma groupBy is a free way to add count metadata to list endpoints without extra round-trips
