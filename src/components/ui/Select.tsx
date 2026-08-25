import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-mono text-terminal-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full py-2 pl-3 pr-9 text-sm font-mono bg-terminal-bg border rounded appearance-none cursor-pointer transition-colors',
              'text-terminal-text-primary',
              'focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-terminal-bg',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-terminal-accent focus:border-terminal-accent focus:ring-terminal-accent'
                : 'border-terminal-border focus:border-terminal-secondary focus:ring-terminal-secondary',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-terminal-surface text-terminal-text-primary"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-terminal-text-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-[11px] font-mono text-terminal-accent">{error}</p>}
        {!error && helperText && (
          <p className="text-[11px] font-mono text-terminal-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
