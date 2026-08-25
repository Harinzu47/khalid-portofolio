import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-mono text-terminal-text-secondary">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full p-3 text-sm font-mono bg-terminal-bg border rounded transition-colors resize-y',
            'text-terminal-text-primary placeholder:text-terminal-text-muted',
            'focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-terminal-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-terminal-accent focus:border-terminal-accent focus:ring-terminal-accent'
              : 'border-terminal-border focus:border-terminal-secondary focus:ring-terminal-secondary',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] font-mono text-terminal-accent">{error}</p>}
        {!error && helperText && (
          <p className="text-[11px] font-mono text-terminal-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
