'use client';

import { useEffect, useCallback, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, Waves, Brain, BookOpen, Github, Eye, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useHarnessStore } from '@/store/harness-store';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import { useAgentLive } from '@/hooks/use-agent-live';
import { HERMES_VERSION } from '@/lib/constants';
import { OverviewTab } from './overview-tab';
import { WavesTab } from './waves-tab';
import { DecisionsTab } from './decisions-tab';
import { ResearchTab } from './research-tab';
import { GithubTab } from './github-tab';
import { AgentLivePanel } from './agent-live-panel';
import { HarnessHeader } from './harness-header';
import { HarnessErrorBoundary } from './error-boundary';
import { CommandPalette } from './command-palette';

const TAB_CONFIG = [
  { value: 'agent', label: 'Agent Live', icon: Eye },
  { value: 'overview', label: 'Overview', icon: Zap },
  { value: 'waves', label: 'Waves', icon: Waves },
  { value: 'decisions', label: 'Decisions', icon: Brain },
  { value: 'research', label: 'Analytics', icon: BookOpen },
  { value: 'github', label: 'GitHub & Export', icon: Github },
] as const;

/**
 * HarnessDashboard — Self-contained composite component.
 * Drop this into any Next.js app to render the full HARNESS dashboard
 * with tabs, header, command palette, footer, and keyboard shortcuts.
 *
 * Usage:
 *   import { HarnessDashboard } from '@/harness';
 *   <HarnessDashboard />
 */
export function HarnessDashboard() {
  const activeTab = useHarnessStore(s => s.activeTab);
  const setActiveTab = useHarnessStore(s => s.setActiveTab);
  const { data: dash } = useHarnessDashboard();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Connect to the real-time agent live service
  useAgentLive();

  // Keyboard shortcuts: 1-6 to switch tabs, Cmd+K for command palette
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Cmd/Ctrl+K opens command palette (works even in inputs)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowPalette(v => !v);
      return;
    }

    // ESC closes palette
    if (e.key === 'Escape' && showPalette) {
      setShowPalette(false);
      return;
    }

    if (inInput) return;

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= TAB_CONFIG.length) {
      setActiveTab(TAB_CONFIG[num - 1].value);
    }
  }, [setActiveTab, showPalette]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
    {/* Global Command Palette (Cmd+K) */}
    <CommandPalette
      open={showPalette}
      onClose={() => setShowPalette(false)}
      onNavigate={(tab) => setActiveTab(tab)}
    />

    <div className="dot-pattern min-h-screen flex flex-col bg-[#0d0906]">
      <HarnessHeader
        githubStatus={dash?.githubStatus}
        totalWaves={dash?.totalStats?.totalWaves}
        healthScore={dash?.healthScore}
        healthScoreTrend={dash?.healthScoreTrend}
        healthBreakdown={dash?.healthBreakdown}
        onSearch={() => setShowPalette(true)}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="mb-6 overflow-x-auto scrollbar-dark">
            <TabsList className="inline-flex h-auto gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1.5 backdrop-blur-md">
              {TAB_CONFIG.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                const isAgentTab = tab.value === 'agent';
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                      isAgentTab && isActive
                        ? 'bg-amber-500/15 text-amber-300 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.3)]'
                        : isActive
                        ? 'bg-amber-500/10 text-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]'
                        : isAgentTab
                        ? 'text-zinc-400 hover:bg-amber-500/5 hover:text-amber-300'
                        : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'
                    }`}
                  >
                    {isAgentTab && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                    )}
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    <kbd className="hidden lg:inline-flex items-center justify-center h-4 w-4 rounded text-[9px] font-mono text-zinc-600 bg-white/[0.04] border border-white/[0.06]">
                      {TAB_CONFIG.indexOf(tab) + 1}
                    </kbd>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <HarnessErrorBoundary>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <TabsContent value="agent" className="mt-0">
                <AgentLivePanel />
              </TabsContent>
              <TabsContent value="overview" className="mt-0">
                <OverviewTab />
              </TabsContent>
              <TabsContent value="waves" className="mt-0">
                <WavesTab />
              </TabsContent>
              <TabsContent value="decisions" className="mt-0">
                <DecisionsTab />
              </TabsContent>
              <TabsContent value="research" className="mt-0">
                <ResearchTab />
              </TabsContent>
              <TabsContent value="github" className="mt-0">
                <GithubTab />
              </TabsContent>
            </motion.div>
          </HarnessErrorBoundary>
        </Tabs>
      </main>

      {/* Footer with wave status and keyboard shortcuts */}
      <footer className="mt-auto border-t border-amber-900/[0.12] bg-[#0d0906] relative">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-800/50">
              <Zap className="h-3 w-3 text-amber-500/30" />
              <span className="font-mono">HERMES HARNESS {HERMES_VERSION}</span>
            </div>
            {dash?.waves?.[0] && (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
                <Activity className="h-2.5 w-2.5 text-emerald-500/40" />
                <span className="text-zinc-500">#{String(dash.waves[0].waveNumber).padStart(3, '0')}</span>
                <span className="text-zinc-700">{dash.waves[0].status === 'completed' ? 'completed' : dash.waves[0].status}</span>
                {dash.waves[0].completedAt && (
                  <span className="text-zinc-700">{formatDistanceToNow(new Date(dash.waves[0].completedAt), { addSuffix: true })}</span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[10px] text-amber-900/40 font-mono">Agent = Model + Harness</span>
            <span className="hidden sm:inline text-[10px] text-amber-900/40 font-mono">
              Spec-Driven Self-Evolution
            </span>
            <button
              onClick={() => setShowShortcuts(v => !v)}
              className="inline-flex items-center justify-center h-5 w-5 rounded text-[10px] font-mono text-amber-900/40 hover:text-amber-400/70 bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 transition-colors"
              aria-label="Keyboard shortcuts"
            >
              ?
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showShortcuts && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShortcuts(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-4 sm:right-6 mb-2 z-50 w-64 rounded-xl border border-white/[0.08] bg-[#1a1510] p-4 shadow-2xl"
              >
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Keyboard Shortcuts</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400/80">Global Search</span>
                    <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-mono text-zinc-500 bg-white/[0.05] border border-white/[0.08]">
                      ⌘K
                    </kbd>
                  </div>
                  {TAB_CONFIG.map((tab) => (
                    <div key={tab.value} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{tab.label}</span>
                      <kbd className="inline-flex items-center justify-center h-5 w-5 rounded text-[10px] font-mono text-zinc-500 bg-white/[0.05] border border-white/[0.08]">
                        {TAB_CONFIG.indexOf(tab) + 1}
                      </kbd>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </footer>
    </div>
    </>
  );
}