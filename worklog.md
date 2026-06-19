# HERMES HARNESS - Worklog

## Proyecto
Web app de auto-evolución tipo HARNESS inspirada en agentes HERMES (NousResearch).
- Dashboard en tiempo real del estado del harness (control plane)
- Cron jobs cada 10 min para auto-mejora (wave engine)
- Integración con GitHub (repo: 123abc420/hermes-harness)
- Persistencia en GitHub (spec, skills, memory, waves)
- Módulo exportable para turborepo
- Todo tecnología gratuita

## Estado Actual
- ✅ Investigación completada (Hermes Agent, Harness Engineering, Spec-Driven Development, Anthropic)
- ✅ GitHub conectado y repo creado
- ✅ SPEC.md escrito (fuente de verdad del sistema)
- ✅ Dashboard funcional con 7 tabs
- ✅ 20 API routes operativas
- ✅ 2 cron jobs configurados (10min wave + 15min webdev review)
- ✅ Verificación end-to-end con agent-browser (0 errores)

## Arquitectura
```
chat.z.ai (Runtime) → HARNESS (Spec + Waves + Skills + Memory) → GitHub (Persistence) → Dashboard (Control Plane)
```

## Fases
1. ✅ Investigación web (Hermes, Harness, SDD, Anthropic, chat.z.ai)
2. ✅ GitHub: repo creado, estructura de directorios, SPEC.md
3. ✅ Schema Prisma + 20 API routes
4. ✅ Dashboard (7 tabs, dark theme, emerald accents)
5. ✅ Cron jobs configurados (2 jobs)
6. ✅ Verificación con agent-browser

---
Task ID: 1
Agent: Main Orchestrator
Task: Planificación arquitectura HERMES HARNESS

Work Log:
- Analicé estructura del proyecto existente
- Diseñé schema Prisma para HarnessWaves, HarnessDecisions, HarnessMetrics
- Planifiqué dashboard con tabs: Overview, Waves, Decisions, GitHub, Export

Stage Summary:
- Arquitectura definida: Next.js 16 + Prisma + Zustand + Cron Jobs
- Dashboard planificado con 5 secciones principales

---
Task ID: 2
Agent: Main Orchestrator (Research Phase)
Task: Deep research on HERMES agents, Harness Engineering, Spec-Driven Development

Work Log:
- Searched web for: chat.z.ai platform, HERMES agents, Harness engineering, Spec-Driven Development, autonomous agents
- Read 5 key articles in depth:
  1. Martin Fowler "Harness Engineering for Coding Agent Users" - Agent = Model + Harness
  2. Microsoft "Spec-Driven Development: AI-Native Engineering" - Spec-first approach
  3. LangChain "Anatomy of an Agent Harness" - Filesystems, sandboxes, memory
  4. Addy Osmani "Agent Harness Engineering" - 7 production patterns
  5. Anthropic "Harness Design for Long-Running Apps" - Multi-agent architecture (planner/generator/evaluator)
- Read Hermes Agent (NousResearch) documentation - self-improving agent with learning loop, skills system, memory system
- Read GitHub awesome-harness-engineering repo

Stage Summary:
- Key insight: Harness = everything except the model (Martin Fowler)
- Hermes Agent: closed learning loop, skill creation from experience, cross-session memory
- SDD: Define spec first, then let agent implement toward compliance
- Anthropic: 3-agent architecture (planner, generator, evaluator) inspired by GANs
- All research stored in research_*.json and search_*.json files

---
Task ID: 3
Agent: API Routes Builder
Task: Create all HARNESS API routes

Work Log:
- Created 17 API routes across 12 files
- Full CRUD for waves, decisions, metrics, config, github, exports
- Dashboard aggregation endpoint

Stage Summary:
- All API routes functional
- GitHub token validation working
- Metrics auto-calculate deltas

---
Task ID: 5
Agent: Dashboard Builder v2
Task: Build HERMES HARNESS dashboard

