# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 15:00 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 132)
- **Waves in DB**: 129
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 27 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~246 |
| Waves in DB | 129 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- All 6 tabs have summary stats bars (pattern consistency complete)
- All data tabs have inline visualizations (waves: sparkline+donut, decisions: cat bar+action bars)
- Per-tab error isolation in both page.tsx and harness-dashboard.tsx
- Mobile: comprehensive (flex-wrap, min-w-0, responsive heights, overflow-x, mobile dropdowns)
- DecisionCategory: 16 values, Exportable module full parity, phase timeline
- No hardcoded localhost URLs (extracted to env-configurable constants)
- Tab labels consistent: "Analytics" everywhere
- responsive-audit skill v2.0, 3D sandbox, 27 skills

## What's next
1. Consider per-wave replay with real phase data
2. Consider Agent Live tab improvements
3. All known issues resolved