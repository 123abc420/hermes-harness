# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 20:52 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 25)
- **Waves in DB**: 20 (Wave 20 in DB = Wave 25 actual)
- **GitHub connected**: Yes (123abc420/hermes-harness)
- **Crons**: 2 active (hermes-wave 10min, webDevReview 15min)
- **Avatar**: VRM (walk + expressions) + Chibi (8 gestures + arrival flash)
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 8 |
| GitHub commits | 44+ |
| Waves in DB | 20 |
| Wave success rate (overall) | 63% |
| Wave success rate (recent 5) | 100% |
| Spec compliance | 100% |

## What exists
- Dashboard: 5 stat cards (waves, decisions, improvements, success rate w/ recent sub-label, errors), error trend, spec compliance (100%), real commit history
- Dashboard API: real git data inlined (totalCommits, recentCommits, lastSha), recent success rate
- Wave engine: creates, completes via PATCH, writes log files, auto-cleans stale
- Package: @hermes/harness-dashboard v0.1.0 with export contract
- Skills API: reads frontmatter from gh-sync/skills/*.md
- GitHub: real commit count + history in both dedicated endpoint and dashboard

## What's next
1. VRM visual verification (env limits)
2. Sound effects for state changes
3. Accessibility improvements (keyboard nav, aria labels)