# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 10:40 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 108)
- **Waves in DB**: 103
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 22 |
| Export modules | 1 |
| GitHub commits | ~182 |
| Waves in DB | 103 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |

## What exists
- All tab orchestrators <200 lines: agent-live(320), waves(213), github(59), decisions(181), overview(195), research(67)
- 3D sandbox: 6 modules (sandbox=54 lines orchestrator)
- Sub-components extracted: github-subcomponents(317L), decision-card(157L), wave-detail-dialog(109L), trigger-wave-dialog(73L), agent-live-subcomponents(248L)
- All Zustand subscriptions fine-grained, DecisionCard memoized
- Category color map covers all 14 DB categories, no aliases
- 22 skills, insights updated with extraction + hygiene patterns

## What's next
1. All major tabs now decomposed — component extraction series complete
2. Potential new feature: wave comparison (compare two waves side by side)
3. UX polish: verify 14 category colors render correctly in all charts
4. Monitor insights.md token cap (currently ~75 lines, healthy)