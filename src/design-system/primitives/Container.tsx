import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'narrow' | 'default' | 'wide' | 'full';
  children: React.ReactNode;
}

const sizeStyles = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Enterprise Layout Container Primitive
 */
export function Container({ size = 'default', children, className = '', ...props }: ContainerProps) {
  return (
    <div className={`mx-auto px-6 w-full ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </div>
  );
}
