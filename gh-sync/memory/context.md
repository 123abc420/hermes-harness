# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 23:35 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 41)
- **Waves in DB**: 35
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 11 |
| GitHub commits | 63+ |
| Waves in DB | 35 |
| Wave success rate (recent 5) | 100% |
| Memo-wrapped 3D components | 6 |

## What exists
- Dashboard: stat cards, error trend, spec compliance (dynamic), dual success rate, wave duration
- Single data fetch pattern: OverviewTab fetches once, passes data as props
- Performance: Selective Zustand selectors, batched setState, React.memo, prop drilling
- 3D Scene: CharacterBridge split (CharacterGroup + ChatBubble), 6 memo-ized components
- Skills: 11, Clean src/, Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only, new insights 1-2 lines max
2. Consider wave timeline visualization or activity feed (recentDecisions/recentCommits unused)
3. QuickMetricsChart uses TrendingDown import now — verify no other icon mismatches