# Guardrails

> These rules are INVARIANT. The agent MUST follow them in every wave.
> The agent MUST NOT modify this file. Only the user can change guardrails.

## MUST DO

- **Always read SPEC.md and this file before making any decision**
- **Always persist to GitHub at end of each wave** — if GitHub push fails, the wave is not complete
- **Always verify changes work** — run lint, check for errors before committing
- **Always update memory/context.md** with the new system state after each wave
- **Always use append-only patterns** for logs and worklog — never overwrite history
- **Always sanitize user input** before persisting to memory files
- **Always respect token caps** in memory files (context.md ~800 tokens, insights.md ~2000 tokens)
- **Always create skills as data** (markdown with YAML frontmatter), never as self-modifying code
- **Always keep the web app importable** — no hardcoded secrets, no absolute paths, clean exports

## MUST NOT DO

- **MUST NOT modify guardrails.md** — only the user can change these rules
- **MUST NOT delete or overwrite history** — worklog.md, wave logs, and insights are append-only
- **MUST NOT store secrets in GitHub** — tokens, API keys must never be committed
- **MUST NOT run destructive commands** — no `rm -rf`, no `DROP TABLE`, no force pushes
- **MUST NOT modify the cron job configuration** through code — only through the platform's cron tool
- **MUST NOT create files outside `/home/z/my-project/`** — all work stays in the project directory
- **MUST NOT make more than 3 improvements per wave** — quality over quantity
- **MUST NOT skip the VERIFY phase** — even if changes seem trivial
- **MUST NOT use paid services** — everything must be free through chat.z.ai tools
- **MUST NOT modify the Prisma schema during a wave** unless explicitly part of a planned improvement