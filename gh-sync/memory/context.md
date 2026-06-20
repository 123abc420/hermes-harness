# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 12:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 119)
- **Waves in DB**: 114
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 26 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~198 |
| Waves in DB | 114 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(248), github(49), decisions(215), overview(197), research(60)
- Header (183L): search trigger, live status, health score badge with hover breakdown tooltip (4 sub-scores), GitHub link
- Dashboard API returns healthBreakdown: {spec, success, errors, github}
- AnimatedSection: 2 variants (default/header), used in 3/6 tabs, exported from index.ts
- Features: WaveComparisonCard, CategoryTrendsChart, text search, CSV/JSON export, Cmd+K command palette, collapsible overview sections, health breakdown tooltip
- 3D sandbox: 6 modules, 26 skills

## What's next
1. Consider adding wave replay/visualization feature
2. Apply health breakdown to hero-status-card as well