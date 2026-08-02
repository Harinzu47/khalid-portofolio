'use client';

import Link from 'next/link';

/**
 * Terminal block display item
 */
interface TerminalLine {
  type: 'command' | 'output' | 'link' | 'chips';
  text?: string;
  chips?: string[];
  href?: string;
}

const heroLines: TerminalLine[] = [
  { type: 'command', text: 'whoami' },
  { type: 'output',  text: 'khalid-jundullah' },
  { type: 'output',  text: '> Network & Infrastructure Engineer' },
  { type: 'output',  text: '> Transitioning into Fullstack Development' },
  { type: 'link',    text: '> Domain: hzcode.my.id', href: 'https://hzcode.my.id' },
];

const skillsLines: TerminalLine[] = [
  { type: 'command', text: 'cat skills.txt' },
  {
    type: 'chips',
    chips: ['Linux', 'MikroTik', 'Cisco', 'Docker', 'Laravel', 'Next.js', 'Python', 'FastAPI'],
  },
];

/**
 * Hero section — terminal format
 */
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-terminal-bg overflow-hidden pt-20">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#30363d22 1px, transparent 1px), linear-gradient(90deg, #30363d22 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 w-full">

        {/* Terminal block 1 — whoami */}
        <div className="mb-8 border border-terminal-border rounded bg-terminal-surface p-6">
          {/* Window chrome */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-terminal-border">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-accent opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-600 opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-primary opacity-70" />
            <span className="font-mono text-xs text-terminal-text-muted ml-2">
              bash — hzcode@kernel
            </span>
          </div>

          {heroLines.map((line, i) => (
            <div key={i} className="font-mono text-sm leading-7">
              {line.type === 'command' && (
                <p>
                  <span className="text-terminal-primary">$ </span>
                  <span className="text-terminal-text-primary">{line.text}</span>
                </p>
              )}
              {line.type === 'output' && (
                <p className="text-terminal-text-secondary pl-4">{line.text}</p>
              )}
              {line.type === 'link' && (
                <p className="pl-4">
                  <a
                    href={line.href}
                    className="text-terminal-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {line.text}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Terminal block 2 — skills.txt */}
        <div className="mb-10 border border-terminal-border rounded bg-terminal-surface p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-terminal-border">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-accent opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-600 opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-primary opacity-70" />
            <span className="font-mono text-xs text-terminal-text-muted ml-2">
              bash — hzcode@kernel
            </span>
          </div>

          {skillsLines.map((line, i) => (
            <div key={i} className="font-mono text-sm leading-7">
              {line.type === 'command' && (
                <p className="mb-3">
                  <span className="text-terminal-primary">$ </span>
                  <span className="text-terminal-text-primary">{line.text}</span>
                </p>
              )}
              {line.type === 'chips' && (
                <div className="flex flex-wrap gap-2 pl-4">
                  {line.chips?.map((chip) => (
                    <span
                      key={chip}
                      className="px-2.5 py-1 border border-terminal-border text-terminal-text-primary text-xs rounded bg-terminal-bg"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 font-mono text-sm">
          <Link
            href="/projects"
            className="px-5 py-2.5 border border-terminal-primary text-terminal-primary hover:bg-terminal-primary/10 rounded transition-colors"
          >
            [./view-projects]
          </Link>
          <Link
            href="/journal"
            className="px-5 py-2.5 border border-terminal-secondary text-terminal-secondary hover:bg-terminal-secondary/10 rounded transition-colors"
          >
            [./read-journal]
          </Link>
        </div>
      </div>
    </section>
  );
}
