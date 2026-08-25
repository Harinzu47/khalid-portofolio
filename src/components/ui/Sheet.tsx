'use client';

import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  className,
}: SheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md h-full bg-terminal-surface border-terminal-border shadow-2xl flex flex-col',
          side === 'left'
            ? 'mr-auto border-r'
            : 'ml-auto border-l',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-terminal-bg border-b border-terminal-border">
          {title ? (
            <h2 className="text-sm font-mono font-bold text-terminal-text-primary">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sheet"
            className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors focus:outline-none focus:ring-1 focus:ring-terminal-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
