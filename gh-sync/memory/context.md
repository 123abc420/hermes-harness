# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 15:25 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 135)
- **Waves in DB**: 132
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 27 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~252 |
| Waves in DB | 132 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |
| Dashboard cache TTL | 12s |

## What exists
- All 6 tabs have summary stats bars, inline visualizations, per-tab error isolation
- Mobile: comprehensive (flex-wrap, min-w-0, responsive heights, overflow-x, mobile dropdowns)
- DecisionCategory: 16 values, 20 unified category colors
- XP bar correctly shows progress within current level
- Export menu shows toast on failure
- Dashboard metric query resilient to bad data, 12s response cache
- SSE reconnection every 30s after polling fallback
- Health tooltip keyboard-accessible (focus/blur)
- Wave detail dialog has proper loading skeleton
- responsive-audit skill v2.0, 3D sandbox, 27 skills

## What's next
1. Consider per-wave replay with real phase data
2. Consider decision card wave-link auto-opening detail dialog
3. Consider aria-live optimization for activity feed
4. All known issues resolved