# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 11:10 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 111)
- **Waves in DB**: 106
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 23 |
| Export modules | 1 |
| GitHub commits | ~185 |
| Waves in DB | 106 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(248), github(59), decisions(215), overview(209), research(67)
- Sub-components: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L)
- Features: WaveComparisonCard, text search (waves+decisions), CSV/JSON export (waves+decisions)
- Utilities: csv-export.ts (fetchAllPages + toCSV + toJSON + download)
- Shared: ExportMenu component, STATUS_COLORS from wave-detail-dialog
- 3D sandbox: 6 modules, 23 skills, insights ~75L (healthy)

## What's next
1. UX polish: verify 14 category colors render in all charts
2. Keyboard shortcut (Cmd+K) for global search
3. Advanced wave comparison (category trends over ranges)
4. Consider adding wave replay/visualization feature