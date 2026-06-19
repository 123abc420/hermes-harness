# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 22:50 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 36)
- **Waves in DB**: 30
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 11 |
| GitHub commits | 58+ |
| Waves in DB | 30 |
| Wave success rate (recent 5) | 100% |
| Keyboard a11y gaps | 0 |
| Spanish strings | 0 |
| Mobile overflow issues | 0 |
| Bare Zustand calls | 1 |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, dual success rate, pagination
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed, aria-labels, aria-live, keyboard-navigable wave rows
- Language: 100% English (all strings, store defaults)
- Version: Centralized in constants.ts (HERMES_VERSION, EVOLUTION_STAGES, LEVEL_NAMES)
- Performance: Selective Zustand selectors in canvas/header, batched setState calls
- Skills: 11 total (new: performance-audit)
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. React.memo on AgentAvatarCanvas (belt-and-suspenders for the 60fps loop)
2. Trim insights.md (approaching token cap)
3. Add metricsSnapshot to wave engine PERSIST phase for richer detail dialog