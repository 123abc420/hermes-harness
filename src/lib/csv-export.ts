/**
 * CSV/JSON export utilities for harness data.
 * Client-side: fetches all records, converts, triggers browser download.
 */

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Convert an array of flat objects to CSV string */
export function toCSV<T extends Record<string, unknown>>(rows: T[], columns?: string[]): string {
  if (rows.length === 0) return '';
  const cols = columns ?? Object.keys(rows[0]);
  const header = cols.join(',');
  const lines = rows.map(row =>
    cols.map(c => {
      const val = String(row[c] ?? '');
      // Escape CSV: wrap in quotes if contains comma, quote, or newline
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  return header + '\n' + lines.join('\n');
}

/** Convert an array of objects to pretty-printed JSON string */
export function toJSON<T extends Record<string, unknown>>(rows: T[]): string {
  return JSON.stringify(rows, null, 2);
}

/** Fetch all pages of a paginated endpoint and return combined results */
export async function fetchAllPages<T extends Record<string, unknown>>(
  baseUrl: string,
  dataKey: string,
  totalKey: string,
  pageSize = 100
): Promise<T[]> {
  const firstRes = await fetch(`${baseUrl}?page=1&limit=${pageSize}`);
  if (!firstRes.ok) throw new Error(`Fetch failed: ${firstRes.status} ${firstRes.statusText}`);
  const first = await firstRes.json();
  const total = first[totalKey] as number;
  const results: T[] = (first[dataKey] as T[]);
  const remaining = total - results.length;

  if (remaining <= 0) return results;

  const pages = Math.ceil(remaining / pageSize);
  const extra = await Promise.all(
    Array.from({ length: pages }, (_, i) =>
      fetch(`${baseUrl}?page=${i + 2}&limit=${pageSize}`).then(r => {
        if (!r.ok) throw new Error(`Fetch failed: ${r.status} ${r.statusText}`);
        return r.json();
      })
    )
  );

  for (const page of extra) {
    results.push(...(page[dataKey] as T[]));
  }
  return results;
}

export type ExportFormat = 'csv' | 'json';

/** Main export function: fetch all data, convert, download */
export async function exportData<T extends Record<string, unknown>>(options: {
  baseUrl: string;
  dataKey: string;
  totalKey: string;
  filename: string;
  format: ExportFormat;
  columns?: string[];
  transform?: (row: T) => T;
}) {
  const rows = await fetchAllPages<T>(options.baseUrl, options.dataKey, options.totalKey);
  const mapped = options.transform ? rows.map(options.transform) : rows;

  if (options.format === 'csv') {
    const csv = toCSV(mapped, options.columns);
    downloadBlob(csv, `${options.filename}.csv`, 'text/csv;charset=utf-8');
  } else {
    const json = toJSON(mapped);
    downloadBlob(json, `${options.filename}.json`, 'application/json;charset=utf-8');
  }
}