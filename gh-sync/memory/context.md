# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 22:55 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 37)
- **Waves in DB**: 31
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 11 |
| GitHub commits | 59+ |
| Waves in DB | 31 |
| Wave success rate (recent 5) | 100% |
| Keyboard a11y gaps | 0 |
| Spanish strings | 0 |
| Mobile overflow issues | 0 |
| Dead files | 0 |
| Public exports | 22 |

## What exists
- Dashboard: 5 stat cards, error trend, spec compliance, dual success rate, pagination
- Error handling: ErrorBlock (5 tabs), HarnessErrorBoundary (global)
- Accessibility: aria-pressed, aria-labels, aria-live, keyboard-navigable wave rows
- Language: 100% English, version centralized in constants.ts
- Performance: Selective Zustand selectors, batched setState
- Skills: 11 total
- Clean src/: no orphan files, no dead exports
- Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md nearing token cap (~1700/2000) but is append-only per guardrails — new insights must be minimal
2. Add metricsSnapshot to wave engine PERSIST phase
3. Consider React.memo on Agent3DSandbox sub-components (the 3D scene)