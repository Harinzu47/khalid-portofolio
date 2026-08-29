'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import { Menu, LogOut, ExternalLink, ChevronRight, User, Loader2 } from 'lucide-react';

export interface AdminHeaderProps {
  userEmail: string;
  onOpenMobileNav: () => void;
}

export function AdminHeader({ userEmail, onOpenMobileNav }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();

  // Generate breadcrumb segments
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => {
      const href = '/' + arr.slice(0, index + 1).join('/');
      const label = segment === 'admin' ? 'Dashboard' : segment.charAt(0).toUpperCase() + segment.slice(1);
      return { href, label };
    });

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAction();
    });
  };

  return (
    <header className="h-14 bg-terminal-surface border-b border-terminal-border px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation drawer"
          className="md:hidden p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center space-x-1.5 text-xs font-mono">
          <span className="text-terminal-text-muted">admin</span>
          {segments.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="w-3.5 h-3.5 text-terminal-text-muted" />
              {idx === segments.length - 1 ? (
                <span className="font-semibold text-terminal-primary">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-terminal-text-secondary hover:text-terminal-text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Public View Link, Search & User Session Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
          }}
          className="hidden sm:inline-flex items-center space-x-2 px-2.5 py-1 rounded border border-terminal-border bg-terminal-bg text-[11px] font-mono text-terminal-text-muted hover:text-terminal-text-primary hover:border-terminal-text-secondary transition-colors"
        >
          <span>Search</span>
          <kbd className="px-1 py-0.2 rounded bg-terminal-surface border border-terminal-border text-[9px]">⌘K</kbd>
        </button>

        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-terminal-border bg-terminal-bg text-[11px] font-mono text-terminal-text-muted hover:text-terminal-text-primary hover:border-terminal-text-secondary transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Operator Badge */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-terminal-bg border border-terminal-border text-xs font-mono text-terminal-text-primary">
          <User className="w-3.5 h-3.5 text-terminal-primary" />
          <span className="max-w-[130px] sm:max-w-[200px] truncate">{userEmail}</span>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign Out"
          className="p-1.5 rounded border border-terminal-border bg-terminal-bg text-terminal-text-muted hover:text-terminal-accent hover:border-terminal-accent transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
