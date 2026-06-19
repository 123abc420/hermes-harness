# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 23:15 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 39)
- **Waves in DB**: 33
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 11 |
| GitHub commits | 61+ |
| Waves in DB | 33 |
| Wave success rate (recent 5) | 100% |
| Stale hardcoded values | 0 |

## What exists
- Dashboard: stat cards, error trend, spec compliance (dynamic skill count), dual success rate, wave duration
- Error handling: ErrorBlock, HarnessErrorBoundary
- Performance: Selective Zustand selectors, batched setState
- Skills: 11, Clean src/, Package: @hermes/harness-dashboard v0.1.0
- Dynamic data: skill count, commit count, success rates all from live sources

## What's next
1. React.memo on heavy 3D sub-components
2. insights.md at token cap — append only, new insights must be 1-2 lines max
3. Consider adding a "wave timeline" visualization to overview