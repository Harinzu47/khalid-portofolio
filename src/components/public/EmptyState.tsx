import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no public records matching your current filter criteria.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border border-border-subtle p-8 md:p-12 text-center bg-surface-container/40',
        className
      )}
    >
      <div className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-2">
        [ 0 RECORDS FOUND ]
      </div>
      <h3 className="font-headline text-lg md:text-xl font-bold text-text-primary mb-2 uppercase">
        {title}
      </h3>
      <p className="text-sm text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
