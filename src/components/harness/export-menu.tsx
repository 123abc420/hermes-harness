'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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

export function ExportMenu<T extends Record<string, unknown>>({
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
  transform?: (row: T) => Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus first item when menu opens
  useEffect(() => {
    if (open) {
      // Delay to ensure DOM is ready
      const id = requestAnimationFrame(() => {
        itemRefs.current[0]?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Keyboard handling for the entire menu
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
      case 'ArrowDown': {
        e.preventDefault();
        const items = itemRefs.current.filter(Boolean);
        const idx = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = (idx + 1) % items.length;
        items[next]?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const items = itemRefs.current.filter(Boolean);
        const idx = items.indexOf(document.activeElement as HTMLButtonElement);
        const prev = (idx - 1 + items.length) % items.length;
        items[prev]?.focus();
        break;
      }
      case 'Tab':
        // Trap: prevent Tab from leaving the menu while open
        e.preventDefault();
        closeMenu();
        break;
    }
  }, [open, closeMenu]);

  const handleExport = async (format: ExportFormat) => {
    setLoading(true);
    setOpen(false);
    try {
      await exportData({ baseUrl, dataKey, totalKey, filename, format, columns, transform });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      toast.error(msg, { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        disabled={loading}
        aria-label="Export data"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-300 hover:bg-white/[0.04] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
        <span className="hidden sm:inline">Export</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} aria-hidden="true" />
          <div
            role="menu"
            aria-label="Export format"
            className="absolute left-0 top-full z-50 mt-1 min-w-[100px] rounded-lg border border-white/[0.08] bg-[#1a1f2e] py-1 shadow-xl sm:left-auto sm:right-0"
          >
            {OPTIONS.map((opt, i) => (
              <button
                key={opt.format}
                ref={(el) => { itemRefs.current[i] = el; }}
                role="menuitem"
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