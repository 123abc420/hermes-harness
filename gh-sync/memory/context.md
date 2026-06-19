# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 00:25 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 46)
- **Waves in DB**: 40
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 13 |
| GitHub commits | 77 |
| Waves in DB | 40 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |

## What exists
- Dashboard: single-fetch in ALL tabs, 3-col overview, Decision Timeline
- Performance: Selective Zustand, React.memo, prop drilling, minimal deps
- 3D Scene: CharacterBridge split, 6 memo-ized components
- UI components: 14 active, 8 radix deps (down from 27)
- Skills: 13 (new: dead-dependency-audit)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only
2. Agent Live tab enhancements (current wave decisions feed)
3. Consider bundle size tracking metric