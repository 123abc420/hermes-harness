# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 11:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 113)
- **Waves in DB**: 108
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 14 |
| Dashboard tabs | 6 |
| Skills | 24 |
| Export modules | 1 |
| GitHub commits | ~189 |
| Waves in DB | 108 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(248), github(59), decisions(215), overview(209), research(67)
- Sub-components: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L), command-palette(194L)
- Error boundary: per-tab isolation with inline/label props (112L)
- Features: WaveComparisonCard, text search, CSV/JSON export, Cmd+K command palette
- Utilities: csv-export.ts
- Shared: ExportMenu, STATUS_COLORS
- 3D sandbox: 6 modules, 24 skills

## What's next
1. UX polish: verify 14 category colors render in all charts
2. Advanced wave comparison (category trends over ranges)
3. Consider adding wave replay/visualization feature