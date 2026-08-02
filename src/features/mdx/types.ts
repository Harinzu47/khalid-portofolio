import React from 'react';

/**
 * Heading node extracted for Table of Contents (TOC)
 */
export interface TocHeading {
  id: string;
  text: string;
  depth: 1 | 2 | 3 | 4;
}

/**
 * Standard compiled MDX Metadata output
 */
export interface MdxMetadata {
  title?: string;
  description?: string;
  slug?: string;
  tags?: string[];
  category?: string;
  date?: string;
  updatedAt?: string;
  readingTime?: string;
  wordCount?: number;
  headings: TocHeading[];
}

/**
 * Smart Link types detected by the rendering engine
 */
export type LinkType = 'internal' | 'external' | 'github' | 'email' | 'anchor';

export interface SmartLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

/**
 * Callout variant types
 */
export type CalloutVariant = 'info' | 'warning' | 'success' | 'tip' | 'error';

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}

/**
 * Code Block metadata options extracted from code block info string
 */
export interface CodeBlockMetadata {
  language: string;
  filename?: string;
  showLineNumbers: boolean;
  highlightLines: number[];
  highlightWords: string[];
}
