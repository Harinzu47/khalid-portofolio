import {
  ArticleSchema,
  Article,
  JournalSchema,
  JournalEntry,
  ProjectSchema,
  ProjectEntry,
  ProjectCategoryType,
  CareerSchema,
  CareerEntry,
  CertificateSchema,
  CertificateEntry,
  NoteSchema,
  NoteEntry,
  PageSchema,
  PageEntry,
} from './schemas';
import { readCollection, readRecursiveCollection, sortByDate } from './reader';

/**
 * 1. Articles Collection API
 */
export function getArticles(): Article[] {
  const items = readCollection('articles', ArticleSchema);
  const articles = items.map((item) => ({
    ...item.data,
    slug: item.slug,
    content: item.content,
    readingTime: item.readingTime,
    wordCount: item.wordCount,
  }));
  return sortByDate(articles);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}

/**
 * 2. Journal Collection API
 */
export function getJournalEntries(): JournalEntry[] {
  const items = readCollection('journal', JournalSchema);
  const entries = items.map((item) => ({
    ...item.data,
    slug: item.slug,
    content: item.content,
    readTime: item.data.readTime || item.readingTime,
    readingTime: item.readingTime,
  }));
  return sortByDate(entries);
}

export function getJournalEntryBySlug(slug: string): JournalEntry | undefined {
  return getJournalEntries().find((j) => j.slug === slug);
}

// Aliases for Journal
export const getAllJournalPosts = getJournalEntries;
export const getJournalPostBySlug = getJournalEntryBySlug;

/**
 * 3. Projects Collection API
 */
export function getProjects(): ProjectEntry[] {
  const items = readCollection('projects', ProjectSchema);
  return items.map((item) => ({
    ...item.data,
    slug: item.slug,
    content: item.content,
    fullContent: item.content,
    readingTime: item.readingTime,
  }));
}

export function getProjectBySlug(slug: string): ProjectEntry | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getProjectsByCategory(category: ProjectCategoryType): ProjectEntry[] {
  return getProjects().filter((p) => p.category === category);
}

export function getFeaturedProjects(): ProjectEntry[] {
  return getProjects().slice(0, 3);
}

// Aliases for Projects
export const getAllProjects = getProjects;

/**
 * 4. Career Collection API
 */
export function getCareerHistory(): CareerEntry[] {
  const items = readCollection('career', CareerSchema);
  const entries = items.map((item) => ({
    ...item.data,
    slug: item.slug,
    content: item.content,
  }));
  return sortByDate(entries);
}

/**
 * 5. Certificates Collection API
 */
export function getCertificates(): CertificateEntry[] {
  const items = readCollection('certificates', CertificateSchema);
  const certs = items.map((item) => ({
    ...item.data,
    slug: item.slug,
    content: item.content,
  }));
  return sortByDate(certs);
}

/**
 * 6. Notes Collection API (Recursive Hierarchy)
 */
export function getNotes(): NoteEntry[] {
  const items = readRecursiveCollection('notes', NoteSchema);
  const notes = items.map((item) => ({
    ...item.data,
    slug: item.slug,
    slugArray: item.slugArray,
    content: item.content,
    readingTime: item.readingTime,
  }));
  return sortByDate(notes);
}

export function getNoteBySlugArray(slugArray: string[]): NoteEntry | undefined {
  const targetSlug = slugArray.join('/');
  return getNotes().find((n) => n.slug === targetSlug);
}

// Aliases for Notes
export const getAllNotes = getNotes;

/**
 * 7. Singleton Pages API (about, now, uses, resume)
 */
export function getPage(slug: string): PageEntry | undefined {
  const items = readCollection('pages', PageSchema);
  const item = items.find((i) => i.slug === slug);
  if (!item) return undefined;

  return {
    ...item.data,
    slug: item.slug,
    content: item.content,
  };
}

/**
 * Global Taxonomy API
 */
export function getAllTags(): string[] {
  const articles = getArticles();
  const journal = getJournalEntries();
  const projects = getProjects();
  const notes = getNotes();

  const set = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => set.add(t)));
  journal.forEach((j) => j.tags.forEach((t) => set.add(t)));
  projects.forEach((p) => set.add(p.category.toLowerCase()));
  notes.forEach((n) => n.tags.forEach((t) => set.add(t)));

  return Array.from(set).sort();
}

// Re-export schemas, types, and metadata utilities
export * from './schemas';
export * from './readingTime';
export * from './metadata';
export * from './reader';
