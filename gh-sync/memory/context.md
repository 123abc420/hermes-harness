# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 14:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 129)
- **Waves in DB**: 126
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 27 |
| Components | 28 |
| Exported components | 11 |
| GitHub commits | ~240 |
| Waves in DB | 126 |
| Wave success rate (recent 5) | 100% |
| Health score | ~93/100 (stable) |

## What exists
- Tab orchestrators: agent-live(320), waves(280), github(49), decisions(215), overview(201), research(60+)
- All data tabs have summary stats bars
- Mobile: comprehensive (flex-wrap, min-w-0, responsive heights, overflow-x, mobile dropdowns)
- Skills section: plain-text preview (markdown stripped), truncating titles, category filters
- Memory section: flex-wrap headers, health bars for context/insights/userProfile
- responsive-audit skill v2.0 with 8-category checklist
- 3D sandbox: 6 modules, 27 skills
- DecisionCategory: 16 values (full coverage of DECISION_CATEGORIES)
- Exportable HarnessDashboard: full parity with page.tsx (Cmd+K, footer, shortcuts panel)
- WaveDetailDialog: phase timeline (ASSESS→PLAN→EXECUTE→VERIFY→PERSIST→REPORT)

## What's next
1. Consider per-wave replay with real phase data (metrics timestamps)
2. Consider waves tab inline visualizations (duration chart, success trend)
3. All known mobile issues resolved