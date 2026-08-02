import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { BreadcrumbItem, PrevNextNavigation } from '@/features/routing/types';
import { ContentNode } from '@/features/knowledge/types';

export interface ContentLayoutProps {
  node: ContentNode;
  breadcrumbs: BreadcrumbItem[];
  prevNext: PrevNextNavigation;
  relatedNodes?: ContentNode[];
  skills?: { id: string; name: string }[];
  technologies?: { id: string; name: string }[];
  children: React.ReactNode;
}

/**
 * Enterprise Content Layout Shell
 * Standardized detail page layout with breadcrumbs, metadata, related content, and prev/next navigation
 */
export function ContentLayout({
  node,
  breadcrumbs,
  prevNext,
  relatedNodes = [],
  skills = [],
  technologies = [],
  children,
}: ContentLayoutProps) {
  const parentHref = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].href : '/';

  return (
    <div className="min-h-screen bg-terminal-bg">
      {/* Breadcrumbs Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-terminal-bg/95 border-b border-terminal-border py-3">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between font-mono text-xs text-terminal-text-muted">
          <Link
            href={parentHref}
            className="inline-flex items-center gap-1.5 hover:text-terminal-secondary transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>back</span>
          </Link>

          {/* Breadcrumbs Trail */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-terminal-text-muted opacity-50" />}
                <Link
                  href={crumb.href}
                  className={`hover:text-terminal-secondary transition-colors truncate max-w-[150px] ${
                    idx === breadcrumbs.length - 1 ? 'text-terminal-text-primary font-semibold' : ''
                  }`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <header className="mb-10 pb-8 border-b border-terminal-border">
          <div className="flex flex-wrap items-center gap-3 mb-3 font-mono text-xs text-terminal-text-muted">
            <span className="uppercase text-terminal-primary border border-terminal-primary/30 px-2 py-0.5 rounded">
              [{node.type}]
            </span>
            {node.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {node.publishedAt}
              </span>
            )}
            {node.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {node.readingTime}
              </span>
            )}
          </div>

          <h1 className="font-mono text-2xl md:text-4xl text-terminal-text-primary mb-4 leading-tight">
            {node.title}
          </h1>

          {node.description && (
            <p className="text-terminal-text-secondary text-base md:text-lg leading-relaxed mb-6">
              {node.description}
            </p>
          )}

          {/* Skills & Technologies Chips */}
          {(technologies.length > 0 || skills.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-2 font-mono text-xs">
              {technologies.map((tech) => (
                <span
                  key={tech.id}
                  className="px-2 py-0.5 border border-terminal-secondary/40 text-terminal-secondary bg-terminal-secondary/5 rounded"
                >
                  #{tech.name}
                </span>
              ))}
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-2 py-0.5 border border-terminal-border text-terminal-text-secondary bg-terminal-surface rounded"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content Body */}
        <article className="prose-terminal">{children}</article>

        {/* Related Content Nodes */}
        {relatedNodes.length > 0 && (
          <section className="mt-16 pt-8 border-t border-terminal-border">
            <p className="font-mono text-xs text-terminal-primary uppercase tracking-widest mb-4">
              // related knowledge nodes
            </p>
            <div className="grid sm:grid-cols-3 gap-4 font-mono text-xs">
              {relatedNodes.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${rel.type === 'article' ? 'articles' : rel.type === 'journal' ? 'journal' : rel.type === 'project' ? 'projects' : rel.type === 'note' ? 'notes' : rel.type}/${rel.slug}`}
                  className="p-4 border border-terminal-border bg-terminal-surface rounded hover:border-terminal-text-muted transition-colors group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] text-terminal-text-muted uppercase mb-1 block">[{rel.type}]</span>
                    <p className="text-terminal-text-primary group-hover:text-terminal-secondary transition-colors font-semibold line-clamp-2">
                      {rel.title}
                    </p>
                  </div>
                  <span className="text-terminal-secondary text-[10px] mt-3 block">&gt; view node</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Prev / Next Navigation */}
        {(prevNext.prev || prevNext.next) && (
          <nav aria-label="Pagination" className="mt-12 pt-8 border-t border-terminal-border grid grid-cols-2 gap-4 font-mono text-xs">
            {prevNext.prev ? (
              <Link
                href={prevNext.prev.path}
                className="p-4 border border-terminal-border bg-terminal-surface rounded hover:border-terminal-text-muted transition-colors group"
              >
                <span className="text-terminal-text-muted mb-1 block">&lt; previous</span>
                <span className="text-terminal-text-primary group-hover:text-terminal-secondary transition-colors font-semibold truncate block">
                  {prevNext.prev.title}
                </span>
              </Link>
            ) : <div />}

            {prevNext.next ? (
              <Link
                href={prevNext.next.path}
                className="p-4 border border-terminal-border bg-terminal-surface rounded hover:border-terminal-text-muted transition-colors group text-right"
              >
                <span className="text-terminal-text-muted mb-1 block">next &gt;</span>
                <span className="text-terminal-text-primary group-hover:text-terminal-secondary transition-colors font-semibold truncate block">
                  {prevNext.next.title}
                </span>
              </Link>
            ) : <div />}
          </nav>
        )}
      </main>
    </div>
  );
}
