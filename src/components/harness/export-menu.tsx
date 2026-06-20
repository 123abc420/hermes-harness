'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { ExportFormat } from '@/lib/csv-export';
import { exportData } from '@/lib/csv-export';

interface ExportOption {
  format: ExportFormat;
  label: string;
}

const OPTIONS: ExportOption[] = [
  { format: 'csv', label: 'CSV' },
  { format: 'json', label: 'JSON' },
];

export function ExportMenu({
  baseUrl,
  dataKey,
  totalKey,
  filename,
  columns,
  transform,
}: {
  baseUrl: string;
  dataKey: string;
  totalKey: string;
  filename: string;
  columns?: string[];
  transform?: (row: Record<string, unknown>) => Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setLoading(true);
    setOpen(false);
    try {
      await exportData({ baseUrl, dataKey, totalKey, filename, format, columns, transform });
    } catch {
      // Silently fail — network error or CORS
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        aria-label="Export data"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-300 hover:bg-white/[0.04] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
        <span className="hidden sm:inline">Export</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[100px] rounded-lg border border-white/[0.08] bg-[#1a1f2e] py-1 shadow-xl sm:left-auto sm:right-0">
            {OPTIONS.map((opt) => (
              <button
                key={opt.format}
                onClick={() => handleExport(opt.format)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}