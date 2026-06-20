# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 16:11 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 140)
- **Waves in DB**: 137
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 28 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~263 |
| Waves in DB | 137 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |
| Dashboard cache TTL | 12s (functional) |

## What exists
- All 6 tabs: summary stats, inline visualizations, per-tab error isolation
- Mobile: comprehensive (flex-wrap, min-w-0, responsive heights, overflow-x, mobile dropdowns)
- DecisionCategory: 16 values, 20 unified category colors
- XP bar correctly shows progress within current level
- Export menu: toast on failure, full ARIA menu semantics + keyboard trap
- Dashboard 12s response cache functional
- SSE reconnection every 30s + correct state sync from latestStatus
- Health tooltip keyboard-accessible, tab triggers have aria-labels
- Wave detail dialog has loading skeleton
- Cross-tab wave navigation (decision card → waves tab)
- Version auto-syncs from package.json via NEXT_PUBLIC_VERSION
- Command palette searches waves, decisions, AND skills
- Skills API at /api/harness/skills with search param
- aria-live split: assertive for state changes, polite for latest entry only
- All data visualizations have accessible text alternatives (sparklines, bar charts)
- All buttons and collapsible controls have descriptive ARIA attributes
- All collapsible sections linked via aria-controls/aria-expanded
- 28 skills including wave-data-hygiene

## What's next
1. Consider per-wave replay with real phase data
2. All known accessibility issues resolved