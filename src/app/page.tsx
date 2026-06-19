'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, Waves, Brain, BookOpen, Github, Eye } from 'lucide-react';
import { useHarnessStore } from '@/store/harness-store';
import { useHarnessDashboard } from '@/hooks/use-harness-data';
import { useAgentLive } from '@/hooks/use-agent-live';
import { HarnessHeader } from '@/components/harness/harness-header';
import { OverviewTab } from '@/components/harness/overview-tab';
import { AgentLivePanel } from '@/components/harness/agent-live-panel';
import { WavesTab } from '@/components/harness/waves-tab';
import { DecisionsTab } from '@/components/harness/decisions-tab';
import { ResearchTab } from '@/components/harness/research-tab';
import { GithubTab } from '@/components/harness/github-tab';

const TAB_CONFIG = [
  { value: 'agent', label: 'Agent Live', icon: Eye },
  { value: 'overview', label: 'Overview', icon: Zap },
  { value: 'waves', label: 'Waves', icon: Waves },
  { value: 'decisions', label: 'Decisions', icon: Brain },
  { value: 'research', label: 'Research & Memory', icon: BookOpen },
  { value: 'github', label: 'GitHub & Export', icon: Github },
] as const;

export default function Home() {
  const { activeTab, setActiveTab } = useHarnessStore();
  const { data: dash } = useHarnessDashboard();

  // Connect to the real-time agent live service
  useAgentLive();

  return (
    <div className="dot-pattern min-h-screen flex flex-col bg-[#050a0e]">
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
                        ? 'bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]'
                        : isActive
                        ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                        : isAgentTab
                        ? 'text-zinc-400 hover:bg-emerald-500/5 hover:text-emerald-300'
                        : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'
                    }`}
                  >
                    {isAgentTab && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab content with animation */}
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
        </Tabs>
      </main>

      <footer className="mt-auto border-t border-white/[0.06] bg-[#050a0e]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Zap className="h-3 w-3 text-emerald-500/40" />
            <span>HERMES HARNESS v0.2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-700">Agent Live Enabled</span>
            <span className="text-[10px] text-zinc-700">
              Spec-Driven Self-Evolution System
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}