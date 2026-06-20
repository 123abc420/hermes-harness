# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 14:50 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 131)
- **Waves in DB**: 128
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 27 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~244 |
| Waves in DB | 128 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- All data tabs have summary stats bars + inline visualizations (waves: sparkline+donut, decisions: category bar+action breakdown)
- Per-tab error isolation in both page.tsx and harness-dashboard.tsx
- Mobile: comprehensive (flex-wrap, min-w-0, responsive heights, overflow-x, mobile dropdowns)
- DecisionCategory: 16 values (full coverage)
- Exportable HarnessDashboard: full parity with page.tsx
- WaveDetailDialog: phase timeline (6 phases)
- Tab labels consistent: "Analytics" everywhere
- responsive-audit skill v2.0, 3D sandbox, 27 skills

## What's next
1. Consider per-wave replay with real phase data
2. Consider GitHub tab improvements
3. All known issues resolved