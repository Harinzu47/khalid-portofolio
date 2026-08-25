import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  return (
    <div className={cn('flex items-start justify-between space-x-3', className)}>
      {(label || description) && (
        <label htmlFor={switchId} className="cursor-pointer select-none">
          {label && <span className="block text-xs font-mono text-terminal-text-primary">{label}</span>}
          {description && (
            <span className="block text-[11px] font-mono text-terminal-text-muted">{description}</span>
          )}
        </label>
      )}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-terminal-border transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-1 focus:ring-terminal-primary focus:ring-offset-1 focus:ring-offset-terminal-bg',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-terminal-primary' : 'bg-terminal-bg'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-terminal-surface shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5',
            checked ? 'translate-x-4 bg-terminal-bg' : 'translate-x-0.5 bg-terminal-text-secondary'
          )}
        />
      </button>
    </div>
  );
}
