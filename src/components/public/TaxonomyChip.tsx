import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TaxonomyChipProps {
  label: string;
  variant?: 'tech' | 'domain' | 'skill' | 'tag';
  color?: string | null;
  className?: string;
  count?: number;
}

export function TaxonomyChip({
  label,
  variant = 'tag',
  color,
  className,
  count,
}: TaxonomyChipProps) {
  const variantStyles = {
    tech: 'border-terminal-border text-terminal-secondary hover:border-terminal-secondary/50',
    domain: 'border-terminal-border text-terminal-accent hover:border-terminal-accent/50',
    skill: 'border-terminal-border text-terminal-text-primary hover:border-terminal-primary/50',
    tag: 'border-terminal-border text-terminal-text-secondary hover:text-terminal-text-primary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 border bg-terminal-surface/40 transition-colors',
        variantStyles[variant],
        className
      )}
      style={color ? { borderColor: `${color}40`, color } : undefined}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="text-[10px] text-terminal-text-muted">({count})</span>
      )}
    </span>
  );
}
