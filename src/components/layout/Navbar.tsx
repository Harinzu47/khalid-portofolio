'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/work', label: 'WORK' },
  { href: '/expertise', label: 'EXPERTISE' },
  { href: '/experience', label: 'EXPERIENCE' },
  { href: '/system', label: 'SYSTEM' },
  { href: '/now', label: 'NOW' },
  { href: '/about', label: 'ABOUT' },
];

/**
 * Determines whether a nav link is active based on current pathname and route families.
 */
function isNavActive(linkHref: string, pathname: string): boolean {
  if (linkHref === '/') return pathname === '/';
  if (pathname === linkHref || pathname.startsWith(`${linkHref}/`)) return true;

  if (linkHref === '/work') {
    if (pathname.startsWith('/projects')) {
      return true;
    }
  }

  if (linkHref === '/system') {
    if (
      pathname.startsWith('/articles') ||
      pathname.startsWith('/notes') ||
      pathname.startsWith('/adrs') ||
      pathname.startsWith('/journal') ||
      pathname.startsWith('/graph') ||
      pathname.startsWith('/roadmap')
    ) {
      return true;
    }
  }

  return false;
}

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Hide public Navbar on admin workspace
  if (pathname.startsWith('/admin') || pathname.startsWith('/os')) {
    return null;
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-200 border-b border-border-subtle',
        isScrolled
          ? 'bg-surface-main/95 backdrop-blur-md'
          : 'bg-surface-main/80 backdrop-blur-sm'
      )}
      aria-label="Main Navigation"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="font-headline text-lg md:text-xl font-bold tracking-tighter text-text-primary hover:opacity-80 transition-opacity"
          aria-label="HZCODE Home"
        >
          HZCODE
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 font-mono text-xs">
          {NAV_LINKS.map((link) => {
            const active = isNavActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'uppercase tracking-wider transition-colors duration-150 pb-1',
                  active
                    ? 'text-text-primary font-bold border-b-2 border-text-primary'
                    : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Connect CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/about"
            className="bg-text-primary text-surface-main px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-accent-technical transition-colors"
          >
            Connect
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-text-primary hover:bg-surface-container-high transition-colors"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-main border-b border-border-subtle px-4 sm:px-6 py-4 space-y-3 font-mono text-xs">
          {NAV_LINKS.map((link) => {
            const active = isNavActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block py-2 px-3 transition-colors',
                  active
                    ? 'bg-surface-container-high text-text-primary font-bold border-l-2 border-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-container'
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-border-subtle">
            <Link
              href="/about"
              className="block w-full text-center bg-text-primary text-surface-main py-2.5 font-mono text-xs uppercase tracking-wider hover:bg-accent-technical transition-colors"
            >
              Connect
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
