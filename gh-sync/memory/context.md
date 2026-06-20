# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 10:50 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 109)
- **Waves in DB**: 104
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 23 |
| Export modules | 1 |
| GitHub commits | ~183 |
| Waves in DB | 104 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |

## What exists
- All tab orchestrators decomposed: agent-live(320), waves(213), github(59), decisions(181), overview(209), research(67)
- Sub-components: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L)
- NEW: WaveComparisonCard (102L) — auto-compares 2 most recent waves with deltas
- 3D sandbox: 6 modules (sandbox=54L orchestrator)
- 23 skills, insights at ~75 lines (healthy)

## What's next
1. More comparison features (e.g., decision category comparison across wave ranges)
2. UX polish: verify 14 category colors in all chart renderings
3. Search/filter across waves and decisions (text search)
4. Consider adding export (CSV/JSON) for waves data