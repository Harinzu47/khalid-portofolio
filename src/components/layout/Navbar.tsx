'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

const NAV_LINKS = [
  { href: '/work', label: 'WORK' },
  { href: '/expertise', label: 'EXPERTISE' },
  { href: '/experience', label: 'EXPERIENCE' },
  { href: '/system', label: 'SYSTEM' },
  { href: '/now', label: 'NOW' },
  { href: '/about', label: 'ABOUT' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://github.com/Harinzu47',
    label: 'GitHub',
    icon: Github,
  },
  {
    href: 'https://www.linkedin.com/in/khalid-jundullah-8086b8249',
    label: 'LinkedIn',
    icon: Linkedin,
  },
  {
    href: 'mailto:harinzu47@gmail.com',
    label: 'Email',
    icon: Mail,
  },
];

/**
 * Determines whether a nav link is active based on current pathname.
 * E.g. /articles/[slug], /notes/[slug], /adrs/[slug], /journal/[slug] activate /system.
 */
function isNavActive(linkHref: string, pathname: string): boolean {
  if (linkHref === '/') return pathname === '/';
  if (pathname === linkHref || pathname.startsWith(`${linkHref}/`)) return true;

  if (linkHref === '/system') {
    if (
      pathname.startsWith('/articles') ||
      pathname.startsWith('/notes') ||
      pathname.startsWith('/adrs') ||
      pathname.startsWith('/journal')
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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

  // Hide public Navbar on admin and OS workspace
  if (pathname.startsWith('/admin') || pathname.startsWith('/os')) {
    return null;
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
        isScrolled
          ? 'bg-terminal-bg/95 border-b border-terminal-border backdrop-blur-sm'
          : 'bg-terminal-bg/85'
      )}
      aria-label="Main Navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="font-mono text-base md:text-lg font-bold tracking-tight text-terminal-text-primary hover:text-terminal-primary transition-colors flex items-center gap-1.5"
            aria-label="HZCODE Home"
          >
            <span className="text-terminal-primary">~/</span>
            <span>HZCODE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 font-mono text-xs">
            {NAV_LINKS.map((link) => {
              const active = isNavActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors py-1 px-1.5 border-b-2 font-medium tracking-wider',
                    active
                      ? 'text-terminal-primary border-terminal-primary'
                      : 'text-terminal-text-secondary border-transparent hover:text-terminal-text-primary'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="p-1.5 text-terminal-text-muted hover:text-terminal-primary transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
            <ThemeSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeSwitcher />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-terminal-text-secondary hover:text-terminal-text-primary border border-terminal-border"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-terminal-border space-y-1 font-mono text-xs pb-3">
            {NAV_LINKS.map((link) => {
              const active = isNavActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-3 py-2 border-l-2 transition-colors',
                    active
                      ? 'border-terminal-primary text-terminal-primary bg-terminal-primary/5 font-semibold'
                      : 'border-transparent text-terminal-text-secondary hover:text-terminal-text-primary'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 flex items-center gap-3 px-3">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-terminal-text-muted hover:text-terminal-primary"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
