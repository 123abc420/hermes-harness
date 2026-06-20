# Task 6 - API Routes Builder v2

## Completed
- Cleared all previous route files from `/api/harness/`
- Created `lib/github.ts` helper for GitHub API (token stored server-side only)
- Created all 20 API endpoints across 14 route.ts files
- ESLint passes with zero errors
- Worklog updated

## Route Summary
| # | Method | Endpoint | File |
|---|--------|----------|------|
| 1 | GET | /api/harness/dashboard | dashboard/route.ts |
| 2 | GET | /api/harness/waves | waves/route.ts |
| 3 | POST | /api/harness/waves | waves/route.ts |
| 4 | GET | /api/harness/waves/[id] | waves/[id]/route.ts |
| 5 | GET | /api/harness/decisions | decisions/route.ts |
| 6 | POST | /api/harness/decisions | decisions/route.ts |
| 7 | PATCH | /api/harness/decisions/[id] | decisions/[id]/route.ts |
| 8 | GET | /api/harness/metrics | metrics/route.ts |
| 9 | POST | /api/harness/metrics | metrics/route.ts |
| 10 | GET | /api/harness/github/status | github/status/route.ts |
| 11 | POST | /api/harness/github/sync | github/sync/route.ts |
| 12 | GET | /api/harness/spec | spec/route.ts |
| 13 | GET | /api/harness/skills | skills/route.ts |
| 14 | POST | /api/harness/skills | skills/route.ts |
| 15 | GET | /api/harness/memory | memory/route.ts |
| 16 | GET | /api/harness/exports | exports/route.ts |
| 17 | POST | /api/harness/exports | exports/route.ts |
| 18 | GET | /api/harness/config | config/route.ts |
| 19 | POST | /api/harness/config | config/route.ts |
| 20 | GET | /api/harness/research | research/route.ts |
