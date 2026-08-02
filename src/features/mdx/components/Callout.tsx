import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Lightbulb, AlertCircle } from 'lucide-react';
import { CalloutProps, CalloutVariant } from '../types';

const variantConfig: Record<
  CalloutVariant,
  { border: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }
> = {
  info: {
    border: 'border-terminal-secondary/40',
    bg: 'bg-terminal-secondary/5',
    text: 'text-terminal-secondary',
    icon: Info,
  },
  warning: {
    border: 'border-yellow-600/40',
    bg: 'bg-yellow-600/5',
    text: 'text-yellow-400',
    icon: AlertTriangle,
  },
  success: {
    border: 'border-terminal-primary/40',
    bg: 'bg-terminal-primary/5',
    text: 'text-terminal-primary',
    icon: CheckCircle2,
  },
  tip: {
    border: 'border-terminal-purple/40',
    bg: 'bg-terminal-purple/5',
    text: 'text-terminal-purple',
    icon: Lightbulb,
  },
  error: {
    border: 'border-terminal-accent/40',
    bg: 'bg-terminal-accent/5',
    text: 'text-terminal-accent',
    icon: AlertCircle,
  },
};

/**
 * Callout component supporting info, warning, success, tip, and error variants
 */
export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const config = variantConfig[variant] || variantConfig.info;
  const Icon = config.icon;

  return (
    <aside className={`my-6 p-4 border rounded ${config.border} ${config.bg} font-mono text-sm leading-relaxed`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.text}`} />
        <div className="flex-1">
          {title && <p className={`font-bold mb-1 uppercase tracking-wide text-xs ${config.text}`}>// {title}</p>}
          <div className="text-terminal-text-secondary">{children}</div>
        </div>
      </div>
    </aside>
  );
}

export const InfoCallout = (props: Omit<CalloutProps, 'variant'>) => <Callout variant="info" {...props} />;
export const WarningCallout = (props: Omit<CalloutProps, 'variant'>) => <Callout variant="warning" {...props} />;
export const SuccessCallout = (props: Omit<CalloutProps, 'variant'>) => <Callout variant="success" {...props} />;
export const TipCallout = (props: Omit<CalloutProps, 'variant'>) => <Callout variant="tip" {...props} />;
export const AlertCallout = (props: Omit<CalloutProps, 'variant'>) => <Callout variant="error" {...props} />;
