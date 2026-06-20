# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 12:10 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 117)
- **Waves in DB**: 112
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 26 |
| Components | 28 |
| GitHub commits | ~196 |
| Waves in DB | 112 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(248), github(59), decisions(215), overview(197), research(67)
- Sub-components: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L), command-palette(194L), category-trends-chart(130L), animated-section(28L)
- Error boundary: per-tab isolation with inline/label props (112L)
- Header: search trigger button, live status, health score, GitHub link (150L)
- Category colors: 16/16 DB categories mapped
- Features: WaveComparisonCard, CategoryTrendsChart, text search, CSV/JSON export, Cmd+K command palette, collapsible overview sections
- Overview tab: Activity & Health section is now collapsible
- Utilities: csv-export.ts
- Shared: ExportMenu, STATUS_COLORS, AnimatedSection
- 3D sandbox: 6 modules, 26 skills

## What's next
1. Consider adding wave replay/visualization feature
2. Apply AnimatedSection to other tab orchestrators (waves, decisions, github)