import React from 'react';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'lead' | 'caption' | 'muted' | 'code';
  children: React.ReactNode;
}

const variantStyles = {
  body: 'font-sans text-sm md:text-base text-terminal-text-secondary leading-relaxed',
  lead: 'font-sans text-base md:text-lg text-terminal-text-primary leading-relaxed',
  caption: 'font-mono text-xs text-terminal-text-muted',
  muted: 'font-sans text-xs text-terminal-text-muted',
  code: 'font-mono text-xs text-terminal-secondary bg-terminal-bg border border-terminal-border px-1.5 py-0.5 rounded',
};

/**
 * Enterprise Typography Text Primitive
 */
export function Text({ variant = 'body', children, className = '', ...props }: TextProps) {
  return (
    <p className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
}
