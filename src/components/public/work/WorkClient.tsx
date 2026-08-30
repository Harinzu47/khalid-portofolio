'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { WorkCard } from './WorkCard';
import { EmptyState } from '../EmptyState';
import type { WorkIndexItemDTO } from '@/types/dtos/public-read-models.dto';

interface WorkClientProps {
  initialProjects: WorkIndexItemDTO[];
  currentPillar?: string;
  currentSearch?: string;
}

const PILLARS = [
  { label: 'ALL SYSTEMS', value: '' },
  { label: 'INFRASTRUCTURE', value: 'infrastructure' },
  { label: 'NETWORKING', value: 'networking' },
  { label: 'FULLSTACK', value: 'web' },
  { label: 'AI & TOOLING', value: 'ai' },
];

export function WorkClient({
  initialProjects,
  currentPillar = '',
  currentSearch = '',
}: WorkClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch);

  const updateFilters = (pillar?: string, query?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (pillar !== undefined) {
      if (pillar) {
        params.set('pillar', pillar);
      } else {
        params.delete('pillar');
      }
    }

    if (query !== undefined) {
      if (query.trim()) {
        params.set('search', query.trim());
      } else {
        params.delete('search');
      }
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(`/work${queryString ? `?${queryString}` : ''}`);
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
      {/* Controls Bar: Pillar Tabs & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        {/* Pillar Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {PILLARS.map((p) => {
            const isActive =
              (!currentPillar && !p.value) ||
              currentPillar.toLowerCase() === p.value.toLowerCase();
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => updateFilters(p.value, undefined)}
                className={`font-mono text-xs px-3.5 py-1.5 transition-colors border uppercase tracking-wider ${
                  isActive
                    ? 'border-text-primary bg-text-primary text-surface-main font-semibold'
                    : 'border-border-subtle bg-surface-container/50 text-text-secondary hover:text-text-primary hover:border-text-primary'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <label htmlFor="work-search" className="sr-only">
            Search projects
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            id="work-search"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search systems, technologies..."
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

      {/* Projects List */}
      {initialProjects.length === 0 ? (
        <EmptyState
          title="No matching systems found"
          description={
            currentPillar || currentSearch
              ? 'No systems match your active filter criteria. Try clearing search filters.'
              : 'Public engineering systems are currently being synchronized.'
          }
          action={
            (currentPillar || currentSearch) && (
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
        <div className="divide-y divide-border-subtle">
          {initialProjects.map((p, idx) => (
            <WorkCard key={p.slug} project={p} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
