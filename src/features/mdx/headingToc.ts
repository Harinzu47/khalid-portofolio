import GithubSlugger from 'github-slugger';
import { TocHeading } from './types';

/**
 * Extracts all headings (H1, H2, H3, H4) from raw markdown/MDX text
 * and generates unique, slugified anchor IDs.
 */
export function extractHeadingsAndToc(markdown: string): TocHeading[] {
  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];

  // Match Markdown headings H1 to H4, ignoring code blocks
  const cleanMarkdown = markdown.replace(/```[\s\S]*?```/g, '');
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(cleanMarkdown)) !== null) {
    const level = match[1].length as 1 | 2 | 3 | 4;
    const rawText = match[2].trim();

    // Strip inline formatting (links, bold, code) for clean heading text
    const text = rawText
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .trim();

    if (text) {
      const id = slugger.slug(text);
      headings.push({
        id,
        text,
        depth: level,
      });
    }
  }

  return headings;
}
