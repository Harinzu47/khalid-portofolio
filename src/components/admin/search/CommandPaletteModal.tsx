'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, ArrowRight, CornerDownLeft, Loader2, Sparkles, Folder, FileText, CheckCircle2 } from 'lucide-react';
import { commandPaletteSearchAction } from '@/actions/search';
import type { CommandPaletteItemDTO } from '@/types/dtos/search.dto';

export interface CommandPaletteModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandPaletteModal({ isOpen: controlledOpen, onClose: controlledClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledClose ? (open: boolean) => !open && controlledClose() : setInternalOpen;

  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CommandPaletteItemDTO[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global CMD+K / CTRL+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadItems('');
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const loadItems = (q: string) => {
    startTransition(async () => {
      const res = await commandPaletteSearchAction({ query: q, limit: 12 });
      if (res.success && res.data) {
        setItems(res.data);
        setSelectedIndex(0);
      }
    });
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    loadItems(val);
  };

  const handleSelect = (item: CommandPaletteItemDTO) => {
    setOpen(false);
    if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        handleSelect(items[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={() => setOpen(false)} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-terminal-surface border border-terminal-border rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-terminal-border bg-terminal-bg">
          <Search className="w-4 h-4 text-terminal-primary shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search entities (e.g. 'Create Article', 'PostgreSQL', 'Project')..."
            className="flex-1 bg-transparent border-none text-sm text-terminal-text-primary placeholder:text-terminal-text-muted focus:outline-none font-mono"
          />
          {isPending ? (
            <Loader2 className="w-4 h-4 text-terminal-text-muted animate-spin shrink-0 ml-2" />
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-terminal-text-muted bg-terminal-surface border border-terminal-border rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-terminal-border/30">
          {items.length === 0 && !isPending ? (
            <div className="p-8 text-center text-xs font-mono text-terminal-text-muted">
              No matching commands or entities found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item, index) => {
                const isSelected = index === selectedIndex;
                const isCommand = item.kind === 'COMMAND';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-colors text-xs font-mono ${
                      isSelected
                        ? 'bg-terminal-primary/15 text-terminal-primary border border-terminal-primary/30'
                        : 'text-terminal-text-primary hover:bg-terminal-surface-alt border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {isCommand ? (
                        <Command className="w-3.5 h-3.5 text-terminal-accent shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-terminal-primary shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-[11px] text-terminal-text-muted truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-3">
                      {item.category && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-terminal-bg border border-terminal-border text-terminal-text-muted uppercase">
                          {item.category}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-terminal-bg border border-terminal-border text-terminal-text-muted font-mono">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && <CornerDownLeft className="w-3 h-3 text-terminal-primary" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-terminal-border bg-terminal-bg/50 flex items-center justify-between text-[11px] font-mono text-terminal-text-muted">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-terminal-primary/80">HZCODE OS Global Search</span>
        </div>
      </div>
    </div>
  );
}
