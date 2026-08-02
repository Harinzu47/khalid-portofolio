import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'border border-terminal-primary text-terminal-primary bg-terminal-primary/10 hover:bg-terminal-primary/20',
  secondary: 'border border-terminal-secondary text-terminal-secondary bg-terminal-secondary/10 hover:bg-terminal-secondary/20',
  outline: 'border border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted hover:text-terminal-text-primary bg-transparent',
  ghost: 'border border-transparent text-terminal-text-muted hover:text-terminal-text-primary bg-transparent',
  danger: 'border border-terminal-accent text-terminal-accent bg-terminal-accent/10 hover:bg-terminal-accent/20',
};

const sizeStyles = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/**
 * Enterprise Button Primitive
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-mono rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terminal-primary/50 disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
