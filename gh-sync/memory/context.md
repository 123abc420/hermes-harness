# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 09:20 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 100)
- **Waves in DB**: 94
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 20 |
| Export modules | 1 |
| GitHub commits | 169 |
| Waves in DB | 94 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |

## What exists
- Agent live panel refactored (646→496 lines), sub-components in agent-live-subcomponents.tsx
- Spec checklist with ARIA list semantics
- 4 charts + filter buttons + retry button + checklist with a11y
- All shared utilities consolidated, PATCH whitelisted, types safe
- 20 skills, dead code removed, SSE constants extracted

## What's next
1. Agent-3d-sandbox refactoring (972 lines → 3d/ directory)
2. Further agent-live-panel simplification (still 496 lines)
3. Insights.md size monitoring (approaching cap)