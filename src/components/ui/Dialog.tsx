'use client';

import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}: DialogProps) {
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative w-full border border-terminal-border rounded-lg bg-terminal-surface shadow-2xl z-10 overflow-hidden animate-slide-up',
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between px-4 py-3 bg-terminal-bg border-b border-terminal-border">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-terminal-accent/80" />
            <span className="w-3 h-3 rounded-full bg-terminal-purple/80" />
            <span className="w-3 h-3 rounded-full bg-terminal-primary/80" />
          </div>
          {title && (
            <h2 className="text-xs font-mono font-bold text-terminal-text-primary truncate px-2">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors focus:outline-none focus:ring-1 focus:ring-terminal-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {description && (
          <div className="px-6 pt-4 pb-0 text-xs font-mono text-terminal-text-secondary">
            {description}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
