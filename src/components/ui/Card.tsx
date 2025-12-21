import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

/**
 * Base Card component with glassmorphism effect
 */
export function Card({ children, hover = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6',
        'transition-all duration-300',
        hover && 'hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
