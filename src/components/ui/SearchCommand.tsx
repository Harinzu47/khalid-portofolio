'use client';

import React, { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { Dialog } from './Dialog';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  url: string;
  description?: string;
}

export interface SearchCommandProps {
  items?: CommandItem[];
  onSelect?: (item: CommandItem) => void;
}

export function SearchCommand({ items = [], onSelect }: SearchCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded border border-terminal-border bg-terminal-surface text-terminal-text-muted hover:text-terminal-text-primary hover:border-terminal-text-secondary text-xs font-mono transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search knowledge base...</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-terminal-border bg-terminal-bg text-[10px] text-terminal-text-muted font-mono">
          <Command className="w-2.5 h-2.5 mr-0.5" />K
        </kbd>
      </button>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="lg">
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-terminal-text-muted absolute left-3 top-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search projects, journals, articles..."
              className="w-full pl-9 pr-4 py-2.5 bg-terminal-bg border border-terminal-border rounded text-sm font-mono text-terminal-text-primary placeholder:text-terminal-text-muted focus:outline-none focus:border-terminal-secondary focus:ring-1 focus:ring-terminal-secondary"
            />
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-terminal-border">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-terminal-text-muted">
                {query ? `No results found for "${query}"` : 'Type a command or keyword to search...'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect?.(item);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-terminal-surface-alt/70 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-terminal-text-primary group-hover:text-terminal-secondary">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-[11px] font-mono text-terminal-text-muted line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-terminal-border bg-terminal-bg text-terminal-text-muted">
                    {item.category}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
