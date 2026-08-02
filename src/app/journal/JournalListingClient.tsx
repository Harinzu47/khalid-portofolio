'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { JournalPost } from '@/types';
import { ArrowRight } from 'lucide-react';

type Props = { posts: JournalPost[] };

const allTags = ['all', 'infra', 'networking', 'web-dev', 'ai', 'devops', 'php', 'docker', 'mikrotik'];

/**
 * Journal listing client — commit-log table with search + tag filters
 */
export default function JournalListingClient({ posts }: Props) {
  const [query, setQuery]         = useState('');
  const [activeTag, setActiveTag] = useState('all');

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery =
        query === '' ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some((t) => t.includes(query.toLowerCase()));

      const matchesTag =
        activeTag === 'all' || post.tags.includes(activeTag);

      return matchesQuery && matchesTag;
    });
  }, [posts, query, activeTag]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* Header */}
      <p className="font-mono text-terminal-primary text-sm mb-2">
        $ cat journal.log
      </p>
      <h1 className="font-mono text-2xl md:text-3xl text-terminal-text-primary mb-4">
        Journal
      </h1>
      <p className="text-terminal-text-secondary mb-10">
        Personal logs, fixes, ops notes, and learnings — updated as I go.
      </p>

      {/* Search bar */}
      <div className="flex items-center gap-2 border border-terminal-border bg-terminal-surface rounded px-4 py-2.5 mb-6 font-mono text-sm focus-within:border-terminal-primary transition-colors">
        <span className="text-terminal-primary flex-shrink-0">&gt;</span>
        <input
          type="text"
          placeholder="search: type to filter..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-terminal-text-primary placeholder-terminal-text-muted outline-none text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-terminal-text-muted hover:text-terminal-text-secondary transition-colors text-xs"
          >
            [x]
          </button>
        )}
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2 mb-10 font-mono text-xs">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded border transition-colors ${
              activeTag === tag
                ? 'border-terminal-primary text-terminal-primary bg-terminal-primary/10'
                : 'border-terminal-border text-terminal-text-muted hover:border-terminal-text-muted'
            }`}
          >
            {tag === 'all' ? '--all' : `#${tag}`}
          </button>
        ))}
      </div>

      {/* Commit-log table */}
      <div className="border border-terminal-border rounded overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid sm:grid-cols-[10rem_1fr_6rem] gap-4 px-5 py-3 bg-terminal-surface border-b border-terminal-border">
          <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider">date</span>
          <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider">title / tags</span>
          <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider text-right">read</span>
        </div>

        {/* Rows */}
        {filtered.length > 0 ? (
          filtered.map((post, idx) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className={`group flex flex-col sm:grid sm:grid-cols-[10rem_1fr_6rem] gap-2 sm:gap-4 px-5 py-4 border-b border-terminal-border/50 hover:bg-terminal-surface/50 transition-colors ${
                idx === filtered.length - 1 ? 'border-b-0' : ''
              }`}
            >
              {/* Date */}
              <span className="font-mono text-xs text-terminal-text-muted whitespace-nowrap">
                [{post.date}]
              </span>

              {/* Title + tags */}
              <div>
                <p className="font-mono text-sm text-terminal-text-primary group-hover:text-terminal-secondary transition-colors mb-1.5">
                  {post.title}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-1.5 py-0.5 border border-terminal-secondary/30 text-terminal-secondary rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Read time */}
              <span className="font-mono text-xs text-terminal-text-muted text-left sm:text-right">
                {post.readTime}
              </span>
            </Link>
          ))
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="font-mono text-sm text-terminal-text-muted">
              No entries match your filter. <button onClick={() => { setQuery(''); setActiveTag('all'); }} className="text-terminal-secondary hover:underline">[clear]</button>
            </p>
          </div>
        )}
      </div>

      {/* Count */}
      <p className="font-mono text-xs text-terminal-text-muted mt-4">
        {filtered.length} of {posts.length} entries
      </p>

      {/* Arrow hint */}
      <div className="mt-8 flex items-center gap-2 font-mono text-xs text-terminal-text-muted">
        <span>click any entry to read</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}
