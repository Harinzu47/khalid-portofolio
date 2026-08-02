import { CodeBlockMetadata } from './types';

/**
 * Parses code block info strings to extract language, filename, line numbers, and line highlighting.
 * Format examples:
 *   php
 *   ts filename="src/app/page.tsx"
 *   bash showLineNumbers
 *   dockerfile {1,3-5} filename="Dockerfile"
 */
export function parseCodeBlockMeta(className?: string, rawMeta?: string): CodeBlockMetadata {
  const langMatch = /language-(\w+)/.exec(className || '');
  const language = langMatch ? langMatch[1].toLowerCase() : 'text';

  const metaString = rawMeta || className || '';

  // Extract filename parameter e.g. filename="src/index.ts"
  const filenameMatch = /filename=["']([^"']+)["']/.exec(metaString);
  const filename = filenameMatch ? filenameMatch[1] : undefined;

  // Check for showLineNumbers flag
  const showLineNumbers = metaString.includes('showLineNumbers') || true;

  // Parse highlighted lines range e.g. {1,3-5}
  const highlightLines: number[] = [];
  const lineRangeMatch = /\{([\d,-]+)\}/.exec(metaString);
  if (lineRangeMatch) {
    const parts = lineRangeMatch[1].split(',');
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          highlightLines.push(i);
        }
      } else {
        highlightLines.push(Number(part));
      }
    }
  }

  // Parse highlighted words e.g. /User/
  const highlightWords: string[] = [];
  const wordMatch = /\/([^\/]+)\//.exec(metaString);
  if (wordMatch) {
    highlightWords.push(wordMatch[1]);
  }

  return {
    language,
    filename,
    showLineNumbers,
    highlightLines,
    highlightWords,
  };
}
