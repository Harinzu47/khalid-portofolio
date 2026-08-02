import { extractHeadingsAndToc } from './headingToc';
import { calculateReadingTime } from '../../lib/content/readingTime';
import { getMergedMdxComponents } from './mdxProvider';
import { MdxMetadata, TocHeading } from './types';

export interface MdxEngineProcessInput {
  content: string;
  slug?: string;
  frontmatter?: Record<string, unknown>;
}

export interface MdxEngineProcessOutput {
  rawContent: string;
  slug?: string;
  headings: TocHeading[];
  metadata: MdxMetadata;
  components: Record<string, unknown>;
}

/**
 * Enterprise MDX Engine Processing Pipeline
 * Compiles headings TOC, reading time, word count, metadata, and custom components registry.
 */
export function processMdxContent({
  content,
  slug,
  frontmatter = {},
}: MdxEngineProcessInput): MdxEngineProcessOutput {
  // 1. Extract headings and generate TOC
  const headings = extractHeadingsAndToc(content);

  // 2. Calculate reading time & word count
  const readingStats = calculateReadingTime(content);

  // 3. Assemble metadata
  const metadata: MdxMetadata = {
    title: (frontmatter.title as string) || undefined,
    description: (frontmatter.summary || frontmatter.excerpt || frontmatter.shortDescription) as string || undefined,
    slug,
    tags: (frontmatter.tags as string[]) || [],
    category: (frontmatter.category as string) || undefined,
    date: (frontmatter.date as string) || undefined,
    updatedAt: (frontmatter.lastUpdated as string) || undefined,
    readingTime: readingStats.text,
    wordCount: readingStats.words,
    headings,
  };

  // 4. Merge component registry
  const components = getMergedMdxComponents();

  return {
    rawContent: content,
    slug,
    headings,
    metadata,
    components,
  };
}

// Re-export core features
export * from './types';
export * from './headingToc';
export * from './linkDetector';
export * from './codeHighlighter';
export * from './errorBoundary';
export * from './mdxProvider';
export * from './components';
