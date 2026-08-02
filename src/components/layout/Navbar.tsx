'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/projects', label: 'projects' },
  { href: '/journal',  label: 'journal' },
  { href: '/#about',   label: 'about' },
  { href: '/#contact', label: 'contact' },
];

const socialLinks = [
  {
    href:  'https://github.com/Harinzu47',
    label: 'GitHub',
    icon:  Github,
  },
  {
    href:  'https://www.linkedin.com/in/khalid-jundullah-8086b8249',
    label: 'LinkedIn',
    icon:  Linkedin,
  },
  {
    href:  'mailto:harinzu47@gmail.com',
    label: 'Email',
    icon:  Mail,
  },
];

/**
 * Determine whether a nav link is active based on current pathname.
 * Anchor-only links (/#about, /#contact) are never "page-active".
 */
function isActive(linkHref: string, pathname: string): boolean {
  if (linkHref.startsWith('/#')) return false;
  if (linkHref === '/') return pathname === '/';
  return pathname.startsWith(linkHref);
}

/**
 * Navbar — terminal style with ~/hzcode logo and active-state routing
 */
export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled]           = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
        isScrolled
          ? 'bg-terminal-bg/95 border-b border-terminal-border'
          : 'bg-terminal-bg/80'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="font-mono text-xl font-bold text-terminal-primary hover:text-terminal-primary/80 transition-colors"
            aria-label="hzcode home"
          >
            ~/hzcode
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-mono text-sm transition-colors duration-150',
                  isActive(link.href, pathname)
                    ? 'text-terminal-primary'
                    : 'text-terminal-text-secondary hover:text-terminal-text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Social icons */}
            <div className="flex items-center gap-4 pl-4 border-l border-terminal-border">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-terminal-text-secondary hover:text-terminal-text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1 border-t border-terminal-border pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block font-mono text-sm py-2 transition-colors',
                  isActive(link.href, pathname)
                    ? 'text-terminal-primary'
                    : 'text-terminal-text-secondary hover:text-terminal-text-primary'
                )}
              >
                {isActive(link.href, pathname) ? '> ' : '  '}{link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4 border-t border-terminal-border">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
