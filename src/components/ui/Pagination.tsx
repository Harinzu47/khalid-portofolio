'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between font-mono text-xs text-terminal-text-muted py-3', className)}>
      <div>
        <span>
          Page <strong className="text-terminal-text-primary">{currentPage}</strong> of{' '}
          <strong className="text-terminal-text-primary">{totalPages}</strong>
        </span>
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
          className="flex items-center px-2.5 py-1.5 rounded border border-terminal-border bg-terminal-surface text-terminal-text-secondary hover:text-terminal-text-primary hover:border-terminal-text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          <span>Prev</span>
        </button>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
          className="flex items-center px-2.5 py-1.5 rounded border border-terminal-border bg-terminal-surface text-terminal-text-secondary hover:text-terminal-text-primary hover:border-terminal-text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
}
