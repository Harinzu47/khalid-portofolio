'use client';

import React, { useState, useTransition } from 'react';
import {
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { reindexSearchCorpusAction, ownerGlobalSearchAction } from '@/actions/search';
import type { SearchHealthDTO, SearchReindexResultDTO, SearchResultDTO } from '@/types/dtos/search.dto';

export interface SearchConsoleClientProps {
  initialHealth: SearchHealthDTO;
}

export function SearchConsoleClient({ initialHealth }: SearchConsoleClientProps) {
  const [health, setHealth] = useState<SearchHealthDTO>(initialHealth);
  const [reindexResult, setReindexResult] = useState<SearchReindexResultDTO | null>(null);
  const [isReindexing, startReindexing] = useTransition();

  // Interactive Live Search Tester
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<SearchResultDTO | null>(null);
  const [isSearching, startSearching] = useTransition();

  const handleReindex = () => {
    startReindexing(async () => {
      const res = await reindexSearchCorpusAction();
      if (res.success && res.data) {
        setReindexResult(res.data);
        // Refresh local health state
        setHealth((prev) => ({
          ...prev,
          indexedDocuments: res.data!.indexed,
          staleDocuments: 0,
          lastReindexAt: res.data!.completedAt,
        }));
      }
    });
  };

  const handleTestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    startSearching(async () => {
      const res = await ownerGlobalSearchAction({ query: testQuery, limit: 10 });
      if (res.success && res.data) {
        setTestResult(res.data);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Health Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Indexed Documents */}
        <div className="p-4 rounded-lg bg-terminal-surface border border-terminal-border flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-terminal-text-muted uppercase">Indexed Documents</div>
            <div className="text-2xl font-bold font-mono text-terminal-primary mt-1">
              {health.indexedDocuments}
            </div>
          </div>
          <Database className="w-8 h-8 text-terminal-primary/40" />
        </div>

        {/* Stale / Pending Projections */}
        <div className="p-4 rounded-lg bg-terminal-surface border border-terminal-border flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-terminal-text-muted uppercase">Stale Projections</div>
            <div className="text-2xl font-bold font-mono text-terminal-accent mt-1">
              {health.staleDocuments}
            </div>
          </div>
          <AlertTriangle className="w-8 h-8 text-terminal-accent/40" />
        </div>

        {/* Entity Types Breakdown */}
        <div className="p-4 rounded-lg bg-terminal-surface border border-terminal-border flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-terminal-text-muted uppercase">Active Entity Types</div>
            <div className="text-2xl font-bold font-mono text-terminal-text-primary mt-1">
              {Object.keys(health.byTypeBreakdown).length}
            </div>
          </div>
          <Layers className="w-8 h-8 text-terminal-text-muted/40" />
        </div>

        {/* Last Reindexed Timestamp */}
        <div className="p-4 rounded-lg bg-terminal-surface border border-terminal-border flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-terminal-text-muted uppercase">Last Reindex</div>
            <div className="text-xs font-mono text-terminal-text-secondary mt-2 truncate max-w-[140px]">
              {health.lastReindexAt ? new Date(health.lastReindexAt).toLocaleString() : 'Never'}
            </div>
          </div>
          <Clock className="w-8 h-8 text-terminal-text-muted/40" />
        </div>
      </div>

      {/* 2. Operations & Corpus Reindexing Trigger */}
      <div className="p-6 rounded-lg bg-terminal-surface border border-terminal-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-terminal-text-primary flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-terminal-primary" />
              Idempotent Corpus Reindexer
            </h2>
            <p className="text-xs font-mono text-terminal-text-muted mt-1">
              Scans all 16 canonical entity tables, rebuilds tsvector weighted projections, normalizes exact technical tokens, and purges orphaned entries.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReindex}
            disabled={isReindexing}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded bg-terminal-primary text-black font-mono font-semibold text-xs hover:bg-terminal-primary/90 transition-colors disabled:opacity-50"
          >
            {isReindexing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Reindexing Corpus...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Rebuild Search Index</span>
              </>
            )}
          </button>
        </div>

        {/* Reindex Execution Results Banner */}
        {reindexResult && (
          <div className="p-4 rounded bg-terminal-bg border border-terminal-primary/40 space-y-3 animate-fadeIn">
            <div className="flex items-center space-x-2 text-xs font-mono text-terminal-primary font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Corpus Reindexing Completed Successfully</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div>Indexed: <span className="font-bold text-terminal-primary">{reindexResult.indexed}</span></div>
              <div>Orphans Removed: <span className="font-bold text-terminal-accent">{reindexResult.removed}</span></div>
              <div>Failed: <span className="font-bold text-red-400">{reindexResult.failed}</span></div>
              <div>Completed: <span className="text-terminal-text-muted">{new Date(reindexResult.completedAt).toLocaleTimeString()}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Entity Type Breakdown Distribution */}
      <div className="p-6 rounded-lg bg-terminal-surface border border-terminal-border space-y-4">
        <h2 className="text-sm font-bold font-mono text-terminal-text-primary uppercase tracking-wider">
          Indexed Projection Distribution by Entity Type
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(health.byTypeBreakdown).map(([type, count]) => (
            <div key={type} className="p-3 rounded bg-terminal-bg border border-terminal-border text-center">
              <div className="text-[11px] font-mono text-terminal-text-muted truncate">{type}</div>
              <div className="text-lg font-bold font-mono text-terminal-primary mt-1">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Multi-Channel Search Tester */}
      <div className="p-6 rounded-lg bg-terminal-surface border border-terminal-border space-y-4">
        <div>
          <h2 className="text-lg font-bold text-terminal-text-primary flex items-center gap-2">
            <Search className="w-5 h-5 text-terminal-primary" />
            Live Search Pipeline Tester
          </h2>
          <p className="text-xs font-mono text-terminal-text-muted mt-1">
            Test exact token channels (e.g. &quot;C++&quot;, &quot;Next.js&quot;, &quot;PostgreSQL&quot;), prefix matching, and mode-aware ranking live.
          </p>
        </div>

        <form onSubmit={handleTestSearch} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Enter query to test retrieval & ranking (e.g. 'C++', 'RLS', 'Project')..."
            className="flex-1 px-3 py-2 rounded bg-terminal-bg border border-terminal-border text-xs font-mono text-terminal-text-primary focus:outline-none focus:border-terminal-primary"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 rounded bg-terminal-surface-alt border border-terminal-border text-xs font-mono text-terminal-text-primary hover:text-terminal-primary hover:border-terminal-primary transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Search'}
          </button>
        </form>

        {testResult && (
          <div className="space-y-3 mt-4">
            <div className="text-xs font-mono text-terminal-text-muted">
              Found {testResult.items.length} candidate(s) for &quot;{testResult.query}&quot;
            </div>

            <div className="divide-y divide-terminal-border/40 border border-terminal-border rounded overflow-hidden">
              {testResult.items.map((item) => (
                <div key={item.entity.id} className="p-3 bg-terminal-bg space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-terminal-text-primary">{item.entity.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-primary text-[10px]">
                      {item.entity.type}
                    </span>
                  </div>
                  {item.description && (
                    <div className="text-[11px] text-terminal-text-muted font-mono line-clamp-2">
                      {item.description}
                    </div>
                  )}
                  {item.taxonomy && (item.taxonomy.technologies.length > 0 || item.taxonomy.skills.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.taxonomy.technologies.map((t) => (
                        <span key={t} className="px-1 py-0.2 rounded bg-terminal-surface text-[9px] font-mono text-terminal-text-secondary">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
