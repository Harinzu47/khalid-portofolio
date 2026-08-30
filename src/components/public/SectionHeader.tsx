import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  category?: string;
  title: string;
  subtitle?: string | null;
  className?: string;
  badge?: string | null;
  action?: ReactNode;
}

export function SectionHeader({
  category,
  title,
  subtitle,
  className,
  badge,
  action,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-10 md:mb-14 border-b border-border-subtle pb-6', className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {category && (
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                {category}
              </span>
              {badge && (
                <span className="font-mono text-[10px] px-2 py-0.5 border border-border-subtle text-text-secondary bg-surface-container">
                  {badge}
                </span>
              )}
            </div>
          )}
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary uppercase leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-base md:text-lg text-text-secondary max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 pt-2 md:pt-0">{action}</div>}
      </div>
    </div>
  );
}
