'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  componentName?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Enterprise MDX Component Error Boundary
 * Gracefully handles rendering failures or broken custom MDX component imports.
 */
export class MdxErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[MDX Engine Error] Failed rendering component <${this.props.componentName || 'MDX'}>:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="my-4 p-4 border border-terminal-accent/40 bg-terminal-accent/5 rounded font-mono text-xs text-terminal-accent flex items-start gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-terminal-accent" />
          <div>
            <p className="font-bold">MDX Component Error: &lt;{this.props.componentName || 'Unknown Component'}&gt;</p>
            <p className="text-terminal-text-muted mt-1">{this.state.error?.message || 'Component failed to render.'}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
