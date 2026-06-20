# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 12:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 118)
- **Waves in DB**: 113
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 26 |
| Components | 28 |
| Tab motion.div count | 14 (from 34) |
| GitHub commits | ~197 |
| Waves in DB | 113 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(248), github(49), decisions(215), overview(197), research(60)
- Sub-components: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L), command-palette(194L), category-trends-chart(130L), animated-section(48L, 2 variants)
- Error boundary: per-tab isolation with inline/label props (112L)
- Header: search trigger button, live status, health score, GitHub link (150L)
- Category colors: 16/16 DB categories mapped
- Features: WaveComparisonCard, CategoryTrendsChart, text search, CSV/JSON export, Cmd+K command palette, collapsible overview sections
- AnimatedSection used in: overview, research, github tabs (3/6). Waves+decisions keep custom animations.
- Utilities: csv-export.ts
- Shared: ExportMenu, STATUS_COLORS, AnimatedSection
- 3D sandbox: 6 modules, 26 skills

## What's next
1. Consider adding wave replay/visualization feature
2. Waves-tab and decisions-tab still have custom motion patterns (intentionally different)