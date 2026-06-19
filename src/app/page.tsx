'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, Waves, Brain, BookOpen, Github, Eye } from 'lucide-react';
import { useHarnessStore } from '@/store/harness-store';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import { useAgentLive } from '@/hooks/use-agent-live';
import { HERMES_VERSION } from '@/lib/constants';
import { HarnessHeader } from '@/components/harness/harness-header';
import { OverviewTab } from '@/components/harness/overview-tab';
import { AgentLivePanel } from '@/components/harness/agent-live-panel';
import { WavesTab } from '@/components/harness/waves-tab';
import { DecisionsTab } from '@/components/harness/decisions-tab';
import { ResearchTab } from '@/components/harness/research-tab';
import { GithubTab } from '@/components/harness/github-tab';
import { HarnessErrorBoundary } from '@/components/harness/error-boundary';

const TAB_CONFIG = [
  { value: 'agent', label: 'Agent Live', icon: Eye },
  { value: 'overview', label: 'Overview', icon: Zap },
  { value: 'waves', label: 'Waves', icon: Waves },
  { value: 'decisions', label: 'Decisions', icon: Brain },
  { value: 'research', label: 'Research & Memory', icon: BookOpen },
  { value: 'github', label: 'GitHub & Export', icon: Github },
] as const;

// Map keyboard digit keys (1-6) to tab values for quick navigation
const TAB_KEY_MAP: Record<string, string> = {
  '1': 'agent', '2': 'overview', '3': 'waves',
  '4': 'decisions', '5': 'research', '6': 'github',
};

export default function Home() {
  const { activeTab, setActiveTab } = useHarnessStore();
  const { data: dash } = useHarnessDashboard();

  // Connect to the real-time agent live service
  useAgentLive();

  // Keyboard shortcuts: 1-6 to switch tabs (only when no input/textarea focused)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    const tabValue = TAB_KEY_MAP[e.key];
    if (tabValue && tabValue !== activeTab) {
      setActiveTab(tabValue);
    }
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="dot-pattern min-h-screen flex flex-col bg-[#0d0906]">
      <HarnessHeader
        githubStatus={dash?.githubStatus}
        totalWaves={dash?.totalStats?.totalWaves}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Tab navigation */}
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

          {/* Tab content with animation */}
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

      <footer className="mt-auto border-t border-amber-900/[0.12] bg-[#0d0906]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-amber-800/50">
            <Zap className="h-3 w-3 text-amber-500/30" />
            <span className="font-mono">HERMES HARNESS {HERMES_VERSION}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[10px] text-amber-900/40 font-mono">Agent = Model + Harness</span>
            <span className="hidden sm:inline text-[10px] text-amber-900/40 font-mono">
              Spec-Driven Self-Evolution
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}