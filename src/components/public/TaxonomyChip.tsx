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
    tech: 'border-border-subtle bg-surface-container text-text-primary',
    domain: 'border-border-subtle bg-surface-container text-text-primary font-semibold',
    skill: 'border-border-subtle bg-surface-container-high text-text-primary',
    tag: 'border-border-subtle bg-surface-container text-text-secondary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-xs uppercase px-2.5 py-0.5 border transition-colors hover:border-text-primary',
        variantStyles[variant],
        className
      )}
      style={color ? { borderLeftColor: color, borderLeftWidth: '2px' } : undefined}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="text-[10px] text-text-secondary">({count})</span>
      )}
    </span>
  );
}
