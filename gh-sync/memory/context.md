# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 16:50 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 143)
- **Waves in DB**: 142
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 3 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~267 |
| Waves in DB | 142 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |
| Dashboard cache TTL | 12s (functional) |
| execSync calls in src/ | 0 (was 5) |

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
- Skills API at /api/harness/skills with search param (recreated W142)
- aria-live split: assertive for state changes, polite for latest entry only
- All data visualizations have accessible text alternatives
- All buttons and collapsible controls have descriptive ARIA attributes
- All collapsible sections linked via aria-controls/aria-expanded
- Wave replay auto-stops after 3 cycles
- Phase timeline clearly labeled as estimated
- agent-status POST validates input (whitelist, 0-1, enum)
- agent-demo route gated by optional DEMO_SECRET
- SSE ReadableStream has cancel() + closed flag (no timer leak)
- ALL execSync eliminated — git.ts, dashboard, github/sync use async execFile

## What's next
1. Consider per-wave replay with real phase data (requires schema change)
2. Consider logError helper to sanitize console.error in API routes
3. All known security, accessibility, and performance issues resolved