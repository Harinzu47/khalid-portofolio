import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PublicContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function PublicContainer({
  children,
  className,
  size = 'lg',
}: PublicContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-[1440px]',
    full: 'max-w-[1600px]',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
