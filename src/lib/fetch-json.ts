/**
 * Shared typed fetch helper.
 *
 * Centralizes the fetch → check-ok → parse-json pattern used across
 * hooks, the command palette, and CSV export. Extracted in W251 from
 * the local `fetchJSON` that lived inside `use-harness-data.ts`.
 */
export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}