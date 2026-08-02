import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * Reusable Button component — terminal flat style
 * primary  = terminal green border/text
 * secondary = soft blue border/text
 * outline  = neutral border
 * ghost    = no border
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-mono rounded transition-colors duration-150',
        'focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-terminal-bg',
        'disabled:opacity-40 disabled:cursor-not-allowed',

        // Variants
        {
          // primary — green (terminal green)
          'border border-terminal-primary text-terminal-primary hover:bg-terminal-primary/10 focus:ring-terminal-primary':
            variant === 'primary',
          // secondary — soft blue
          'border border-terminal-secondary text-terminal-secondary hover:bg-terminal-secondary/10 focus:ring-terminal-secondary':
            variant === 'secondary',
          // outline — neutral
          'border border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted hover:text-terminal-text-primary focus:ring-terminal-border':
            variant === 'outline',
          // ghost — no border
          'border-0 text-terminal-text-secondary hover:text-terminal-text-primary focus:ring-terminal-border':
            variant === 'ghost',
        },

        // Sizes
        {
          'px-3 py-1.5 text-xs gap-1.5': size === 'sm',
          'px-5 py-2.5 text-sm gap-2':   size === 'md',
          'px-6 py-3 text-base gap-2.5': size === 'lg',
        },

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
