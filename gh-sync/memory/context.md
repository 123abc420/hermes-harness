# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 15:15 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 134)
- **Waves in DB**: 131
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 27 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~250 |
| Waves in DB | 131 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |
| Valid categories | 20 (unified) |

## What exists
- All 6 tabs have summary stats bars (pattern consistency complete)
- All data tabs have inline visualizations (waves: sparkline+donut, decisions: cat bar+action bars)
- Per-tab error isolation in both page.tsx and harness-dashboard.tsx
- Mobile: comprehensive (flex-wrap, min-w-0, responsive heights, overflow-x, mobile dropdowns)
- DecisionCategory: 16 values, Exportable module full parity, phase timeline
- No hardcoded localhost URLs (extracted to env-configurable constants)
- Tab labels consistent: "Analytics" everywhere
- XP bar correctly shows progress within current level
- Category colors unified: 20 categories from single source of truth
- Export menu shows toast on failure
- Dashboard metric query resilient to bad data (W133)
- SSE reconnection every 30s after polling fallback (W133)
- responsive-audit skill v2.0, 3D sandbox, 27 skills

## What's next
1. Consider dashboard API response caching (10-15s TTL)
2. Consider per-wave replay with real phase data
3. Consider health tooltip keyboard accessibility
4. All known issues resolved