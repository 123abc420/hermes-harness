# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 15:44 UTC+8

## System Status
- **Phase**: Operational (autonomous waves executing)
- **Waves completed**: 1 (autonomous)
- **GitHub connected**: Yes (123abc420/hermes-harness, 3 commits)
- **Web app**: Dashboard live with 5 tabs, build clean
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 5 |
| Skills | 2 |
| GitHub commits | 3 |
| DB records | 4 (1 wave + 3 decisions + 7 metrics) |
| Spec files | 6 |
| Memory files | 3 |

## What exists
- SPEC.md + guardrails + wave_protocol (spec-driven foundation)
- gh-sync/ structure: memory, skills, specs
- 14 API routes under /api/harness/*
- 5-tab dashboard: Overview, Waves, Decisions, Research & Memory, GitHub & Export
- 2 skills: github-clean-push, _template
- Prisma schema with Harness models
- 3 clean commits on GitHub (no secrets)

## What's next (priority order)
1. WebDevReview cron should improve dashboard styling/details
2. Future waves should improve the web app based on spec compliance
3. Consider adding eval-driven feedback loop (spec section 6)
4. Package exportable turborepo module (spec section 4)

## Known Issues
- None