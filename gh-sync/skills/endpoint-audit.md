---
name: endpoint-audit
version: 0.1.0
created: 2026-06-20
category: analysis
trigger: when adding a new hook or when a component shows empty/stale data
---

# Endpoint Audit

## When to use
When creating a new data-fetching hook, or when a UI component shows empty data
despite no visible errors. This catches the silent "hook without endpoint" bug.

## Steps

1. **Extract the URL** from the hook's `fetchJSON()` or `fetch()` call
2. **Check the route file exists**:
   - Map `/api/harness/foo` → `src/app/api/harness/foo/route.ts`
   - Map `/api/harness/foo/[id]` → `src/app/api/harness/foo/[id]/route.ts`
3. **Verify HTTP methods match**:
   - `useQuery` → needs `GET` in the route
   - `useMutation` with `method: 'POST'` → needs `POST` in the route
4. **Check response shape**:
   - The hook's generic type should match what the route returns
   - If the hook expects `{ skills: Skill[] }`, the route must return that shape
5. **Test with curl** (if server is running):
   ```bash
   curl -s http://localhost:3000/api/harness/foo | head -100
   ```

## Example

Wave 86 discovered that `useSkills()` called `/api/harness/skills` but the route
file did not exist. The component rendered without error but showed "No skills yet".
Creating `src/app/api/harness/skills/route.ts` fixed it immediately.

## Important notes
- Turbopack/Next.js does NOT error when a fetch 404s in a hook — it just returns
  `undefined` or throws into React Query's error state
- Always grep `src/hooks/` for `fetchJSON` URLs and cross-check with `src/app/api/`
- Silent 404s are the most dangerous bug type in this codebase