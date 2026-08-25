'use client';

import React from 'react';

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] px-4 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-bold shadow-2xl border border-terminal-bg focus:outline-none focus:ring-2 focus:ring-terminal-primary focus:ring-offset-2 focus:ring-offset-terminal-bg transition-all"
    >
      Skip to main content [↵]
    </a>
  );
}
