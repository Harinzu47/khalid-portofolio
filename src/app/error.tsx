'use client';

import { useEffect } from 'react';

/**
 * Root Error Boundary — catches unhandled client-side rendering errors.
 * Uses the existing terminal design language for consistency.
 *
 * Production: no stack traces, no internal paths, no environment values.
 * Server logs receive the full error via structured logger.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to server-side structured logger would happen via error reporting
    // In production, only the digest is available for correlation
    console.error('[ErrorBoundary]', error.digest || 'unhandled-error');
  }, [error]);

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="border border-terminal-border bg-terminal-surface rounded p-8">
          {/* Window chrome */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-terminal-border">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-600 opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-primary opacity-70" />
            <span className="font-mono text-xs text-terminal-text-muted ml-2">
              error — recovery
            </span>
          </div>

          <div className="font-mono text-sm space-y-2">
            <p>
              <span className="text-terminal-primary">$ </span>
              <span className="text-terminal-text-primary">render page</span>
            </p>
            <p className="text-red-400">
              Error: Something went wrong while loading this page.
            </p>
            {error.digest && (
              <p className="text-terminal-text-muted text-xs">
                error id: {error.digest}
              </p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-terminal-border">
            <p className="text-terminal-text-secondary mb-6">
              An unexpected error occurred. You can try again or navigate back to the home page.
            </p>
            <div className="flex flex-wrap gap-3 font-mono text-sm">
              <button
                onClick={reset}
                className="px-4 py-2 border border-terminal-primary text-terminal-primary hover:bg-terminal-primary/10 rounded transition-colors cursor-pointer"
              >
                $ retry
              </button>
              <a
                href="/"
                className="px-4 py-2 border border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted rounded transition-colors"
              >
                $ cd ~/hzcode
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
