# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 00:15 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 45)
- **Waves in DB**: 39
- **Spec compliance**: 100% (15/15, dynamic check)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 12 |
| GitHub commits | 74 |
| Waves in DB | 39 |
| Wave success rate (recent 5) | 100% |
| Spanish strings in src/ | 0 |
| Dead files removed | 32 (this wave) |

## What exists
- Dashboard: single-fetch in ALL tabs, 3-col overview, Decision Timeline in research
- Performance: Selective Zustand, batched setState, React.memo, prop drilling
- 3D Scene: CharacterBridge split, 6 memo-ized components
- UI components: 14 active (down from 46 — 32 orphans removed)
- i18n: src/ fully English
- Skills: 12, Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at token cap — append only
2. Consider pruning unused npm dependencies (radix packages from removed UI files)
3. Agent Live tab could show recent decisions feed for the current wave