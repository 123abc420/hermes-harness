# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 12:00 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 116)
- **Waves in DB**: 111
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 25 |
| Export modules | 1 |
| GitHub commits | ~195 |
| Waves in DB | 111 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(248), github(59), decisions(215), overview(218), research(67)
- Sub-components: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L), command-palette(194L), category-trends-chart(130L)
- Error boundary: per-tab isolation with inline/label props (112L)
- Header: search trigger button (⌘K), live status, health score, GitHub link (150L)
- Category colors: 16/16 DB categories mapped
- Features: WaveComparisonCard, CategoryTrendsChart, text search, CSV/JSON export, Cmd+K command palette
- Utilities: csv-export.ts
- Shared: ExportMenu, STATUS_COLORS
- 3D sandbox: 6 modules, 25 skills

## What's next
1. Consider adding wave replay/visualization feature
2. Overview tab layout optimization (growing number of cards)