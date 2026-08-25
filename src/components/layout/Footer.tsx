'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Linkedin, Mail } from 'lucide-react';

const quickLinks = [
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
 * Footer — terminal style with HZCODE_KERNEL branding
 */
export function Footer() {
  const pathname = usePathname();

  // Hide public Footer on admin workspace
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer
      className="bg-terminal-bg border-t border-terminal-border py-12"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-mono text-xl font-bold text-terminal-primary block mb-3"
            >
              ~/hzcode
            </Link>
            <p className="text-terminal-text-secondary text-sm leading-relaxed">
              Network &amp; Infrastructure Engineer transitioning into Fullstack Development.
              Covering Infra, Networking, Web Dev, and AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-terminal-text-muted text-xs uppercase tracking-widest mb-4">
              // quick links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-sm text-terminal-text-secondary hover:text-terminal-secondary transition-colors"
                  >
                    &gt; {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono text-terminal-text-muted text-xs uppercase tracking-widest mb-4">
              // get in touch
            </h4>
            <div className="flex gap-3 mb-4">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted hover:text-terminal-text-primary rounded transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <a
              href="mailto:harinzu47@gmail.com"
              className="font-mono text-sm text-terminal-secondary hover:text-terminal-secondary/80 transition-colors"
            >
              harinzu47@gmail.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-terminal-border pt-6 text-center">
          <p className="font-mono text-terminal-text-muted text-xs tracking-widest">
            © 2026 HZCODE_KERNEL — ALL_SYSTEMS_GO
          </p>
        </div>
      </div>
    </footer>
  );
}
