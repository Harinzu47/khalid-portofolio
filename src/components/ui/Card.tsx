import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

/**
 * Base Card component — terminal flat style (no glassmorphism)
 */
export function Card({ children, hover = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-terminal-surface border border-terminal-border rounded p-6',
        'transition-colors duration-200',
        hover && 'hover:border-terminal-text-muted',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
