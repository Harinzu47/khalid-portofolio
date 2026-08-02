import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'outline' | 'ghost';
  interactive?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  surface: 'border border-terminal-border bg-terminal-surface rounded p-6',
  outline: 'border border-terminal-border bg-transparent rounded p-6',
  ghost: 'border border-transparent bg-terminal-surface/40 rounded p-6',
};

/**
 * Enterprise Card Primitive
 */
export function Card({
  variant = 'surface',
  interactive = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const interactiveStyles = interactive
    ? 'hover:border-terminal-text-muted transition-colors duration-200 cursor-pointer'
    : '';

  return (
    <div className={`${variantStyles[variant]} ${interactiveStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
