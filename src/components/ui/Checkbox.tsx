import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start space-x-2.5">
        <div className="relative flex items-center mt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded appearance-none border border-terminal-border bg-terminal-bg',
              'checked:bg-terminal-primary checked:border-terminal-primary',
              'focus:outline-none focus:ring-1 focus:ring-terminal-primary focus:ring-offset-1 focus:ring-offset-terminal-bg',
              'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors',
              className
            )}
            {...props}
          />
          <Check className="w-3 h-3 text-terminal-bg absolute pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 transition-opacity" />
        </div>
        {(label || description) && (
          <label htmlFor={checkboxId} className="cursor-pointer select-none">
            {label && <span className="block text-xs font-mono text-terminal-text-primary">{label}</span>}
            {description && (
              <span className="block text-[11px] font-mono text-terminal-text-muted">{description}</span>
            )}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
