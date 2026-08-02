import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ZodSchema } from 'zod';
import { calculateReadingTime } from './readingTime';

const CONTENT_BASE_DIR = path.join(process.cwd(), 'content');

export interface RawContentItem<T> {
  slug: string;
  slugArray: string[];
  data: T;
  content: string;
  readingTime: string;
  wordCount: number;
}

/**
 * Format string or Date object into clean YYYY-MM-DD string
 */
export function normalizeDate(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val);
}

/**
 * Normalizes frontmatter data by auto-formatting date objects to strings before Zod parsing
 */
function normalizeFrontmatter(data: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...data };
  for (const key of ['date', 'issueDate', 'expiryDate', 'startDate', 'endDate', 'lastUpdated']) {
    if (key in normalized && normalized[key]) {
      normalized[key] = normalizeDate(normalized[key]);
    }
  }
  return normalized;
}

/**
 * Reads and parses all MDX files in a flat collection directory
 */
export function readCollection<T>(
  collectionName: string,
  schema: ZodSchema<T>
): RawContentItem<T>[] {
  const dirPath = path.join(CONTENT_BASE_DIR, collectionName);
  if (!fs.existsSync(dirPath)) return [];

  const fileNames = fs.readdirSync(dirPath);

  return fileNames
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(dirPath, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      const normalizedData = normalizeFrontmatter(data);
      const parsedData = schema.parse(normalizedData);
      const { text, words } = calculateReadingTime(content);

      return {
        slug,
        slugArray: [slug],
        data: parsedData,
        content,
        readingTime: text,
        wordCount: words,
      };
    });
}

/**
 * Reads and parses all MDX files recursively (for nested notes/docs hierarchy)
 */
export function readRecursiveCollection<T>(
  collectionName: string,
  schema: ZodSchema<T>
): RawContentItem<T>[] {
  const rootDirPath = path.join(CONTENT_BASE_DIR, collectionName);
  if (!fs.existsSync(rootDirPath)) return [];

  function walk(currentDir: string, basePath = ''): RawContentItem<T>[] {
    let items: RawContentItem<T>[] = [];
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        items = items.concat(walk(fullPath, path.join(basePath, entry.name)));
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        const cleanName = entry.name.replace(/\.mdx?$/, '');
        const slugArray = basePath ? [...basePath.split(path.sep), cleanName] : [cleanName];
        const slug = slugArray.join('/');
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const normalizedData = normalizeFrontmatter(data);
        const parsedData = schema.parse(normalizedData);
        const { text, words } = calculateReadingTime(content);

        items.push({
          slug,
          slugArray,
          data: parsedData,
          content,
          readingTime: text,
          wordCount: words,
        });
      }
    }

    return items;
  }

  return walk(rootDirPath);
}

/**
 * Sorts array of content items by date (newest first)
 */
export function sortByDate<T extends { date?: string; lastUpdated?: string; startDate?: string; issueDate?: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date || a.lastUpdated || a.startDate || a.issueDate || 0).getTime();
    const dateB = new Date(b.date || b.lastUpdated || b.startDate || b.issueDate || 0).getTime();
    return dateB - dateA;
  });
}
