'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useSkills } from '@/hooks/use-harness-data';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Plus, Sparkles, FileText, X } from 'lucide-react';

export function SkillsTab() {
  const { data, isLoading } = useSkills();
  const skills = data?.skills ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400">Learned Skills</h2>
        <CreateSkillDialog />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
              <p className="text-sm text-zinc-500">No skills learned yet</p>
              <p className="mt-1 text-xs text-zinc-600">
                Skills will be acquired as the agent evolves through waves
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}

function SkillCard({ skill }: { skill: { name: string; title: string; content: string } }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card
        className="group cursor-pointer border-white/10 bg-white/[0.03] transition-colors hover:border-white/15"
        onClick={() => setExpanded(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-medium text-white">{skill.title}</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-600">{skill.name}</span>
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-zinc-500">
            {skill.content.slice(0, 200)}
          </p>
        </CardContent>
      </Card>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-h-[80vh] border-white/10 bg-zinc-900 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{skill.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="mb-4 mt-4 text-xl font-bold text-white">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-3 mt-6 text-base font-semibold text-emerald-400">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 text-sm font-semibold text-zinc-200">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 text-sm leading-relaxed text-zinc-400">{children}</p>
                  ),
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!match) {
                      return (
                        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: '0.75rem 0',
                          borderRadius: '0.5rem',
                          fontSize: '0.7rem',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  },
                  ul: ({ children }) => (
                    <ul className="mb-2 list-inside list-disc space-y-1 text-sm text-zinc-400">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-zinc-400">{children}</li>
                  ),
                }}
              >
                {skill.content}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateSkillDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-white/10 bg-white/5 text-xs text-zinc-400 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-zinc-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">Skill Name</label>
            <Input
              placeholder="my-skill"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">Content (Markdown)</label>
            <Textarea
              placeholder="# Skill Title&#10;&#10;Description of the skill..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="border-white/10 bg-white/5 font-mono text-xs text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => {
                // POST to create skill would go here
                setOpen(false);
                setName('');
                setContent('');
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}