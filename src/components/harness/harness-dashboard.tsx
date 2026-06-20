'use client';

import { useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, Waves, Brain, BookOpen, Github, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHarnessStore } from '@/store/harness-store';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import { useAgentLive } from '@/hooks/use-agent-live';
import { OverviewTab } from './overview-tab';
import { WavesTab } from './waves-tab';
import { DecisionsTab } from './decisions-tab';
import { ResearchTab } from './research-tab';
import { GithubTab } from './github-tab';
import { AgentLivePanel } from './agent-live-panel';
import { HarnessHeader } from './harness-header';
import { HarnessErrorBoundary } from './error-boundary';

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
 * with tabs, header, footer, and keyboard shortcuts.
 *
 * Usage:
 *   import { HarnessDashboard } from '@/harness';
 *   <HarnessDashboard />
 */
export function HarnessDashboard() {
  const activeTab = useHarnessStore(s => s.activeTab);
  const setActiveTab = useHarnessStore(s => s.setActiveTab);
  const { data: dash } = useHarnessDashboard();

  // Connect to the real-time agent live service
  useAgentLive();

  // Keyboard shortcuts: 1-6 to switch tabs (only when not in an input/textarea)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable) return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= TAB_CONFIG.length) {
      setActiveTab(TAB_CONFIG[num - 1].value);
    }
  }, [setActiveTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="dot-pattern min-h-screen flex flex-col bg-[#0d0906]">
      <HarnessHeader
        githubStatus={dash?.githubStatus}
        totalWaves={dash?.totalStats?.totalWaves}
        healthScore={dash?.healthScore}
        healthScoreTrend={dash?.healthScoreTrend}
        healthBreakdown={dash?.healthBreakdown}
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
    </div>
  );
}