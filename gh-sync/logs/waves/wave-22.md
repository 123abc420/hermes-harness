---
wave: 22
date: 2026-06-19
status: completed
decisions: 3
errors: 0
summary: "Skills API route created (was missing), post-compliance evolution skill, enhanced Skills UI"
---

# Wave 22 — Skills API Bug Fix

## Decisions
1. **create-skills-api** (fix/high): Created /api/harness/skills that reads gh-sync/skills/*.md with YAML frontmatter parsing.
2. **enhance-skills-ui** (feature/high): Expanded Skill interface, added category badges and version tags to SkillsSection.
3. **post-compliance-skill** (skill/medium): Created post-compliance-evolution skill with 4-layer strategy.

## Outcome
- Silent bug fixed: useSkills hook called non-existent endpoint for 10+ waves
- API routes: 15 → 16
- Skills: 7 → 8
- Dashboard Research tab now shows all 8 skills with metadata