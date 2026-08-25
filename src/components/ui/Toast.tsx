'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (options: { title?: string; message: string; variant?: ToastVariant; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      message,
      variant = 'info',
      duration = 4000,
    }: {
      title?: string;
      message: string;
      variant?: ToastVariant;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, variant }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[1400] flex flex-col space-y-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start justify-between p-3.5 rounded-lg border shadow-xl text-xs font-mono animate-slide-up',
              {
                'bg-terminal-surface border-terminal-primary/40 text-terminal-text-primary':
                  item.variant === 'success',
                'bg-terminal-surface border-terminal-accent/40 text-terminal-text-primary':
                  item.variant === 'error',
                'bg-terminal-surface border-terminal-border text-terminal-text-primary':
                  item.variant === 'info',
              }
            )}
          >
            <div className="flex items-start space-x-2.5">
              {item.variant === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-terminal-primary shrink-0 mt-0.5" />
              )}
              {item.variant === 'error' && (
                <AlertCircle className="w-4 h-4 text-terminal-accent shrink-0 mt-0.5" />
              )}
              {item.variant === 'info' && (
                <Info className="w-4 h-4 text-terminal-secondary shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                {item.title && <h6 className="font-bold text-terminal-text-primary">{item.title}</h6>}
                <p className="text-terminal-text-secondary">{item.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="ml-2 text-terminal-text-muted hover:text-terminal-text-primary p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
