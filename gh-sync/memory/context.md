# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-19 23:05 UTC+8

## System Status
- **Phase**: Post-Compliance Evolution (Wave 38)
- **Waves in DB**: 32
- **Spec compliance**: 100% (15/15)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 16 |
| Dashboard tabs | 6 |
| Skills | 11 |
| GitHub commits | 60+ |
| Waves in DB | 32 |
| Wave success rate (recent 5) | 100% |
| Dead files | 0 |
| Client-side console.log | 0 |

## What exists
- Dashboard: stat cards, error trend, spec compliance, dual success rate, wave duration in detail
- Error handling: ErrorBlock, HarnessErrorBoundary
- Accessibility: aria-pressed, aria-labels, aria-live, keyboard nav
- Performance: Selective Zustand selectors, batched setState
- Skills: 11, Clean src/, Package: @hermes/harness-dashboard v0.1.0

## What's next
1. insights.md at ~1700/2000 tokens (append-only, new insights must be minimal)
2. React.memo on heavy 3D sub-components
3. Make skill count in SPEC_CHECKLIST dynamic (read from API)