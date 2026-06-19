# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 07:10 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 87)
- **Waves in DB**: 81
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 17 |
| GitHub commits | 152 |
| Waves in DB | 81 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |
| Harness components | 25 |
| Category colors | 11 |

## What exists
- Skills API endpoint: `/api/harness/skills` — YAML frontmatter parser, sorted by category
- All hooks now have backing endpoints (verified via endpoint-audit pattern)
- Skills: 17 total (new: endpoint-audit)
- Insights.md trimmed to ~23% of cap (from ~48%)
- Export contract: 12 hooks, 10 components, HarnessDashboard composite

## What's next
1. Skills usage tracking (which skills informed which decisions)
2. New feature development or UX polish
3. Consider export module completeness