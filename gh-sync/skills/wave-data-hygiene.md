---
name: wave-data-hygiene
version: 1.0.0
created: 2026-06-20
category: data
trigger: when inserting records via raw SQL into Prisma-managed tables
---

# Wave Data Hygiene

## When to use
- When the wave engine inserts records via `npx prisma db execute --stdin` (raw SQL)
- When creating HarnessMetric, HarnessDecision, or HarnessWave records outside Prisma Client
- Before any INSERT that writes to a typed column (Float, Int, DateTime)

## Steps
1. **Check the Prisma schema** — Read `prisma/schema.prisma` to confirm the column type
2. **Match types exactly** — Float columns require numeric values (e.g., `12.0`, not `"fixed"`). Int columns require integers. DateTime columns require ISO strings or `datetime('now')`.
3. **Never use string values for numeric columns** — Raw SQL bypasses Prisma validation. A string in a Float column persists silently but crashes `findMany()` at read time (Prisma P2023).
4. **Wrap non-critical queries in `.catch()`** — In composite API routes, wrap individual queries with `.catch(() => [])` so one bad row cannot crash the entire response.
5. **Audit after insert** — After bulk inserts, do a `typeof()` check to verify column types: `SELECT * FROM HarnessMetric WHERE typeof(metricValue) != 'real'`

## Example

### Bad (causes dashboard crash)
```sql
INSERT INTO HarnessMetric (id, waveId, metricKey, metricValue, ...)
VALUES ('abc', 'wave123', 'status', 'fixed', ...);
-- 'fixed' is a string, metricValue is Float → P2023 at read time
```

### Good
```sql
INSERT INTO HarnessMetric (id, waveId, metricKey, metricValue, ...)
VALUES ('abc', 'wave123', 'status', 1.0, ...);
```

## Lesson
Raw SQL inserts bypass Prisma's type system. The schema is the contract — honor it even when Prisma isn't watching.