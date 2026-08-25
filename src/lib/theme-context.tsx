'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName = 'obsidian' | 'matrix' | 'amber' | 'cyberpunk' | 'nord';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  scanlines: boolean;
  setScanlines: (enabled: boolean) => void;
  toggleScanlines: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'obsidian',
  setTheme: () => {},
  scanlines: false,
  setScanlines: () => {},
  toggleScanlines: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('obsidian');
  const [scanlines, setScanlinesState] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('hzcode_theme') as ThemeName | null;
    const savedScanlines = localStorage.getItem('hzcode_scanlines') === 'true';

    if (savedTheme && ['obsidian', 'matrix', 'amber', 'cyberpunk', 'nord'].includes(savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'obsidian');
    }

    setScanlinesState(savedScanlines);
    if (savedScanlines) {
      document.documentElement.setAttribute('data-scanlines', 'true');
    } else {
      document.documentElement.removeAttribute('data-scanlines');
    }
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('hzcode_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setScanlines = (enabled: boolean) => {
    setScanlinesState(enabled);
    localStorage.setItem('hzcode_scanlines', String(enabled));
    if (enabled) {
      document.documentElement.setAttribute('data-scanlines', 'true');
    } else {
      document.documentElement.removeAttribute('data-scanlines');
    }
  };

  const toggleScanlines = () => {
    setScanlines(!scanlines);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        scanlines,
        setScanlines,
        toggleScanlines,
      }}
    >
      {children}
      {/* Scanline CRT Overlay */}
      {scanlines && <div className="pointer-events-none fixed inset-0 z-50 crt-scanlines" />}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
