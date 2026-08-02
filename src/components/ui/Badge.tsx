import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'infra' | 'networking' | 'ai';
  children: React.ReactNode;
}

/**
 * Badge component — terminal flat style with category variants
 */
export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variantClasses: Record<string, string> = {
    default:    'border-terminal-border text-terminal-text-secondary',
    primary:    'border-terminal-primary/40 text-terminal-primary',
    secondary:  'border-terminal-secondary/40 text-terminal-secondary',
    success:    'border-terminal-primary/40 text-terminal-primary',
    warning:    'border-yellow-600/40 text-yellow-400',
    infra:      'border-terminal-accent/40 text-terminal-accent',
    networking: 'border-terminal-secondary/40 text-terminal-secondary',
    ai:         'border-terminal-purple/40 text-terminal-purple',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border bg-transparent transition-colors',
        variantClasses[variant] ?? variantClasses.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
