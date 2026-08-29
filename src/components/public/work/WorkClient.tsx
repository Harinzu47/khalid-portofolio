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
  { label: 'ALL WORK', value: '' },
  { label: 'INFRASTRUCTURE', value: 'infrastructure' },
  { label: 'NETWORKING', value: 'networking' },
  { label: 'WEB ARCHITECTURE', value: 'web' },
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
    <div>
      {/* Controls Bar: Pillar Tabs & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Pillar Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-terminal-border md:border-b-0 pb-3 md:pb-0">
          {PILLARS.map((p) => {
            const isActive =
              (!currentPillar && !p.value) ||
              currentPillar.toLowerCase() === p.value.toLowerCase();
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => updateFilters(p.value, undefined)}
                className={`font-mono text-xs px-3 py-1.5 transition-colors border ${
                  isActive
                    ? 'border-terminal-primary text-terminal-primary bg-terminal-primary/5 font-semibold'
                    : 'border-transparent text-terminal-text-muted hover:text-terminal-text-primary'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <label htmlFor="work-search" className="sr-only">
            Search projects
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-text-muted" />
          <input
            id="work-search"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search systems & tech..."
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

      {/* Projects List */}
      {initialProjects.length === 0 ? (
        <EmptyState
          title="No matching engineering work"
          description={
            currentPillar || currentSearch
              ? 'No projects match your active filter criteria. Try clearing search filters.'
              : 'Public projects are currently being cataloged.'
          }
          action={
            (currentPillar || currentSearch) && (
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
        <div className="divide-y divide-terminal-border/40">
          {initialProjects.map((p, idx) => (
            <WorkCard key={p.slug} project={p} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
