import React from 'react';

export interface TypographyHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4';
  children: React.ReactNode;
}

const variantStyles = {
  display: 'font-mono text-3xl md:text-5xl font-bold tracking-tight text-terminal-text-primary',
  h1: 'font-mono text-2xl md:text-3xl font-bold text-terminal-text-primary pb-3 border-b border-terminal-border',
  h2: 'font-mono text-xl md:text-2xl font-bold text-terminal-text-primary pb-2 border-b border-terminal-border/40',
  h3: 'font-mono text-lg md:text-xl font-semibold text-terminal-text-primary',
  h4: 'font-mono text-base font-semibold text-terminal-text-secondary',
};

/**
 * Enterprise Typography Heading Primitive
 */
export function Heading({
  as: Component = 'h2',
  variant = 'h2',
  children,
  className = '',
  ...props
}: TypographyHeadingProps) {
  return (
    <Component className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
}
