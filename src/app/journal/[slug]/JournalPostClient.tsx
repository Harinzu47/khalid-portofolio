'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { JournalPost } from '@/types';

type Props = {
  post: JournalPost;
  prevPost: JournalPost | null;
  nextPost: JournalPost | null;
};

/**
 * Journal post detail client component
 */
export default function JournalPostClient({ post, prevPost, nextPost }: Props) {
  return (
    <div className="min-h-screen bg-terminal-bg">

      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-terminal-bg/95 border-b border-terminal-border py-4">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 font-mono text-xs text-terminal-text-muted hover:text-terminal-secondary transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            back to journal
          </Link>
          <span className="font-mono text-xs text-terminal-text-muted hidden sm:block">
            ~/hzcode/journal/{post.slug}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">

        {/* Metadata header */}
        <div className="mb-10 pb-8 border-b border-terminal-border">
          {/* Date + read time */}
          <div className="flex flex-wrap items-center gap-4 mb-4 font-mono text-xs text-terminal-text-muted">
            <span>[{post.date}]</span>
            <span>{post.readTime} read</span>
          </div>

          {/* Title */}
          <h1 className="font-mono text-2xl md:text-3xl text-terminal-text-primary mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-terminal-text-secondary leading-relaxed mb-5">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs px-2 py-0.5 border border-terminal-secondary/30 text-terminal-secondary rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Markdown body */}
        <article className="prose-terminal">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="font-mono text-xl text-terminal-text-primary mt-8 mb-4 pb-2 border-b border-terminal-border">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-mono text-lg text-terminal-text-primary mt-8 mb-4 flex items-center gap-3">
                  <span className="text-terminal-primary">##</span>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-mono text-base text-terminal-text-primary mt-6 mb-3">
                  <span className="text-terminal-text-muted mr-1">###</span>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-5 text-terminal-text-secondary leading-[1.9]">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="text-terminal-text-primary font-semibold">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-none ml-0 mb-5 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-5 mb-5 space-y-2 text-terminal-text-secondary">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-terminal-text-secondary flex items-start gap-2">
                  <span className="text-terminal-primary mt-1 flex-shrink-0 text-xs">&gt;</span>
                  <span>{children}</span>
                </li>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-terminal-secondary hover:text-terminal-secondary/80 underline underline-offset-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-terminal-primary pl-5 my-6 bg-terminal-bg py-3 pr-5 rounded-r text-terminal-text-secondary italic">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse font-mono text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="border-b border-terminal-border bg-terminal-bg">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="text-left py-2 px-4 text-terminal-text-muted font-normal text-xs uppercase tracking-wider">
                  {children}
                </th>
              ),
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => (
                <tr className="border-b border-terminal-border/50 even:bg-terminal-bg odd:bg-terminal-surface">
                  {children}
                </tr>
              ),
              td: ({ children }) => (
                <td className="py-2 px-4 text-terminal-text-secondary text-sm">{children}</td>
              ),
              hr: () => <hr className="border-terminal-border my-8" />,
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const isInline = !match && !className;

                if (isInline) {
                  return (
                    <code
                      className="font-mono text-terminal-secondary bg-terminal-bg border border-terminal-border px-1.5 py-0.5 rounded text-xs"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match ? match[1] : 'text'}
                    PreTag="div"
                    className="!rounded !border !border-terminal-border !my-6"
                    customStyle={{
                      background: '#0d1117',
                      padding: '1.25rem',
                      fontSize: '0.8rem',
                      margin: '0',
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Prev / Next navigation */}
        <div className="mt-14 pt-8 border-t border-terminal-border grid grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              href={`/journal/${prevPost.slug}`}
              className="border border-terminal-border bg-terminal-surface rounded p-4 hover:border-terminal-text-muted transition-colors group"
            >
              <p className="font-mono text-xs text-terminal-text-muted mb-1">&lt; older</p>
              <p className="font-mono text-sm text-terminal-text-primary group-hover:text-terminal-secondary transition-colors line-clamp-2">
                {prevPost.title}
              </p>
            </Link>
          ) : <div />}

          {nextPost ? (
            <Link
              href={`/journal/${nextPost.slug}`}
              className="border border-terminal-border bg-terminal-surface rounded p-4 hover:border-terminal-text-muted transition-colors group text-right"
            >
              <p className="font-mono text-xs text-terminal-text-muted mb-1">newer &gt;</p>
              <p className="font-mono text-sm text-terminal-text-primary group-hover:text-terminal-secondary transition-colors line-clamp-2">
                {nextPost.title}
              </p>
            </Link>
          ) : <div />}
        </div>
      </main>
    </div>
  );
}
