# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 13:50 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 126)
- **Waves in DB**: 122
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 27 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~208 |
| Waves in DB | 122 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(280), github(49), decisions(215), overview(201), research(60)
- All data tabs have summary stats bars
- Health transparency: header tooltip + hero card inline bars
- Footer: last wave indicator
- Mobile: flex-wrap stats, min-w-0 search inputs, responsive filter pills, PhaseTracker responsive, flex-wrap health bars, responsive donut chart, overflow-x table wrapper, min-w-0 on all flex-1 text children, flex-wrap badge/metadata rows, responsive activity feed heights (280/420/540), flex-wrap command palette footer, mobile-left export menu
- Wave detail dialog: reasoning, outcome, copy-summary, DecisionItem extraction, flex-wrap badges
- Command palette: tab quick-nav, search with Results header, flex-wrap footer
- Features: WaveComparison, CategoryTrends, text search, CSV/JSON export, Cmd+K, collapsible sections
- .gitignore covers all build artifacts
- 3D sandbox: 6 modules, 27 skills

## What's next
1. Consider wave replay/visualization feature
2. All remaining mobile issues from W125 audit are now resolved