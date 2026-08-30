'use client';

/**
 * TechnicalContentRenderer — THE canonical Markdown rendering path for HZCODE.
 *
 * Amendment 1: Single shared renderer for Private Preview AND Public Tech Note Detail.
 * Amendment 2: No rehype-raw. Raw HTML is not rendered (react-markdown default).
 * Amendment 9: Uses existing react-syntax-highlighter (already installed) for code blocks.
 * Amendment 23: Accepts a `variant` prop to scope public vs admin styling classes.
 * Amendment 24: Public prose uses comfortable reading width; diagrams/tables/code break wider.
 *
 * Architecture:
 *   Markdown source → react-markdown + remark-gfm
 *     ├── ordinary elements → server-compatible React (headings, paragraphs, lists, etc.)
 *     ├── code blocks → syntax highlighted with language label
 *     └── mermaid fenced blocks → MermaidDiagram (client boundary, lazy)
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MermaidDiagram } from './MermaidDiagram';
import { sanitizeUrl } from '@/lib/url-sanitizer';
import type { Components } from 'react-markdown';

interface TechnicalContentRendererProps {
  content: string;
  /** 'public' for published Tech Note pages, 'admin' for private preview pane */
  variant?: 'public' | 'admin';
}

export function TechnicalContentRenderer({
  content,
  variant = 'public',
}: TechnicalContentRendererProps) {
  const isAdmin = variant === 'admin';

  const components: Components = useMemo(
    () => ({
      // --- Headings ---
      h1: ({ children }) => (
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight text-text-primary mt-10 mb-4 uppercase">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-text-primary mt-8 mb-3 uppercase border-b border-border-subtle pb-2">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-lg md:text-xl font-headline font-semibold text-text-primary mt-6 mb-2">
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 className="text-base font-headline font-semibold text-text-primary mt-5 mb-2">
          {children}
        </h4>
      ),

      // --- Paragraph ---
      p: ({ children }) => (
        <p className="text-base leading-relaxed text-text-primary mb-4 font-sans">
          {children}
        </p>
      ),

      // --- Lists ---
      ul: ({ children }) => (
        <ul className="list-disc list-outside pl-6 space-y-1.5 text-base text-text-primary mb-4 font-sans">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal list-outside pl-6 space-y-1.5 text-base text-text-primary mb-4 font-sans">
          {children}
        </ol>
      ),
      li: ({ children }) => (
        <li className="leading-relaxed">{children}</li>
      ),

      // --- Blockquote ---
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-text-primary pl-4 md:pl-6 py-2 my-4 text-text-secondary italic font-sans">
          {children}
        </blockquote>
      ),

      // --- Table (Amendment 24: may break wider) ---
      table: ({ children }) => (
        <div className="my-6 overflow-x-auto border border-border-subtle">
          <table className="w-full text-sm font-mono border-collapse">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-surface-container-high border-b border-border-subtle">
          {children}
        </thead>
      ),
      tbody: ({ children }) => <tbody className="divide-y divide-border-subtle">{children}</tbody>,
      tr: ({ children }) => <tr className="hover:bg-surface-container/40">{children}</tr>,
      th: ({ children }) => (
        <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest font-semibold text-text-secondary">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="px-4 py-2.5 text-text-primary">{children}</td>
      ),

      // --- Inline code ---
      code: ({ children, className, ...rest }) => {
        const match = /language-(\w+)/.exec(className || '');

        // Fenced code block (has language class)
        if (match) {
          const language = match[1].toLowerCase();
          const codeString = String(children || '').replace(/\n$/, '');

          // Amendment 4: Mermaid blocks → MermaidDiagram client boundary
          if (language === 'mermaid') {
            return <MermaidDiagram chart={codeString} isAdminPreview={isAdmin} />;
          }

          // Amendment 9: Reuse existing react-syntax-highlighter dependency
          return (
            <div className="my-6 border border-border-subtle bg-surface-container overflow-hidden">
              {/* Language badge header */}
              <div className="flex items-center justify-between px-4 py-2 bg-surface-container-high border-b border-border-subtle font-mono text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-text-secondary opacity-40" />
                  <span className="w-2 h-2 rounded-full bg-text-secondary opacity-30" />
                  <span className="w-2 h-2 rounded-full bg-text-secondary opacity-20" />
                </div>
                <span className="uppercase text-[10px] tracking-widest font-semibold">
                  {language}
                </span>
              </div>
              {/* Code content */}
              <div className="p-4 overflow-x-auto">
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  showLineNumbers
                  customStyle={{
                    background: 'transparent',
                    margin: 0,
                    padding: 0,
                    fontSize: '0.8rem',
                    lineHeight: 1.65,
                  }}
                  lineNumberStyle={{
                    color: '#6b7280',
                    paddingRight: '1em',
                    minWidth: '2.5em',
                    userSelect: 'none',
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            </div>
          );
        }

        // Inline code
        return (
          <code
            className="px-1.5 py-0.5 bg-surface-container text-text-primary font-mono text-[0.875em] border border-border-subtle"
            {...rest}
          >
            {children}
          </code>
        );
      },

      // Wraps fenced code blocks
      pre: ({ children }) => <>{children}</>,

      // --- Links (Amendment 3: centralized URL sanitization) ---
      a: ({ href, children }) => {
        const safeHref = sanitizeUrl(href);
        if (!safeHref) {
          // Unsafe URL — render as plain text
          return <span className="text-text-secondary">{children}</span>;
        }
        const isExternal = /^https?:\/\//.test(safeHref);
        return (
          <a
            href={safeHref}
            className="text-text-primary underline decoration-border-subtle underline-offset-2 hover:decoration-text-primary transition-colors font-sans"
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {children}
          </a>
        );
      },

      // --- Horizontal rule ---
      hr: () => <hr className="my-8 border-t border-border-subtle" />,

      // --- Strong / Em ---
      strong: ({ children }) => (
        <strong className="font-semibold text-text-primary">{children}</strong>
      ),
      em: ({ children }) => <em className="italic">{children}</em>,

      // --- Images (basic safe rendering) ---
      img: ({ src, alt }) => {
        const safeSrc = sanitizeUrl(src);
        if (!safeSrc) return null;
        return (
          <span className="block my-6">
            <img
              src={safeSrc}
              alt={alt || ''}
              className="max-w-full h-auto border border-border-subtle"
              loading="lazy"
            />
          </span>
        );
      },
    }),
    [isAdmin]
  );

  if (!content || !content.trim()) {
    return (
      <div className="py-12 text-center font-mono text-xs text-text-secondary">
        No content available.
      </div>
    );
  }

  return (
    <div className="technical-content-renderer space-y-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
