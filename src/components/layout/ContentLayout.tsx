import Link from 'next/link';
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface RelatedItem {
  title: string;
  href: string;
  type: string;
}

export interface ContentLayoutProps {
  category?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  metadata?: ReactNode;
  tags?: string[];
  relatedItems?: RelatedItem[];
  pagination?: {
    prev?: { title: string; href: string };
    next?: { title: string; href: string };
  };
  children: ReactNode;
  className?: string;
}

export function ContentLayout({
  category,
  title,
  subtitle,
  breadcrumbs,
  metadata,
  tags,
  relatedItems,
  pagination,
  children,
  className,
}: ContentLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-main text-text-primary">
      {/* Breadcrumb bar */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <header className="sticky top-0 z-40 bg-surface-main/95 border-b border-border-subtle py-3">
          <div className="max-w-4xl mx-auto px-6 flex items-center justify-between font-mono text-xs text-text-secondary">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto py-1">
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.label} className="flex items-center gap-1.5 shrink-0">
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-text-secondary opacity-50" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className={cn(
                        'hover:text-text-primary transition-colors',
                        idx === breadcrumbs.length - 1 ? 'text-text-primary font-semibold' : ''
                      )}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-text-primary font-semibold">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </header>
      )}

      <main className={cn('max-w-4xl mx-auto px-6 py-12', className)}>
        {/* Content Header */}
        <header className="mb-10 pb-8 border-b border-border-subtle">
          <div className="flex flex-wrap items-center gap-3 mb-3 font-mono text-xs text-text-secondary">
            {category && (
              <span className="uppercase text-text-primary border border-border-subtle bg-surface-container px-2 py-0.5 font-semibold text-[10px]">
                {category}
              </span>
            )}
            {metadata}
          </div>

          <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-text-primary mb-4 leading-tight uppercase">
            {title}
          </h1>

          {subtitle && (
            <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-6 font-sans">
              {subtitle}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border-subtle">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 border border-border-subtle text-text-secondary bg-surface-container font-mono text-xs uppercase"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Main Body */}
        <article className="prose-editorial max-w-none text-text-primary mb-16">{children}</article>

        {/* Related Items */}
        {relatedItems && relatedItems.length > 0 && (
          <section className="mt-16 pt-8 border-t border-border-subtle">
            <p className="font-mono text-xs text-text-secondary uppercase tracking-widest mb-4">
              // RELATED ARTIFACTS
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedItems.map((rel) => (
                <Link
                  key={rel.href}
                  href={rel.href}
                  className="p-5 border border-border-subtle bg-surface-container/30 hover:border-text-primary transition-colors group flex flex-col justify-between space-y-2"
                >
                  <span className="text-[10px] font-mono text-text-secondary uppercase block">
                    [{rel.type}]
                  </span>
                  <p className="font-headline text-text-primary group-hover:underline transition-colors font-bold text-sm line-clamp-2">
                    {rel.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Next/Prev Pagination */}
        {pagination && (pagination.prev || pagination.next) && (
          <nav
            aria-label="Pagination"
            className="mt-12 pt-8 border-t border-border-subtle grid grid-cols-2 gap-4 font-mono text-xs"
          >
            {pagination.prev ? (
              <Link
                href={pagination.prev.href}
                className="p-4 border border-border-subtle bg-surface-container/30 hover:border-text-primary transition-colors group"
              >
                <span className="text-text-secondary mb-1 block uppercase text-[10px]">&larr; PREVIOUS</span>
                <span className="text-text-primary font-bold truncate block">
                  {pagination.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {pagination.next && (
              <Link
                href={pagination.next.href}
                className="p-4 border border-border-subtle bg-surface-container/30 hover:border-text-primary transition-colors group text-right"
              >
                <span className="text-text-secondary mb-1 block uppercase text-[10px]">NEXT &rarr;</span>
                <span className="text-text-primary font-bold truncate block">
                  {pagination.next.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
