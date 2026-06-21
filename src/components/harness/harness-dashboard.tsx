'use client';

import { cn } from '@/lib/utils';
import { useEffect, useCallback, useState, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, Waves, Brain, BookOpen, Github, Eye, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { WaveSparkline, SuccessRatePulse, UptimeDisplay, LastWaveBadge } from './shared-footer-components';
import { useHarnessStore, type TabValue } from '@/store/harness-store';
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
  { value: 'agent', label: 'Agent Live', icon: Eye, dotColor: 'bg-amber-500', dotColorInactive: 'bg-amber-500/60' },
  { value: 'overview', label: 'Overview', icon: Zap, dotColor: 'bg-emerald-500', dotColorInactive: 'bg-emerald-500/60' },
  { value: 'waves', label: 'Waves', icon: Waves, dotColor: 'bg-cyan-500', dotColorInactive: 'bg-cyan-500/60' },
  { value: 'decisions', label: 'Decisions', icon: Brain, dotColor: 'bg-violet-500', dotColorInactive: 'bg-violet-500/60' },
  { value: 'research', label: 'Analytics', icon: BookOpen, dotColor: 'bg-orange-500', dotColorInactive: 'bg-orange-500/60' },
  { value: 'github', label: 'GitHub & Export', icon: Github, dotColor: 'bg-amber-500', dotColorInactive: 'bg-amber-500/60' },
] as const;

