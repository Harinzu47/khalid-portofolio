'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Linkedin, Mail } from 'lucide-react';

const CANONICAL_LINKS = [
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

export function Footer() {
  const pathname = usePathname();

  // Hide public Footer on admin and OS workspace
  if (pathname.startsWith('/admin') || pathname.startsWith('/os')) {
    return null;
  }

  return (
    <footer className="bg-terminal-bg border-t border-terminal-border py-12 text-terminal-text-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-10 border-b border-terminal-border/50">
          {/* Brand Column */}
          <div className="space-y-3 max-w-sm">
            <Link
              href="/"
              className="font-mono text-base font-bold text-terminal-text-primary hover:text-terminal-primary transition-colors flex items-center gap-1.5"
            >
              <span className="text-terminal-primary">~/</span>
              <span>HZCODE</span>
            </Link>
            <p className="text-xs text-terminal-text-secondary leading-relaxed">
              Personal Developer OS & Public Knowledge System. Engineered with high-reliability
              distributed services, PostgreSQL full-text retrieval, and fail-closed security.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-xs">
            {CANONICAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-terminal-text-muted hover:text-terminal-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Socials & Communication */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-terminal-text-muted uppercase tracking-wider block text-[10px]">
              VERIFIED CHANNELS
            </span>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-terminal-text-muted hover:text-terminal-primary transition-colors inline-flex items-center gap-1"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{s.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[11px] text-terminal-text-muted">
          <div>&copy; {new Date().getFullYear()} Khalid Jundullah. All rights reserved.</div>
          <div className="text-terminal-text-muted">HZCODE ARCHITECTURE v1.0</div>
        </div>
      </div>
    </footer>
  );
}
