# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 11:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 112)
- **Waves in DB**: 107
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 6 |
| Skills | 23 |
| Export modules | 1 |
| GitHub commits | ~187 |
| Waves in DB | 107 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(248), github(59), decisions(215), overview(209), research(67)
- Sub-components: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L), command-palette(194L)
- Features: WaveComparisonCard, text search (waves+decisions), CSV/JSON export (waves+decisions), Cmd+K command palette
- Utilities: csv-export.ts (fetchAllPages + toCSV + toJSON + download)
- Shared: ExportMenu component, STATUS_COLORS from wave-detail-dialog
- 3D sandbox: 6 modules, 23 skills, insights ~75L (healthy)

## What's next
1. UX polish: verify 14 category colors render in all charts
2. Advanced wave comparison (category trends over ranges)
3. Consider adding wave replay/visualization feature
4. Error boundary improvements per tab (granular fallbacks)