import { LinkType } from './types';

export interface EvaluatedLink {
  type: LinkType;
  isExternal: boolean;
  target?: string;
  rel?: string;
}

/**
 * Evaluates link href and returns standard security & accessibility attributes
 */
export function evaluateLink(href: string): EvaluatedLink {
  if (!href) {
    return { type: 'internal', isExternal: false };
  }

  // Anchor links
  if (href.startsWith('#')) {
    return { type: 'anchor', isExternal: false };
  }

  // Mailto links
  if (href.startsWith('mailto:')) {
    return { type: 'email', isExternal: true };
  }

  // GitHub links
  if (href.includes('github.com')) {
    return {
      type: 'github',
      isExternal: true,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }

  // Absolute HTTP/HTTPS external links
  if (href.startsWith('http://') || href.startsWith('https://')) {
    const isDomainInternal = href.includes('hzcode.my.id');
    if (!isDomainInternal) {
      return {
        type: 'external',
        isExternal: true,
        target: '_blank',
        rel: 'noopener noreferrer',
      };
    }
  }

  // Default internal relative link
  return { type: 'internal', isExternal: false };
}
