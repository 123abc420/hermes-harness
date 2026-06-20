# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 11:00 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 110)
- **Waves in DB**: 105
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 23 |
| Export modules | 1 |
| GitHub commits | ~184 |
| Waves in DB | 105 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |

## What exists
- All tab orchestrators decomposed: agent-live(320), waves(236), github(59), decisions(203), overview(209), research(67)
- Sub-components: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L)
- Features: WaveComparisonCard (102L), text search on waves+decisions tabs
- Both search features are server-side (Prisma contains), composable with existing filters
- 3D sandbox: 6 modules (sandbox=54L orchestrator)
- 23 skills, insights at ~75 lines (healthy)

## What's next
1. Export data (CSV/JSON) for waves and decisions
2. UX polish: category colors in charts verification
3. More advanced comparison features (category trends over wave ranges)
4. Consider adding keyboard shortcuts (Cmd+K style global search)