---
name: maintenance-mode
version: 0.1.0
created: 2026-06-20
category: automation
trigger: when the wave engine finds no code quality issues, bugs, or spec gaps during ASSESS
---

# Maintenance Mode

## When to use
When ASSESS finds: 0 lint errors, 0 dev.log errors, 100% spec compliance, all code quality metrics at zero, and "what's next" has been unchanged for 3+ waves.

## Steps
1. **Verify stability** — run `rm -rf .next && bun run lint` to confirm 0 errors
2. **Check metric accuracy** — verify context.md metrics match reality (commit count, wave count, file counts)
3. **Check memory caps** — `wc -c` on insights.md and context.md. If insights > 80% of 8K cap, compact. If context > 80% of 3.2K cap, trim.
4. **Look for spec drift** — grep for patterns the skills mention but code doesn't follow (e.g. old console.error patterns)
5. **Consider skill creation** — if a repeatable pattern emerged in recent waves, document it as a skill
6. **If truly nothing to do** — record a minimal wave with 0 improvements, update wave count, push. Don't force changes.

## Key rules
- **Never force changes** — a wave with 0 improvements is better than a wave that introduces risk for no reason
- **Don't re-audit what was just audited** — if W151 did a full codebase audit, W152 shouldn't repeat it
- **Schema changes require explicit planning** — guardrails forbid modifying Prisma schema unless part of a planned improvement
- **Diminishing returns are real** — after ~150 waves of active improvement, each wave yields less. This is expected and healthy.

## Example
W148-W151: Full codebase audit found 0 issues across all 5 checks (console.error, silent catch, bare .json(), as any, TODO). Waves focused on metric fixes, memory hygiene, and skill creation — not forced code changes.