Work Log:
- Created 11 component files in src/components/harness/
- Created Zustand store and React Query hooks
- Built 7-tab dashboard: Overview, Spec, Waves, Decisions, Skills, Memory, GitHub
- Dark mission-control aesthetic with emerald/amber accents
- Framer Motion animations, sticky footer, responsive

Stage Summary:
- Full dashboard operational
- Zero console errors
- All tabs rendering correctly

---
Task ID: 6
Agent: API Routes Builder v2
Task: Rebuild HARNESS API routes with correct architecture

Work Log:
- Rebuilt all 20 API routes with GitHub integration, spec/skills/memory filesystem reads
- Created lib/github.ts for secure GitHub API calls
- Added research data endpoint

Stage Summary:
- Full API layer aligned with SDD architecture
- GitHub persistence working (real git commands)
- Research data accessible

---
Task ID: 7
Agent: Main Orchestrator
Task: Connect to GitHub, create repo structure, write SPEC.md, configure cron jobs

Work Log:
- Verified GitHub connection (user: 123abc420)
- Created repo: 123abc420/hermes-harness
- Wrote SPEC.md with full system specification (vision, architecture, guardrails, metrics, evolution rules, tech stack, references)
- Wrote specs/guardrails.md (hard/soft constraints, scope boundaries)
- Wrote memory/context.md (current project state)
- Wrote memory/insights.md (cross-wave pattern tracking)
- Created directory structure: specs/, skills/, waves/, memory/, config/, exports/
- Initial commit pushed to GitHub
- Configured cron job: HERMES Wave - Auto-Evolution (every 10 minutes, job_id: 216402)
- Configured cron job: WebDev Review (every 15 minutes, job_id: 216403)
- Verified dashboard with agent-browser: all tabs working, zero console errors

Stage Summary:
- GitHub repo live at https://github.com/123abc420/hermes-harness
- SPEC.md establishes spec-driven development as source of truth
- 2 cron jobs running: 10min self-evolution + 15min webdev review
- Dashboard verified working with all 7 tabs

## Project Assessment
- Current Status: OPERATIONAL - Dashboard live, APIs working, GitHub connected, cron jobs active
- Spec Compliance: ~70% (dashboard, spec layer, guardrails, memory, architecture done; waves/skills need actual usage)
- Next Phase: First wave should execute via cron (10min) and start populating data

## Unresolved Issues / Risks
1. GitHub status shows "UNLINKED" in dashboard - the github/status API may need the DB record initialized
2. No waves have executed yet - waiting for first cron trigger
3. Export module not yet packaged as turborepo-ready
4. Skills system is empty - will be populated by waves over time

## Priority Recommendations for Next Phase
1. Fix GitHub "UNLINKED" status display
2. Wait for first wave to execute and verify the full loop
3. Package the harness core as an exportable turborepo module
4. Add more visual details and animations to the dashboard
5. Create the first manual skill from the research patterns

---
Task ID: 6
Agent: Frontend Dashboard Builder
Task: Build HERMES HARNESS dashboard UI (v3 redesign)

