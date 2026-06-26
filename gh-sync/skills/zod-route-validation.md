---
name: zod-route-validation
version: 0.1.0
created: 2026-06-20
category: code
trigger: when adding or modifying an API route that parses a request body
---

# Zod Route Validation Pattern

## When to use
Whenever you create a new API route with POST/PUT/PATCH that parses `req.json()`, or modify an existing route that still uses manual `if (!field)` checks.

## Steps
1. **Define schema in `src/lib/schemas.ts`** — never inline schemas in route files. All schemas live in one place.
2. **Use `.catch(() => null)` on `req.json()`** — malformed JSON must return 400, not 500.
3. **Parse with `safeParse`** — `const parsed = mySchema.safeParse(body)`.
4. **Return 400 on failure** — use the shared `validationError(schema, body)` helper.
5. **Use parsed data** — always destructure from `parsed.data`, never from raw `body`.

## Pattern
```typescript
import { mySchema, validationError } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = mySchema.safeParse(body);
    if (!parsed.success) {
      return validationError(mySchema, body);
    }
    const { field1, field2 } = parsed.data;
    // ... use parsed data
  } catch (error) {
    logError('TAG', error, { method: 'POST' });
    return NextResponse.json({ error: '...' }, { status: 500 });
  }
}
```

## Key rules
- **Freeform fields** (category, action): use `z.string().min(1)` — NOT enums. The DB has 21+ categories.
- **Enum fields** (priority, status): use `z.enum([...])` — query `DISTINCT` from DB first to discover actual values.
- **Strict mode** for proxy/forward routes: `.strict()` rejects unknown keys.
- **Never spread raw body** into Prisma `data:` — always use parsed data.
- **Agent-status POST** is the exception — it has hand-rolled validation for a complex discriminated union. Low priority to convert.

## Example
See `src/app/api/harness/decisions/route.ts` POST for the canonical example with enum-constrained priority, auto-derived outcome, and wave existence check.