'use client';

import React, { useState, useEffect } from 'react';
import { InteractiveTerminalCLI } from './InteractiveTerminalCLI';

export function GlobalTerminalModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle terminal on backtick (`) when not typing inside input/textarea, or on Ctrl+`
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);

      if (e.key === '`' && !isInput) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop Dismiss */}
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

      {/* Terminal CLI Modal */}
      <div className="relative z-10 w-full max-w-4xl">
        <InteractiveTerminalCLI isModal onClose={() => setIsOpen(false)} />
      </div>
    </div>
  );
}
