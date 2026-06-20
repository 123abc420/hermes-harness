# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 15:42 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 137)
- **Waves in DB**: 134
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 28 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~256 |
| Waves in DB | 134 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |
| Dashboard cache TTL | 12s |

## What exists
- All 6 tabs have summary stats bars, inline visualizations, per-tab error isolation
- Mobile: comprehensive (flex-wrap, min-w-0, responsive heights, overflow-x, mobile dropdowns)
- DecisionCategory: 16 values, 20 unified category colors
- XP bar correctly shows progress within current level
- Export menu shows toast on failure
- Dashboard metric query resilient, 12s response cache
- SSE reconnection every 30s after polling fallback
- Health tooltip keyboard-accessible, tab triggers have aria-labels
- Wave detail dialog has loading skeleton
- Cross-tab wave navigation (decision card → waves tab detail dialog)
- Version auto-syncs from package.json via NEXT_PUBLIC_VERSION
- Agent Live skeleton derives from actual data readiness
- Command palette searches waves, decisions, AND skills
- Skills API supports search param (title, name, category, trigger)
- 28 skills including wave-data-hygiene
- responsive-audit skill v2.0, 3D sandbox

## What's next
1. Consider per-wave replay with real phase data
2. Consider aria-live optimization for activity feed
3. All known issues resolved