# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 10:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 106)
- **Waves in DB**: 101
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 22 |
| Export modules | 1 |
| GitHub commits | 179 |
| Waves in DB | 101 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |

## What exists
- 3D sandbox: 6 modules (sandbox=54 lines orchestrator)
- Agent live panel: 320-line orchestrator + 2 hooks + ActivityFeedColumn
- Waves tab: 213-line orchestrator + WaveDetailDialog + TriggerWaveDialog
- All Zustand subscriptions fine-grained, DecisionCard memoized
- Category color map covers all 14 DB categories (no aliases)
- 22 skills, types safe, dead code removed

## What's next
1. Potential new feature: wave comparison (compare two waves side by side)
2. GitHub-tab decomposition (373 lines — next largest component)
3. UX polish: ensure all 14 category colors render correctly in charts