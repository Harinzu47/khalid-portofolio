'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Calendar, ArrowUpRight } from 'lucide-react';
import { TaxonomyChip } from '../TaxonomyChip';
import { EmptyState } from '../EmptyState';
import type { KnowledgeHubItemDTO } from '@/types/dtos/public-read-models.dto';

interface KnowledgeHubClientProps {
  initialItems: KnowledgeHubItemDTO[];
  currentType?: string;
  currentSearch?: string;
}

const TYPE_TABS = [
  { label: 'ALL KNOWLEDGE', value: '' },
  { label: 'ARTICLES', value: 'ARTICLE' },
  { label: 'TECH NOTES', value: 'TECH_NOTE' },
  { label: 'ADRS', value: 'ADR' },
  { label: 'DEV JOURNAL', value: 'JOURNAL_ENTRY' },
];

export function KnowledgeHubClient({
  initialItems,
  currentType = '',
  currentSearch = '',
}: KnowledgeHubClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch);

  const updateFilters = (type?: string, query?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (type !== undefined) {
      if (type) {
        params.set('type', type);
      } else {
        params.delete('type');
      }
    }

    if (query !== undefined) {
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(`/system${queryString ? `?${queryString}` : ''}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(undefined, searchValue);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    updateFilters(undefined, '');
  };

  return (
    <div className="space-y-8">
      {/* Controls Bar: Type Tabs & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_TABS.map((tab) => {
            const isActive =
              (!currentType && !tab.value) ||
              currentType.toUpperCase() === tab.value.toUpperCase();
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => updateFilters(tab.value, undefined)}
                className={`font-mono text-xs px-3.5 py-1.5 transition-colors border uppercase tracking-wider ${
                  isActive
                    ? 'border-text-primary bg-text-primary text-surface-main font-semibold'
                    : 'border-border-subtle bg-surface-container/50 text-text-secondary hover:text-text-primary hover:border-text-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <label htmlFor="knowledge-search" className="sr-only">
            Search knowledge
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            id="knowledge-search"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search essays, notes, ADRs..."
            className="w-full bg-surface-container border border-border-subtle pl-9 pr-8 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-text-primary font-mono"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Knowledge Items Grid / Feed */}
      {initialItems.length === 0 ? (
        <EmptyState
          title="No knowledge records found"
          description={
            currentType || currentSearch
              ? 'No knowledge artifacts match your active filter criteria. Try clearing search filters.'
              : 'Knowledge entries are currently being synchronized.'
          }
          action={
            (currentType || currentSearch) && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue('');
                  updateFilters('', '');
                }}
                className="font-mono text-xs px-5 py-2.5 bg-text-primary text-surface-main uppercase tracking-wider font-semibold hover:bg-accent-technical transition-colors"
              >
                CLEAR ALL FILTERS
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {initialItems.map((item) => {
            const formattedDate = item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : null;

            return (
              <article
                key={`${item.entityType}-${item.slug}`}
                className="group border border-border-subtle bg-surface-container/30 p-6 md:p-8 hover:border-text-primary transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary">
                      <span className="px-2 py-0.5 border border-border-subtle bg-surface-container-high text-text-primary font-semibold uppercase text-[10px]">
                        {item.entityType.replace('_', ' ')}
                      </span>

                      {item.noteNumber && <span className="font-semibold text-text-primary">#{String(item.noteNumber).padStart(3, '0')}</span>}
                      {item.adrNumber && <span className="font-semibold text-text-primary">ADR-{String(item.adrNumber).padStart(3, '0')}</span>}
                      {item.adrStatus && <span className="uppercase font-medium">[{item.adrStatus}]</span>}

                      {formattedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                          <span>{formattedDate}</span>
                        </span>
                      )}

                      {item.readingTimeMinutes && (
                        <span>{item.readingTimeMinutes} min read</span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-text-primary group-hover:underline transition-all">
                      <Link href={item.href} className="inline-flex items-center gap-2">
                        <span>{item.title}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-text-primary shrink-0" />
                      </Link>
                    </h2>

                    {/* Summary */}
                    {item.summary && (
                      <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl line-clamp-2">
                        {item.summary}
                      </p>
                    )}

                    {/* Taxonomies */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {item.domains.map((d) => (
                        <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
                      ))}
                      {item.technologies.map((t) => (
                        <TaxonomyChip key={t.slug} label={t.name} variant="tech" />
                      ))}
                      {item.tags.map((t) => (
                        <TaxonomyChip key={t.slug} label={t.name} variant="tag" />
                      ))}
                    </div>
                  </div>

                  {/* Read Link */}
                  <div className="shrink-0 pt-1">
                    <Link
                      href={item.href}
                      className="font-mono text-xs text-text-primary font-semibold hover:underline uppercase tracking-wider bg-surface-container px-3.5 py-2 border border-border-subtle hover:border-text-primary transition-colors inline-block"
                    >
                      <span>READ ARTIFACT &rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
