import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded bg-terminal-surface-alt/70 border border-terminal-border/40', className)}
      {...props}
    />
  );
}
