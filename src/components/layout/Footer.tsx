'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CANONICAL_NAV = [
  { href: '/work', label: 'WORK' },
  { href: '/expertise', label: 'EXPERTISE' },
  { href: '/experience', label: 'EXPERIENCE' },
  { href: '/system', label: 'SYSTEM' },
  { href: '/now', label: 'NOW' },
  { href: '/about', label: 'ABOUT' },
];

const CHANNELS = [
  { href: 'https://github.com/Harinzu47', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/khalid-jundullah-8086b8249', label: 'LinkedIn' },
  { href: 'mailto:harinzu47@gmail.com', label: 'Email' },
  { href: 'https://github.com/Harinzu47/khalid-portofolio', label: 'Source' },
  { href: '/rss.xml', label: 'RSS' },
];

export function Footer() {
  const pathname = usePathname();

  // Hide public Footer on admin workspace
  if (pathname.startsWith('/admin') || pathname.startsWith('/os')) {
    return null;
  }

  return (
    <footer className="w-full bg-surface-main border-t border-border-subtle py-16 md:py-20 text-text-primary">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-border-subtle">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-3">
            <div className="font-headline text-2xl md:text-3xl font-extrabold tracking-tighter text-text-primary">
              HZCODE
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-secondary">
              © {new Date().getFullYear()} HZCODE ENGINEERED SYSTEMS / ALL RIGHTS RESERVED
            </p>
            <p className="text-xs text-text-secondary max-w-md leading-relaxed pt-1">
              Personal Developer OS &amp; Public Knowledge System. Engineered for deterministic resilience, structural clarity, and continuous learning.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary block mb-3">
              NAVIGATION
            </span>
            <div className="flex flex-col space-y-2 font-mono text-xs">
              {CANONICAL_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text-secondary hover:text-text-primary uppercase tracking-wider transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Channel Links */}
          <div className="md:col-span-3 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary block mb-3">
              VERIFIED CHANNELS
            </span>
            <div className="flex flex-col space-y-2 font-mono text-xs">
              {CHANNELS.map((ch) => (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith('http') ? '_blank' : undefined}
                  rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>{ch.label}</span>
                  {ch.href.startsWith('http') && <span>&nearr;</span>}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[11px] text-text-secondary">
          <div>Khalid Jundullah — Engineered for Performance &amp; Reliability.</div>
          <div>HZCODE v2.0 — STITCH ALIGNED</div>
        </div>
      </div>
    </footer>
  );
}
