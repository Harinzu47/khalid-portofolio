import React from 'react';
import { requireOwnerSession } from '@/lib/auth';
import { SearchService } from '@/services/search.service';
import { SearchConsoleClient } from './SearchConsoleClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Operations & Diagnostics | HZCODE Admin',
  description: 'Manage full-text search projections, trigger idempotent corpus reindexing, and inspect search health.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminSearchPage() {
  const session = await requireOwnerSession();
  const health = await SearchService.getSearchHealth(session.userId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight font-mono">
          Search Operations & Diagnostics
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-mono">
          PostgreSQL Full-Text Search (FTS) + pg_trgm fuzzy matching engine, exact technical tokens, and idempotent projection indexing.
        </p>
      </div>

      <SearchConsoleClient initialHealth={health} />
    </div>
  );
}
