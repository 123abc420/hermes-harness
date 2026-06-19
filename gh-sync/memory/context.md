# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 23:25 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 40)
- **Waves in DB**: 34
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 11 |
| GitHub commits | 62+ |
| Waves in DB | 34 |
| Wave success rate (recent 5) | 100% |
| Memo-wrapped 3D components | 6 |

## What exists
- Dashboard: stat cards, error trend, spec compliance (dynamic skill count), dual success rate, wave duration
- Error handling: ErrorBlock, HarnessErrorBoundary
- Performance: Selective Zustand selectors, batched setState, React.memo on 6 static 3D components
- 3D Scene: CharacterBridge split into CharacterGroup + ChatBubble (message isolation)
- Skills: 11, Clean src/, Package: @hermes/harness-dashboard v0.1.0
- Dynamic data: skill count, commit count, success rates all from live sources

## What's next
1. insights.md at token cap — append only, new insights 1-2 lines max
2. Consider adding a "wave timeline" visualization to overview
3. Memo on VRMCharacter/ChibiCharacter won't help (direct Zustand subscribers) — structural split already done