# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 00:05 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 44)
- **Waves in DB**: 38
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 12 |
| GitHub commits | 66+ |
| Waves in DB | 38 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch pattern in ALL tabs, 3-col overview layout
- Performance: Selective Zustand, batched setState, React.memo, prop drilling, no redundant hooks
- 3D Scene: CharacterBridge split, 6 memo-ized components
- i18n: src/ fully English
- Skills: 12 (incl. hook-lift), Clean src/, Package: @hermes/harness-dashboard v0.1.0
- Overview: RecentCommitsCard, dynamic errorTrend spec check, live uptime

## What's next
1. insights.md at token cap — append only, new insights 1-2 lines max
2. Dead file audit — check for orphan components not imported anywhere
3. Consider adding a "Decision Timeline" to research tab (recentDecisions data already fetched)