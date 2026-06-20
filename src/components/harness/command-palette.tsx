'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Waves, Brain, Loader2, ArrowRight, Eye, Zap, BookOpen, Github } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────── */
interface WaveResult {
  id: string;
  waveNumber: number;
  status: string;
  summary: string | null;
  decisions?: { id: string }[];
}

interface DecisionResult {
  id: string;
  category: string;
  priority: string;
  description: string;
  wave?: { waveNumber: number; status: string } | null;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const TAB_NAV_ITEMS = [
  { key: 'agent', label: 'Agent Live', icon: Eye },
  { key: 'overview', label: 'Overview', icon: Zap },
  { key: 'waves', label: 'Waves', icon: Waves },
  { key: 'decisions', label: 'Decisions', icon: Brain },
  { key: 'research', label: 'Analytics', icon: BookOpen },
  { key: 'github', label: 'GitHub & Export', icon: Github },
];

/* ── Component ─────────────────────────────────────────── */
export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [waves, setWaves] = useState<WaveResult[]>([]);
  const [decisions, setDecisions] = useState<DecisionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [debounceRef, setDebounceRef] = useState<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allResults = [
    ...waves.map(w => ({ type: 'wave' as const, data: w, label: `Wave #${w.waveNumber}`, sub: w.summary ?? '' })),
    ...decisions.map(d => ({ type: 'decision' as const, data: d, label: `${d.category} — ${d.priority}`, sub: d.description })),
  ];
  const totalResults = allResults.length;

  // Focus input and reset state on open (async to avoid sync-setState-in-effect)
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setQuery('');
        setWaves([]);
        setDecisions([]);
        setActiveIdx(0);
        setLoading(false);
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setWaves([]); setDecisions([]); return; }
    setLoading(true);
    try {
      const [wRes, dRes] = await Promise.all([
        fetch(`/api/harness/waves?search=${encodeURIComponent(q)}&limit=5`).then(r => r.json()),
        fetch(`/api/harness/decisions?search=${encodeURIComponent(q)}&limit=5`).then(r => r.json()),
      ]);
      setWaves(wRes.waves ?? []);
      setDecisions(dRes.decisions ?? []);
      setActiveIdx(0);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef) clearTimeout(debounceRef);
    const ref = setTimeout(() => doSearch(val), 250);
    setDebounceRef(ref);
  }, [debounceRef, doSearch]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, totalResults - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && allResults[activeIdx]) {
      const r = allResults[activeIdx];
      onNavigate(r.type === 'wave' ? 'waves' : 'decisions');
      onClose();
    }
    else if (e.key === 'Escape') { onClose(); }
  }, [activeIdx, allResults, onClose, onNavigate, totalResults]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // Cleanup debounce on unmount
  useEffect(() => () => { if (debounceRef) clearTimeout(debounceRef); }, [debounceRef]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-x-0 top-[15%] z-50 mx-auto w-full max-w-lg px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1510]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                {loading ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-400/60" />
                ) : (
                  <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                )}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search waves & decisions..."
                  className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
                />
                <kbd className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 bg-white/[0.04] border border-white/[0.06]">ESC</kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-72 overflow-y-auto p-2 scrollbar-dark">
                {!query.trim() && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Navigate</div>
                    {TAB_NAV_ITEMS.map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => { onNavigate(tab.key); onClose(); }}
                          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-zinc-400 hover:bg-white/[0.04] transition-colors"
                        >
                          <TabIcon className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                          <span className="text-xs">{tab.label}</span>
                          <ArrowRight className="ml-auto h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </>
                )}
                {query.trim() && (
                  <div className="px-3 py-1.5 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Results</div>
                )}
                {query.trim() && !loading && totalResults === 0 && (
                  <div className="px-3 py-8 text-center text-xs text-zinc-600">
                    No results for &quot;{query}&quot;
                  </div>
                )}
                {allResults.map((item, idx) => {
                  const Icon = item.type === 'wave' ? Waves : Brain;
                  const isActive = idx === activeIdx;
                  const btnCls = isActive
                    ? 'group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors bg-amber-500/10 text-amber-200'
                    : 'group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors text-zinc-400 hover:bg-white/[0.04]';
                  const iconCls = isActive ? 'mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400' : 'mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600';
                  return (
                    <button
                      key={`${item.type}-${item.data.id}`}
                      onClick={() => { onNavigate(item.type === 'wave' ? 'waves' : 'decisions'); onClose(); }}
                      className={btnCls}
                    >
                      <Icon className={iconCls} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium truncate">{item.label}</span>
                          <ArrowRight className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-100" />
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-500 truncate">{item.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer hint */}
              {query.trim() && totalResults > 0 && (
                <div className="border-t border-white/[0.06] px-4 py-2 flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-600">
                  <span><kbd className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mr-1">↑↓</kbd> navigate</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mr-1">↵</kbd> open</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] mr-1">esc</kbd> close</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}