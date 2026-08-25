'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { globalSearchAction } from '@/actions/search';
import type { SearchResultItem } from '@/services/search.service';
import {
  Search,
  FolderGit2,
  FileText,
  BookOpen,
  StickyNote,
  Cpu,
  Target,
  Loader2,
  X,
  CornerDownLeft,
} from 'lucide-react';

export function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, startSearch] = useTransition();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Ctrl+K, Cmd+K, or pressing '/' when not in input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      startSearch(async () => {
        const matches = await globalSearchAction(query);
        setResults(matches);
        setSelectedIndex(0);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard list navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  const getCategoryIcon = (category: SearchResultItem['category']) => {
    switch (category) {
      case 'projects':
        return <FolderGit2 className="w-4 h-4 text-terminal-secondary" />;
      case 'articles':
        return <FileText className="w-4 h-4 text-terminal-primary" />;
      case 'journal':
        return <BookOpen className="w-4 h-4 text-terminal-purple" />;
      case 'notes':
        return <StickyNote className="w-4 h-4 text-terminal-accent" />;
      case 'skills':
        return <Cpu className="w-4 h-4 text-terminal-secondary" />;
      case 'roadmap':
        return <Target className="w-4 h-4 text-terminal-warning" />;
      default:
        return <Search className="w-4 h-4 text-terminal-text-muted" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

      {/* Palette Container */}
      <div className="relative z-10 w-full max-w-2xl rounded-lg border border-terminal-border bg-terminal-surface shadow-2xl overflow-hidden font-mono">
        {/* Search Header Bar */}
        <div className="flex items-center px-4 py-3 border-b border-terminal-border bg-terminal-bg">
          <Search className="w-4 h-4 text-terminal-primary mr-3" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls="palette-results-list"
            aria-activedescendant={
              results[selectedIndex]
                ? `palette-opt-${results[selectedIndex].category}-${results[selectedIndex].id}`
                : undefined
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search projects, articles, journal, notes, skills... (ESC to close)"
            className="flex-1 bg-transparent text-sm text-terminal-text-primary focus:outline-none placeholder-terminal-text-muted"
          />
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-terminal-primary" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear query"
              className="text-terminal-text-muted hover:text-terminal-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div
          id="palette-results-list"
          role="listbox"
          aria-label="Search results"
          className="max-h-96 overflow-y-auto p-2 space-y-1"
        >
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-terminal-text-muted space-y-2">
              <p>Type keywords to search across all portfolio artifacts.</p>
              <div className="flex justify-center gap-2 text-[11px] pt-1">
                <span className="px-2 py-0.5 rounded bg-terminal-bg border border-terminal-border">
                  ↑↓ Navigate
                </span>
                <span className="px-2 py-0.5 rounded bg-terminal-bg border border-terminal-border">
                  ↵ Select
                </span>
                <span className="px-2 py-0.5 rounded bg-terminal-bg border border-terminal-border">
                  ESC Close
                </span>
              </div>
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className="p-8 text-center text-xs text-terminal-text-muted">
              No results found matching "{query}".
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              const optionId = `palette-opt-${item.category}-${item.id}`;
              return (
                <div
                  key={`${item.category}-${item.id}`}
                  id={optionId}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3.5 py-2.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-terminal-primary/15 border border-terminal-primary/40'
                      : 'border border-transparent hover:bg-terminal-bg'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-1 rounded bg-terminal-bg border border-terminal-border">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-terminal-text-primary truncate">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-terminal-text-muted truncate max-w-md">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-bg border border-terminal-border text-terminal-text-muted uppercase">
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-terminal-primary" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 border-t border-terminal-border bg-terminal-bg flex items-center justify-between text-[11px] text-terminal-text-muted">
          <span>Personal Developer OS Search</span>
          <span className="flex items-center space-x-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-[10px]">
              Ctrl+K
            </kbd>
            <span>anywhere</span>
          </span>
        </div>
      </div>
    </div>
  );
}
