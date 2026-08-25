'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeName } from '@/lib/theme-context';
import { Palette, Tv, Check } from 'lucide-react';

const THEMES: { id: ThemeName; name: string; bg: string; primary: string }[] = [
  { id: 'obsidian', name: 'Obsidian Dark', bg: '#0d1117', primary: '#7ee787' },
  { id: 'matrix', name: 'Matrix Green', bg: '#000000', primary: '#00ff66' },
  { id: 'amber', name: 'Amber CRT', bg: '#0c0800', primary: '#ffb000' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: '#0a0e17', primary: '#00f0ff' },
  { id: 'nord', name: 'Nord Frost', bg: '#242933', primary: '#88c0d0' },
];

export function ThemeSwitcher() {
  const { theme, setTheme, scanlines, toggleScanlines } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded border border-terminal-border bg-terminal-surface text-terminal-text-muted hover:text-terminal-text-primary hover:border-terminal-primary transition-colors flex items-center space-x-1"
        title="Change Terminal Theme"
      >
        <Palette className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-terminal-border bg-terminal-surface shadow-2xl p-3 z-50 font-mono text-xs space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="text-[10px] font-bold uppercase text-terminal-text-muted pb-1 border-b border-terminal-border flex items-center justify-between">
            <span>Terminal Palette</span>
          </div>

          {/* Theme List */}
          <div className="space-y-1">
            {THEMES.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors text-left ${
                    isSelected
                      ? 'bg-terminal-primary/10 text-terminal-primary font-bold border border-terminal-primary/30'
                      : 'text-terminal-text-secondary hover:bg-terminal-bg hover:text-terminal-text-primary border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: t.primary }}
                    />
                    <span>{t.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-terminal-primary" />}
                </button>
              );
            })}
          </div>

          {/* CRT Scanline Toggle */}
          <div className="pt-2 border-t border-terminal-border flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-terminal-text-secondary text-[11px]">
              <Tv className="w-3.5 h-3.5" />
              <span>CRT Scanlines</span>
            </span>
            <button
              type="button"
              onClick={toggleScanlines}
              className={`w-8 h-4 rounded-full transition-colors relative ${
                scanlines ? 'bg-terminal-primary' : 'bg-terminal-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-terminal-bg transition-transform ${
                  scanlines ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
