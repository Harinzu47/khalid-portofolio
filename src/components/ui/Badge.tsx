import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  children: React.ReactNode;
}

/**
 * Badge component for technology tags and labels
 */
export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors',
        {
          'bg-slate-800/50 border border-slate-700 text-slate-300':
            variant === 'default',
          'bg-blue-500/10 text-blue-400 border border-blue-500/20':
            variant === 'primary',
          'bg-purple-500/10 text-purple-400 border border-purple-500/20':
            variant === 'secondary',
          'bg-green-500/10 text-green-400 border border-green-500/20':
            variant === 'success',
          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20':
            variant === 'warning',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
