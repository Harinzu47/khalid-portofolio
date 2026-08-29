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
        'border border-dashed border-terminal-border p-8 md:p-12 text-center bg-terminal-surface/20',
        className
      )}
    >
      <div className="font-mono text-xs text-terminal-primary mb-2">[ STATUS: 0_ENTRIES ]</div>
      <h3 className="text-lg font-semibold text-terminal-text-primary mb-2">{title}</h3>
      <p className="text-sm text-terminal-text-secondary max-w-md mx-auto mb-6">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
