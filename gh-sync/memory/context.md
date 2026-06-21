# Context — Current System State

> Updated after each wave. Read at wave start.

## Last Updated
2026-06-21 21:57 UTC+8

## System Status
- **Phase**: Post-Upsert Fix (Wave 278)
- **Spec compliance**: 100% (16/16)

## Current Metrics
| Metric | Value |
|--------|-------|
| API routes | 20 |
| Dashboard tabs | 6 |
| Skills | 11 (+ 1 template) |
| Components | 20 |
| Exported components | 11 |
| GitHub commits | ~523 |
| Waves in DB | 193 |
| TS errors | 0 (enforced, ignoreBuildErrors removed) |
| Lint errors | 0 |
| Health score | 94→100 (sliding window, recovers after W278) |
| Quality gates | All clear |

## What exists
- 6 tabs, mobile responsive, ARIA complete, keyboard navigable
- Agent Live Panel v7.0: SVG node graph, spring-physics AnimatedNumber, SSE reconnect v2
- Type safety: TabValue/AgentVisualState/AgentPhase narrow unions, all 9 routes zod-validated, tsc enforced
- Wave protocol v3.0: node graph broadcast format (node/node-remove/node-pulse/node-clear)
- VERIFY phase: lint + tsc --noEmit (type errors caught early)
- agent-live-broadcast skill v3.0, wave-engine skill v3.0
- prefers-reduced-motion: usePrefersReducedMotion hook, AnimatedNumber + AnimatedSection respect it

## What's next
1. Persist wave activities to DB for cross-reload replay
2. Live view — show wave execution in real-time (user deferred)
3. More analytics charts