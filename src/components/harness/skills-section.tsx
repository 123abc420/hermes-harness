'use client';

import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkills } from '@/hooks/use-harness-data';
import { ErrorBlock } from './error-block';
import { CATEGORY_TW } from '@/lib/category-colors';

/* ── Helpers ─────────────────────────────────────────── */

// Strip markdown syntax and extract the first meaningful paragraph for preview
function skillPreview(content: string | null | undefined, maxLen = 150): string {
  if (!content) return 'No content available';
  // Strip YAML frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '');
  // Strip markdown headers, bold, italic, links, code blocks, horizontal rules
  const plain = withoutFrontmatter
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
    .replace(/_{1,3}(.*?)_{1,3}/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^---+$/gm, '')
    .replace(/^```[\s\S]*?```/gm, '')
    .replace(/^[>\-] /gm, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join(' ')
    .trim();
  if (!plain) return 'No content available';
  return plain.length > maxLen ? plain.slice(0, maxLen).replace(/\s+\S*$/, '') + '...' : plain;
}

/* ── Skills Section ───────────────────────────────────── */
export function SkillsSection() {
  const { data, isLoading, isError, error, refetch } = useSkills();
  const skills = data?.skills ?? [];
  const [activeFilter, setActiveFilter] = useState('all');

  // Derive unique categories from loaded skills
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const s of skills) {
      if (s.category) cats.add(s.category);
    }
    return ['all', ...Array.from(cats).sort()];
  }, [skills]);

  const filtered = activeFilter === 'all'
    ? skills
    : skills.filter(s => s.category === activeFilter);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Skills
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-zinc-600" />
            <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-500">
              {filtered.length}/{skills.length}
            </span>
          </div>
        </div>

        {/* Category filter pills */}
        {categories.length > 2 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {categories.map(cat => {
              const isActive = activeFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  aria-pressed={isActive}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all',
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.25)]'
                      : 'bg-white/[0.04] text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-400'
                  )}
                >
                  {cat === 'all' ? 'All' : cat.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isError ? (
          <ErrorBlock message={error?.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
              <p className="text-xs text-zinc-500">
                {activeFilter === 'all' ? 'No skills learned yet' : `No ${activeFilter.replace('_', ' ')} skills`}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-600">
                {activeFilter === 'all'
                  ? 'Skills are acquired as the agent evolves through waves'
                  : 'Try a different category filter'}
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {filtered.map((skill) => {
                const catColor = skill.category
                  ? CATEGORY_TW[skill.category] ?? 'bg-white/[0.06] text-zinc-400'
                  : '';
                return (
                  <motion.div
                    key={skill.name}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:border-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="min-w-0 truncate text-sm font-medium text-white">
                        {skill.title}
                      </h4>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {skill.category && (
                          <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-mono', catColor)}>
                            {skill.category.replace('_', ' ')}
                          </span>
                        )}
                        {skill.version && (
                          <span className="text-[9px] font-mono text-zinc-600">
                            v{skill.version}
                          </span>
                        )}
                      </div>
                    </div>
                    {skill.trigger && (
                      <p className="mt-1 text-[10px] italic text-zinc-600">
                        Trigger: {skill.trigger}
                      </p>
                    )}
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {skillPreview(skill.content)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}