---
name: ux-summary-bar
version: 0.1.0
created: 2026-06-20
category: strategy
trigger: when a tab has a filterable list but no at-a-glance summary
---

# UX Summary Bar

## When to use
When a tab or section displays a filterable list (decisions, waves, metrics) but
jumps straight from the header/filters to the items without giving the user
an at-a-glance summary of the dataset.

## Steps

1. **Identify available aggregate data** — Check if the API already returns
   counts (groupBy results, total count). If not, add a groupBy query.
2. **Derive 2-3 key stats** from the aggregates:
   - Total count
   - A meaningful percentage (e.g., executed %, success rate)
   - A ranked metric (e.g., top category, most common priority)
3. **Render as a compact inline bar** between the filter controls and the list:
   - Use `rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-2.5`
   - Each stat: icon + value (tabular-nums) + label (zinc-600)
   - `gap-x-5 gap-y-1 flex-wrap` for mobile safety
4. **Guard with `!isError && !isLoading && count > 0`** to avoid flash of
   empty/wrong data
5. **Use the same motion pattern** as surrounding elements for consistency

## Example

Wave 89 added a summary bar to the Decisions tab:
- Total decisions count
- Executed percentage (from `countsByAction`)
- Top category badge (from `countsByCategory`, sorted)

This required adding a `groupBy action` query to the decisions API and updating
the hook's TypeScript type to include `countsByAction`.

## Important notes
- The summary bar should NOT duplicate data already visible in the header
- Keep it to 3 stats maximum — more creates cognitive overload
- Always use `tabular-nums` for numbers to prevent layout shift
- The bar should disappear during loading/error states