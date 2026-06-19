# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 23:55 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 43)
- **Waves in DB**: 37
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 12 |
| GitHub commits | 65+ |
| Waves in DB | 37 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch pattern in ALL tabs (overview, github, research)
- Performance: Selective Zustand, batched setState, React.memo, prop drilling, no redundant hooks
- 3D Scene: CharacterBridge split, 6 memo-ized components
- i18n: src/ fully English
- Skills: 12 (new: hook-lift), Clean src/, Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only, new insights 1-2 lines max
2. Wave timeline visualization (recentDecisions/recentCommits data unused on overview)
3. Dynamic data refinement (uptime calc, SPEC_CHECKLIST from real state)