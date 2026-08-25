import React from 'react';
import { cn } from '@/lib/utils';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  title?: string;
  children: React.ReactNode;
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const iconMap = {
    info: <Info className="w-4 h-4 text-terminal-secondary shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-4 h-4 text-terminal-primary shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-terminal-purple shrink-0 mt-0.5" />,
    destructive: <AlertCircle className="w-4 h-4 text-terminal-accent shrink-0 mt-0.5" />,
  };

  const variantStyles = {
    info: 'bg-terminal-secondary/10 border-terminal-secondary/30 text-terminal-text-primary',
    success: 'bg-terminal-primary/10 border-terminal-primary/30 text-terminal-text-primary',
    warning: 'bg-terminal-purple/10 border-terminal-purple/30 text-terminal-text-primary',
    destructive: 'bg-terminal-accent/10 border-terminal-accent/30 text-terminal-text-primary',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border text-xs font-mono',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {iconMap[variant]}
      <div className="space-y-1 w-full">
        {title && <h5 className="font-bold font-mono text-terminal-text-primary">{title}</h5>}
        <div className="text-terminal-text-secondary leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
