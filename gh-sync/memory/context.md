# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 12:40 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 120)
- **Waves in DB**: 115
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 26 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~199 |
| Waves in DB | 115 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(248), github(49), decisions(215), overview(201), research(60)
- Header (183L): search, live status, health badge with hover breakdown tooltip, GitHub link
- Footer: version + last wave indicator (#NNN status Xm ago)
- Hero card (201L): inline health breakdown bars (S/R/E/G), always visible
- Health transparency complete: header tooltip + hero card inline bars
- Dashboard API: healthBreakdown {spec, success, errors, github}
- Features: WaveComparison, CategoryTrends, text search, CSV/JSON export, Cmd+K, collapsible sections
- 3D sandbox: 6 modules, 26 skills

## What's next
1. Consider wave replay/visualization feature
2. Explore mobile responsiveness improvements