/* ── Main Dashboard ────────────────────────────────────── */
export function HarnessDashboard() {
  const activeTab = useHarnessStore(s => s.activeTab);
  const setActiveTab = useHarnessStore(s => s.setActiveTab);
  const { data: dash } = useHarnessDashboard();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const reduced = usePrefersReducedMotion();
  const tabListRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Connect to the real-time agent live service
  useAgentLive();

  // Parallax on scroll — use ref to avoid re-rendering entire dashboard per scroll pixel
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (parallaxBgRef.current) {
        parallaxBgRef.current.style.backgroundPosition = `0px ${window.scrollY * 0.08}px`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Update sliding indicator position
  const updateIndicator = useCallback(() => {
    if (!tabListRef.current) return;
    const list = tabListRef.current;
    const activeEl = list.querySelector(`[data-tab-value="${activeTab}"]`) as HTMLElement | null;
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    // Delay to allow layout to settle
    const t = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(t);
  }, [activeTab, updateIndicator]);

  // Recalculate on window resize
  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateIndicator]);

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

  const waves = dash?.waves ?? [];
  const firstWave = waves.length > 0 ? waves[waves.length - 1] : undefined;
  const successRate = dash?.totalStats?.waveSuccessRate ?? 0;

  // Parallax offset is now handled via direct DOM mutation (see effect above)

  return (
    <>
    {/* Global Command Palette (Cmd+K) */}
    <CommandPalette
      open={showPalette}
      onClose={() => setShowPalette(false)}
      onNavigate={(tab) => setActiveTab(tab as TabValue)}
    />

    <div
      ref={parallaxBgRef}
      className="dot-pattern-parallax min-h-screen flex flex-col bg-[#0d0906]"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(245, 158, 11, 0.06) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
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
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="w-full"
        >
          <div className="mb-6 overflow-x-auto scrollbar-dark">
            <TabsList ref={tabListRef} className="relative inline-flex h-auto gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1.5 backdrop-blur-md">
              {/* Sliding indicator */}
              <motion.div
                className="absolute bottom-1.5 h-[calc(100%-12px)] rounded-lg bg-amber-500/[0.08] shadow-[inset_0_0_0_1px_rgba(245,158,11,0.15)]"
                animate={indicatorStyle}
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
              />
              {TAB_CONFIG.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                const isAgentTab = tab.value === 'agent';
                // Show dot if there's recent data (simulate "new" data for active agent and overview)
                const showDot = (isAgentTab && dash) || (tab.value === 'overview' && waves.length > 0);
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    data-tab-value={tab.value}
                    aria-label={tab.label}
                    className={cn(
                      'relative z-10 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm',
                      isAgentTab && isActive && 'bg-transparent text-amber-300',
                      !isAgentTab && isActive && 'bg-transparent text-amber-400',
                      isAgentTab && !isActive && 'text-zinc-400 hover:bg-amber-500/5 hover:text-amber-300',
                      !isAgentTab && !isActive && 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'
                    )}
                  >
                    {isAgentTab && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                    )}
                    {!isAgentTab && showDot && (
                      <span className={cn('absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full', isActive ? tab.dotColor : tab.dotColorInactive)} />
                    )}
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    <kbd className="hidden lg:inline-flex items-center justify-center h-4 w-4 rounded text-[9px] font-mono text-zinc-600 bg-white/[0.04] border border-white/[0.06]">
                      {idx + 1}
                    </kbd>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <motion.div
            key={activeTab}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
          >
            <TabsContent value="agent" className="mt-0" style={{ height: 'calc(100vh - 220px)' }}>
              <HarnessErrorBoundary inline label="Agent Live">
                <AgentLivePanel />
              </HarnessErrorBoundary>
            </TabsContent>
            <TabsContent value="overview" className="mt-0">
              <HarnessErrorBoundary inline label="Overview">
                <OverviewTab />
              </HarnessErrorBoundary>
            </TabsContent>
            <TabsContent value="waves" className="mt-0">
              <HarnessErrorBoundary inline label="Waves">
                <WavesTab />
              </HarnessErrorBoundary>
            </TabsContent>
            <TabsContent value="decisions" className="mt-0">
              <HarnessErrorBoundary inline label="Decisions">
                <DecisionsTab />
              </HarnessErrorBoundary>
            </TabsContent>
            <TabsContent value="research" className="mt-0">
              <HarnessErrorBoundary inline label="Analytics">
                <ResearchTab />
              </HarnessErrorBoundary>
            </TabsContent>
            <TabsContent value="github" className="mt-0">
              <HarnessErrorBoundary inline label="GitHub & Export">
                <GithubTab />
              </HarnessErrorBoundary>
            </TabsContent>
          </motion.div>
        </Tabs>
      </main>

      {/* ── Enhanced Footer ────────────────────────────── */}
      <footer className="mt-auto relative">
        {/* Gradient separator line */}
        <div className="footer-gradient-line" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6 bg-[#0d0906]">
          {/* Left section: version + wave info + sparkline + uptime */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-amber-800/50">
              <Zap className="h-3 w-3 text-amber-500/30" />
              <span className="font-mono">HERMES HARNESS {HERMES_VERSION}</span>
            </div>

            {/* Wave activity sparkline */}
            {waves.length >= 2 && (
              <div className="flex items-center gap-1.5">
                <Activity className="h-2.5 w-2.5 text-amber-500/30" />
                <WaveSparkline waves={waves} />
              </div>
            )}

            <LastWaveBadge wave={dash?.waves?.[0]} />

            {/* System uptime */}
            <UptimeDisplay firstWaveStart={firstWave?.startedAt} />
          </div>

          {/* Right section: success rate pulse + motto + shortcuts */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Success rate pulse bar */}
            {successRate > 0 && (
              <SuccessRatePulse rate={successRate} />
            )}
            <span className="hidden sm:inline text-[10px] text-amber-900/40 font-mono">Agent = Model + Harness</span>
            <span className="hidden md:inline text-[10px] text-amber-900/40 font-mono">
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
              <div role="presentation" className="fixed inset-0 z-40" onClick={() => setShowShortcuts(false)} />
              <motion.div
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={reduced ? { duration: 0 } : { duration: 0.15 }}
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
                  {TAB_CONFIG.map((tab, idx) => (
                    <div key={tab.value} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{tab.label}</span>
                      <kbd className="inline-flex items-center justify-center h-5 w-5 rounded text-[10px] font-mono text-zinc-500 bg-white/[0.05] border border-white/[0.08]">
                        {idx + 1}
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
