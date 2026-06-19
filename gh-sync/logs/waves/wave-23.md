---
wave: 23
date: 2026-06-19
status: completed
decisions: 3
errors: 0
summary: "Real git commit count (was 11, now 40), real commit history in GitHub tab, wave success rate stat"
---

# Wave 23 — Real Git Data

## Decisions
1. **real-git-commit-count** (fix/high): Replaced DB counter with `git rev-list --count HEAD`.
2. **real-commit-history** (fix/high): Replaced fake placeholder commits with real `git log --oneline -5`.
3. **wave-success-rate** (feature/medium): Added groupBy status query and 5th stat card with % suffix.

## Outcome
- Commit count accuracy: 11 (wrong) → 40 (real)
- GitHub tab now shows real commit messages and clickable SHAs
- Dashboard overview has 5 stats including 59% wave success rate
- Success rate metric reveals early waves were mostly interrupted