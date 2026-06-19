'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useHarnessStore } from '@/store/harness-store';
import { useDashboard } from '@/hooks/use-harness-data';
import { HarnessHeader } from '@/components/harness/harness-header';
import { OverviewTab } from '@/components/harness/overview-tab';
import { SpecTab } from '@/components/harness/spec-tab';
import { WavesTab } from '@/components/harness/waves-tab';
import { DecisionsTab } from '@/components/harness/decisions-tab';
import { SkillsTab } from '@/components/harness/skills-tab';
import { MemoryTab } from '@/components/harness/memory-tab';
import { GithubTab } from '@/components/harness/github-tab';
import { Zap } from 'lucide-react';

const TABS: Record<string, { label: string; component: React.ReactNode }> = {
  overview: { label: 'Overview', component: <OverviewTab /> },
  spec: { label: 'Spec', component: <SpecTab /> },
  waves: { label: 'Waves', component: <WavesTab /> },
  decisions: { label: 'Decisions', component: <DecisionsTab /> },
  skills: { label: 'Skills', component: <SkillsTab /> },
  memory: { label: 'Memory', component: <MemoryTab /> },
  github: { label: 'GitHub', component: <GithubTab /> },
};

export default function Home() {
  const { activeTab } = useHarnessStore();
  const { data: dash } = useDashboard();

  const currentTab = TABS[activeTab] ?? TABS.overview;

  return (
    <div className="grid-bg min-h-screen bg-[#0a0a0a]">
      <HarnessHeader
        githubStatus={dash?.githubStatus}
        totalWaves={dash?.totalStats?.totalWaves}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {currentTab.component}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-auto border-t border-white/5 bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Zap className="h-3 w-3 text-emerald-500/50" />
            <span>HERMES HARNESS v2.1.0</span>
          </div>
          <div className="text-[10px] text-zinc-700">
            Spec-Driven Self-Evolution System
          </div>
        </div>
      </footer>
    </div>
  );
}