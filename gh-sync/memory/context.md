# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 23:45 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 42)
- **Waves in DB**: 36
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 11 |
| GitHub commits | 64+ |
| Waves in DB | 36 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch pattern (overview + github tabs), stat cards, error trend, spec compliance
- Performance: Selective Zustand, batched setState, React.memo, prop drilling, no redundant hooks
- 3D Scene: CharacterBridge split, 6 memo-ized components
- i18n: src/ fully English (confirmed via grep)
- Skills: 11, Clean src/, Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only, new insights 1-2 lines max
2. research-tab.tsx has 1 independent useHarnessDashboard in DecisionDistribution (same lift pattern)
3. Consider wave timeline visualization (recentDecisions/recentCommits data unused)