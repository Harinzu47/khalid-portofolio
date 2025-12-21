import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * Reusable Button component with multiple variants
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
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variants
        {
          'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 focus:ring-blue-500':
            variant === 'primary',
          'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 focus:ring-purple-500':
            variant === 'secondary',
          'border-2 border-slate-700 hover:border-slate-600 bg-transparent hover:bg-slate-800/50 text-white focus:ring-slate-500':
            variant === 'outline',
          'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white focus:ring-slate-500':
            variant === 'ghost',
        },
        
        // Sizes
        {
          'px-4 py-2 text-sm gap-2': size === 'sm',
          'px-6 py-3 text-base gap-2': size === 'md',
          'px-8 py-4 text-lg gap-3': size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