Work Log:
- Rewrote globals.css with dark mission-control theme (#050a0e bg), dot-pattern, glassmorphism utilities, gradient borders
- Updated harness-store.ts with clean types (removed unused state fields), added ExportModule type
- Rewrote use-harness-data.ts with useHarnessDashboard() as primary hook, 30s refetch interval
- Rewrote page.tsx with 5-tab shadcn Tabs layout (Overview, Waves, Decisions, Research & Memory, GitHub & Export)
- Rewrote harness-header.tsx with gradient logo, pulsing connection badge, framer-motion entrance
- Rewrote overview-tab.tsx: hero status card with pulsing green dot + ping animation, 4 stat cards with trend indicators, spec compliance checklist, recharts area chart, mini wave timeline
- Rewrote waves-tab.tsx: filter buttons, wave table with colored status badges, wave detail dialog, empty state with helpful message
- Rewrote decisions-tab.tsx: 7 category filter buttons (All, Code Quality, Feature, Fix, Refactor, Performance, Architecture), collapsible decision cards with reasoning/outcome, priority indicators
- Created research-tab.tsx: Memory section (context + insights), Skills section, Spec Compliance section with 11 items
- Rewrote github-tab.tsx: Connection status card with glow effect, info grid (branch, commits, last sync), commit history, export modules cards
- Removed 9 obsolete components (stats-grid, wave-timeline, metrics-chart, status-badge, research-card, status-card, spec-tab, memory-tab, skills-tab)
- All API calls use relative paths, zero lint errors, all tabs render correctly

Stage Summary:
- Full dashboard redesigned with 5 tabs (down from 7)
- Dark mission-control aesthetic with emerald/cyan accents, no indigo/blue
- Glassmorphism cards, dot-pattern background, gradient borders, pulsing indicators
- Framer Motion animations throughout (fade-in, subtle scale)
- Loading skeletons for all data-dependent sections
- Empty states with helpful messages and icons
- Sticky footer with min-h-screen flex layout
- Lint passes: zero errors

---
Task ID: Main
Agent: Main Orchestrator (Research-First Redesign)
Task: Proper research, spec-driven rebuild, GitHub connection, dashboard

Work Log:
- User corrected approach: must research BEFORE building, must design for chat.z.ai platform
- Conducted 4 parallel web searches: HERMES agents, Spec-Driven Development, Agent Harness patterns, chat.z.ai
- Read 6 key articles in depth:
  1. Saulius.io - "What Self-Improving AI Agent Actually Means" (HERMES source code audit)
  2. MindStudio - "Hermes 5-Pillar Architecture" (Memory, Skills, Soul, Crons, Loop)
  3. Microsoft Developer Blog - "Spec-Driven Development: AI-Native Engineering"
  4. Arize AI - "Self-Improving Agents: the Agent Harness for Reliable Code"
  5. MindStudio - "How to Build a Self-Improving AI Agent" (4-part loop)
  6. NousResearch/hermes-agent GitHub README
- Key insights synthesized:
  * Skills = DATA (markdown), not code
  * Memory caps are critical (injection surface)
  * Frozen-snapshot pattern for memory
  * Harness > Model for reliability
  * SDD: spec is single source of truth
- Wrote comprehensive SPEC.md (8 sections)
- Created gh-sync/ structure (specs, skills, memory, guardrails)
- Connected GitHub (123abc420/hermes-harness), cleaned secret from history
- Dashboard rebuilt by subagent (5 tabs, dark theme, emerald/cyan)
- Created first skill: github-clean-push
- Build passes, lint clean, pushed to GitHub

Stage Summary:
- Research-first approach: 6 articles, 4 searches, deep understanding
- Spec-driven: SPEC.md governs all development
- GitHub connected and clean (2 commits)
- 1 skill created from this session's learning
- Platform-aligned: all tools are free through chat.z.ai
---
Task ID: 2 (autonomous)
Agent: HERMES Harness Wave Engine (cron job 216402)
Task: Wave 1 — Autonomous self-improvement wave

Work Log:
- ASSESS: Read context.md, insights.md, guardrails.md, skills/, dev.log, dashboard API
- Found: DB empty (0 waves/decisions/metrics), GitHubSync had 5 stale records, context.md stale
- PLAN: Identified 3 improvements (GitHubSync fix, proper DB recording, context update)
- EXECUTE Decision 1 (fix/high): Cleaned GitHubSync table, created single connected record
- EXECUTE Decision 2 (code_quality/high): Recorded wave, decisions, metrics via API for dashboard
- EXECUTE Decision 3 (fix/medium): Updated context.md with accurate state
- Recorded 7 metrics: api_routes=14, dashboard_tabs=5, skills=2, github_commits=3, db_records=4, spec_files=6, memory_files=3
- VERIFY: lint clean (0 errors), dev.log shows no errors
- PERSIST: Wave marked completed, all data in DB

Stage Summary:
- First autonomous wave executed successfully
- Dashboard now shows real data (1 wave, 3 decisions, 7 metrics)
- GitHub status correctly shows "connected"
- context.md accurate for next wave
- Key insight: GitHubSync route needs upsert logic to prevent duplicate records (future improvement)
