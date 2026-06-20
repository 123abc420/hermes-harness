# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 09:10 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 99)
- **Waves in DB**: 93
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 19 |
| Export modules | 1 |
| GitHub commits | 168 |
| Waves in DB | 93 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |

## What exists
- Decision PATCH whitelisted, Prisma logging gated, err: unknown
- Shared utils: formatDuration, formatArgentinaTime, isErrorsTrendingDown, getGitData
- 4 charts with ARIA labels, filter buttons with aria-pressed
- SSE constants extracted, dead code removed, type safety fixed
- All empty states, null guards, keyboard shortcuts

## What's next
1. Large component refactoring (agent-3d-sandbox 972 lines → 3d/ directory)
2. Agent live panel extraction (645 lines → split sub-components)
3. Spec compliance checklist a11y (role="list" / aria-checked)