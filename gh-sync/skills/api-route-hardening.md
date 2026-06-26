---
name: api-route-hardening
version: 0.1.0
created: 2026-06-20
category: code
trigger: when creating or reviewing any Next.js API route handler
---

# API Route Hardening Pattern

## When to use
Every new or existing API route in the harness. This is the standard template for route reliability.

## Steps
1. **Import the centralized logger** (`src/lib/logger.ts`):
   ```typescript
   import { logError, logDebug } from '@/lib/logger';
   ```
2. **Wrap every handler in try/catch** with `logError`:
   ```typescript
   export async function GET() {
     try { /* ... */ }
     catch (error) {
       logError('TAG', error);
       return NextResponse.json({ error: 'Description' }, { status: 500 });
     }
   }
   ```
3. **Never use raw `console.error`** in API routes — always use `logError(tag, error, extra?)`. It outputs structured JSON with sanitized messages.
4. **Never use silent `.catch(() => {})`** — use `logDebug` at minimum:
   ```typescript
   // BAD
   someOp().catch(() => {});
   // GOOD
   someOp().catch((e) => { logDebug('TAG', 'Non-critical op failed', { error: String(e) }); });
   ```
5. **Validate POST/PUT/PATCH input** — whitelist allowed fields with a `Set`, validate enums, clamp numbers.
6. **Never spread request body directly into Prisma** — extract only allowed fields.

## Example — Full Route Template
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const data = await db.someModel.findMany();
    return NextResponse.json({ data });
  } catch (error) {
    logError('MY_ROUTE', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

## Audit Commands
```bash
# Find raw console.error in API routes (should be 0)
rg 'console\.error' src/app/api/
# Find silent catches (should be 0)
rg '\.catch\(\(\) => \{\}\)' src/
```