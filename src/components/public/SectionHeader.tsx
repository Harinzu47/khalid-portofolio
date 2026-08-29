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
    <div className={cn('mb-10 md:mb-14', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {category && (
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs uppercase tracking-widest text-terminal-primary">
                {category}
              </span>
              {badge && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 border border-terminal-border text-terminal-text-secondary">
                  {badge}
                </span>
              )}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-terminal-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-base md:text-lg text-terminal-text-secondary max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="hidden sm:block shrink-0">{action}</div>}
      </div>
      <div className="mt-6 w-full h-[1px] bg-terminal-border" />
    </div>
  );
}
