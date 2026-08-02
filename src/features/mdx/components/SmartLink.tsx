import React from 'react';
import Link from 'next/link';
import { ExternalLink, Github, Mail } from 'lucide-react';
import { evaluateLink } from '../linkDetector';

export interface SmartLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  children: React.ReactNode;
}

/**
 * SmartLink component — classifies internal, external, github, and mailto links automatically
 */
export function SmartLink({ href = '', children, className, ...props }: SmartLinkProps) {
  const evaluated = evaluateLink(href);

  const baseStyles = 'text-terminal-secondary hover:text-terminal-secondary/80 underline underline-offset-3 inline-flex items-center gap-1 font-mono text-sm transition-colors';

  if (evaluated.type === 'internal' || evaluated.type === 'anchor') {
    return (
      <Link href={href} className={`${baseStyles} ${className || ''}`} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={evaluated.target}
      rel={evaluated.rel}
      className={`${baseStyles} ${className || ''}`}
      {...props}
    >
      <span>{children}</span>
      {evaluated.type === 'github' && <Github className="w-3.5 h-3.5 inline-block opacity-70" />}
      {evaluated.type === 'email' && <Mail className="w-3.5 h-3.5 inline-block opacity-70" />}
      {evaluated.type === 'external' && <ExternalLink className="w-3 h-3 inline-block opacity-70" />}
    </a>
  );
}
