# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-20 09:30 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 101)
- **Waves in DB**: 95
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 15 |
| Dashboard tabs | 6 |
| Skills | 20 |
| Export modules | 1 |
| GitHub commits | 172 |
| Waves in DB | 95 |
| Wave success rate (recent 5) | 100% |
| Health score | ~92/100 (stable) |

## What exists
- 3D sandbox split into 4 modules: shared (39), world (202), chibi (342), sandbox (435)
- Agent live panel refactored (496 lines), sub-components extracted
- All shared utilities consolidated, PATCH whitelisted, types safe
- 20 skills, dead code removed, SSE constants extracted

## What's next
1. Further 3D simplification: extract VRMCharacter + bridge components from sandbox
2. Insights.md size monitoring (approaching cap)
3. Agent live panel further simplification (still 496 lines)