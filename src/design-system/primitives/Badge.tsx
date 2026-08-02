import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'infra' | 'networking' | 'web' | 'ai' | 'neutral' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

const variantStyles = {
  infra: 'border-terminal-accent/40 text-terminal-accent bg-terminal-accent/5',
  networking: 'border-terminal-secondary/40 text-terminal-secondary bg-terminal-secondary/5',
  web: 'border-terminal-primary/40 text-terminal-primary bg-terminal-primary/5',
  ai: 'border-terminal-purple/40 text-terminal-purple bg-terminal-purple/5',
  neutral: 'border-terminal-border text-terminal-text-muted bg-terminal-surface',
  success: 'border-terminal-primary/40 text-terminal-primary bg-terminal-primary/5',
  warning: 'border-yellow-600/40 text-yellow-400 bg-yellow-600/5',
  error: 'border-terminal-accent/40 text-terminal-accent bg-terminal-accent/5',
};

/**
 * Enterprise Badge Primitive
 */
export function Badge({ variant = 'neutral', children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 border rounded font-mono text-xs ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
