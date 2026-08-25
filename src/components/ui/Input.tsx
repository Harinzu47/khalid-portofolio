import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-mono text-terminal-text-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-terminal-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'w-full py-2 text-sm font-mono bg-terminal-bg border rounded transition-colors',
              'text-terminal-text-primary placeholder:text-terminal-text-muted',
              'focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-terminal-bg',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon ? 'pl-9' : 'pl-3',
              rightIcon ? 'pr-9' : 'pr-3',
              error
                ? 'border-terminal-accent focus:border-terminal-accent focus:ring-terminal-accent'
                : 'border-terminal-border focus:border-terminal-secondary focus:ring-terminal-secondary',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-terminal-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] font-mono text-terminal-accent">{error}</p>}
        {!error && helperText && (
          <p className="text-[11px] font-mono text-terminal-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
