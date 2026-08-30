'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring if needed
    console.error('Unhandled public application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-surface-main text-text-primary flex items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full">
        <div className="border border-border-subtle bg-surface-container/50 p-8 md:p-12 space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest text-text-secondary">
            [ 500 / SYSTEM EXCEPTION ]
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-text-primary uppercase tracking-tight">
            SYSTEM EXECUTION ERROR
          </h1>

          <p className="font-sans text-sm md:text-base text-text-secondary leading-relaxed">
            An unexpected runtime condition interrupted this operation. The incident context has been recorded.
          </p>

          {error.digest && (
            <div className="font-mono text-[11px] text-text-secondary p-3 border border-border-subtle bg-surface-main">
              DIGEST: {error.digest}
            </div>
          )}

          <div className="pt-4 flex flex-wrap gap-4 font-mono text-xs">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 bg-text-primary text-surface-main uppercase tracking-wider font-semibold hover:bg-accent-technical transition-colors cursor-pointer"
            >
              Retry Operation
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 border border-border-subtle bg-surface-main text-text-primary uppercase tracking-wider font-semibold hover:border-text-primary transition-colors"
            >
              &larr; Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
