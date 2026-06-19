'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSpec } from '@/hooks/use-harness-data';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText, Clock, Layers, Shield } from 'lucide-react';

export function SpecTab() {
  const { data, isLoading, error } = useSpec();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-zinc-500">Failed to load spec</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metadata bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <FileText className="h-3.5 w-3.5" />
          <span>v{data.version}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{new Date(data.lastUpdated).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Layers className="h-3.5 w-3.5" />
          <span>{data.sectionsCount} sections</span>
        </div>
      </div>

      {/* Spec content */}
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-400">
            System Specification
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[70vh]">
            <div className="prose-invert max-w-none px-6 pb-6">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="mb-6 mt-6 border-b border-white/10 pb-3 text-2xl font-bold text-white">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-4 mt-8 text-lg font-semibold text-emerald-400">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-3 mt-6 text-sm font-semibold text-zinc-200">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 text-sm leading-relaxed text-zinc-400">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-zinc-200">{children}</strong>
                  ),
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    if (isInline) {
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
                          margin: '1rem 0',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  },
                  table: ({ children }) => (
                    <div className="mb-4 overflow-x-auto">
                      <table className="w-full text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-white/10 px-3 py-2 text-left font-medium text-zinc-300">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-white/5 px-3 py-2 text-zinc-400">
                      {children}
                    </td>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-zinc-400">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 list-inside list-decimal space-y-1 text-sm text-zinc-400">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm leading-relaxed text-zinc-400">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-3 border-l-2 border-emerald-500/40 pl-4 text-sm italic text-zinc-500">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline underline-offset-2 transition-colors hover:text-emerald-300"
                    >
                      {children}
                    </a>
                  ),
                  hr: () => (
                    <hr className="my-6 border-white/10" />
                  ),
                }}
              >
                {data.content}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}