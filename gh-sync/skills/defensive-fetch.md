---
name: defensive-fetch
version: 0.1.0
created: 2026-06-20
category: code
trigger: when writing or reviewing any fetch() call that ends with .then(r => r.json())
---

# Defensive Fetch Pattern

## When to use
Any client-side or server-side code that calls `fetch()` and parses the response as JSON. This includes React Query hooks, command palette searches, export utilities, and direct API calls.

## The Problem
`fetch().then(r => r.json())` will throw an unparseable error if the server returns a non-200 status with an HTML body (e.g., nginx 502, Next.js error page). The error message will be useless: "Unexpected token < in JSON at position 0".

## Steps
1. **Always check `r.ok` before calling `r.json()`**:
   ```typescript
   fetch(url).then(r => {
     if (!r.ok) throw new Error(`Fetch failed: ${r.status} ${r.statusText}`);
     return r.json();
   });
   ```
2. **For reusable hooks**, create a `fetchJSON<T>` wrapper (see `use-harness-data.ts`):
   ```typescript
   async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
     const res = await fetch(url, init);
     if (!res.ok) {
       const err = await res.json().catch(() => ({ error: 'Request failed' }));
       throw new Error(err.error || `HTTP ${res.status}`);
     }
     return res.json();
   }
   ```
3. **For React Query**, the `queryFn` return type is enforced — just use the wrapper.
4. **For non-critical fetches** (e.g., skills in command palette), chain `.catch()` AFTER the ok-check to provide fallback data.

## Example
Before (W144 found these):
```typescript
// BAD — non-200 causes cryptic JSON parse error
fetch(`/api/harness/waves?search=${q}`).then(r => r.json());
```

After:
```typescript
// GOOD — descriptive error, or caught by React Query
fetch(`/api/harness/waves?search=${q}`).then(r => {
  if (!r.ok) throw new Error(`Waves search failed: ${r.status}`);
  return r.json();
});
```

## Audit Command
```bash
# Find unprotected fetch→json chains
rg '\.then\(r => r\.json\(\)\)' src/
```