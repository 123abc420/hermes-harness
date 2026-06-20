# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 10:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 107)
- **Waves in DB**: 102
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 22 |
| Export modules | 1 |
| GitHub commits | 180 |
| Waves in DB | 102 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |

## What exists
- All major tabs decomposed: agent-live(320), waves(213), research(67), github(373 internal), decisions(332)
- 3D sandbox: 6 modules (sandbox=54 lines orchestrator)
- All Zustand subscriptions fine-grained, DecisionCard memoized
- Category color map covers all 14 DB categories, no aliases
- Distribution charts extracted to reusable component
- 22 skills, insights updated with extraction + hygiene patterns

## What's next
1. Potential new feature: wave comparison (compare two waves side by side)
2. Further component simplification if new patterns emerge
3. Monitor insights.md token cap (currently ~74 lines, healthy)