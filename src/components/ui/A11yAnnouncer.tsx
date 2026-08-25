'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface A11yAnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const A11yAnnouncerContext = createContext<A11yAnnouncerContextType>({
  announce: () => {},
});

export function A11yAnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage(message);
      setTimeout(() => setAssertiveMessage(''), 1000);
    } else {
      setPoliteMessage(message);
      setTimeout(() => setPoliteMessage(''), 1000);
    }
  }, []);

  return (
    <A11yAnnouncerContext.Provider value={{ announce }}>
      {children}

      {/* Visually Hidden ARIA Live Regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only pointer-events-none"
      >
        {politeMessage}
      </div>

      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only pointer-events-none"
      >
        {assertiveMessage}
      </div>
    </A11yAnnouncerContext.Provider>
  );
}

export function useA11yAnnounce() {
  return useContext(A11yAnnouncerContext);
}
