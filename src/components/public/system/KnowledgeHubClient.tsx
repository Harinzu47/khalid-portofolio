'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, X, BookOpen, Clock, Calendar, Hash, ArrowUpRight } from 'lucide-react';
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
    <div>
      {/* Controls Bar: Type Tabs & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-terminal-border md:border-b-0 pb-3 md:pb-0">
          {TYPE_TABS.map((tab) => {
            const isActive =
              (!currentType && !tab.value) ||
              currentType.toUpperCase() === tab.value.toUpperCase();
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => updateFilters(tab.value, undefined)}
                className={`font-mono text-xs px-3 py-1.5 transition-colors border ${
                  isActive
                    ? 'border-terminal-primary text-terminal-primary bg-terminal-primary/5 font-semibold'
                    : 'border-transparent text-terminal-text-muted hover:text-terminal-text-primary'
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-text-muted" />
          <input
            id="knowledge-search"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search essays, notes, ADRs..."
            className="w-full bg-terminal-surface/60 border border-terminal-border pl-9 pr-8 py-1.5 text-xs text-terminal-text-primary placeholder:text-terminal-text-muted focus:outline-none focus:border-terminal-primary font-mono"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-terminal-text-muted hover:text-terminal-text-primary"
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
                className="font-mono text-xs px-4 py-2 border border-terminal-primary text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
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
                className="group border border-terminal-border bg-terminal-surface/30 p-6 md:p-7 hover:border-terminal-primary/70 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-terminal-text-muted mb-3">
                      <span className="px-2 py-0.5 border border-terminal-border text-terminal-primary bg-terminal-primary/5 uppercase text-[10px]">
                        {item.entityType.replace('_', ' ')}
                      </span>

                      {item.noteNumber && <span>#{String(item.noteNumber).padStart(3, '0')}</span>}
                      {item.adrNumber && <span>ADR-{String(item.adrNumber).padStart(3, '0')}</span>}
                      {item.adrStatus && <span className="uppercase">[{item.adrStatus}]</span>}

                      {formattedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                      )}

                      {item.readingTimeMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.readingTimeMinutes} min read</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-bold text-terminal-text-primary group-hover:text-terminal-primary transition-colors">
                      <Link href={item.href} className="flex items-center gap-2">
                        <span>{item.title}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-terminal-primary shrink-0" />
                      </Link>
                    </h2>

                    {/* Summary */}
                    {item.summary && (
                      <p className="mt-2.5 text-sm md:text-base text-terminal-text-secondary leading-relaxed max-w-3xl line-clamp-2">
                        {item.summary}
                      </p>
                    )}

                    {/* Taxonomies */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
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
                      className="font-mono text-xs text-terminal-primary hover:underline flex items-center gap-1"
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
