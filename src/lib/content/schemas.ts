import { z } from 'zod';

/**
 * Base Content Frontmatter Schema
 */
export const BaseContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
});

/**
 * 1. Article Schema (Technical Blog)
 */
export const ArticleSchema = BaseContentSchema.extend({
  date: z.string().min(1, 'Date is required'),
  summary: z.string().min(1, 'Summary is required'),
  tags: z.array(z.string()).default([]),
  canonicalUrl: z.string().optional(),
  author: z.string().default('Khalid Jundullah'),
});

export type ArticleFrontmatter = z.infer<typeof ArticleSchema>;
export type Article = ArticleFrontmatter & {
  slug: string;
  content: string;
  readingTime: string;
  wordCount: number;
};

/**
 * 2. Journal Schema (Daily Logs / Ops Fixes)
 */
export const JournalSchema = BaseContentSchema.extend({
  date: z.string().min(1, 'Date is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  tags: z.array(z.string()).default([]),
  category: z.string().default('general'),
  readTime: z.string().optional(),
});

export type JournalFrontmatter = z.infer<typeof JournalSchema>;
export type JournalEntry = Omit<JournalFrontmatter, 'readTime'> & {
  slug: string;
  content: string;
  readTime: string;
  readingTime: string;
};

/**
 * 3. Project Schema (Case Studies)
 */
export const ProjectCategoryEnum = z.enum(['Infra', 'Networking', 'Web Dev', 'AI']);
export type ProjectCategoryType = z.infer<typeof ProjectCategoryEnum>;

export const ProjectSchema = BaseContentSchema.extend({
  shortDescription: z.string().min(1, 'Short description is required'),
  category: ProjectCategoryEnum,
  year: z.number().optional(),
  image: z.string().optional(),
  github: z.string().optional(),
  demo: z.string().optional(),
  technologies: z.array(z.string()).default([]),
});

export type ProjectFrontmatter = z.infer<typeof ProjectSchema>;
export type ProjectEntry = ProjectFrontmatter & {
  slug: string;
  content: string;
  fullContent: string;
  readingTime: string;
};

/**
 * 4. Career Schema (Work History)
 */
export const CareerSchema = BaseContentSchema.extend({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().default('Remote / Indonesia'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
});

export type CareerFrontmatter = z.infer<typeof CareerSchema>;
export type CareerEntry = CareerFrontmatter & {
  slug: string;
  content: string;
};

/**
 * 5. Certificate Schema (Credentials)
 */
export const CertificateSchema = BaseContentSchema.extend({
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  badgeImage: z.string().optional(),
  skillsCovered: z.array(z.string()).default([]),
});

export type CertificateFrontmatter = z.infer<typeof CertificateSchema>;
export type CertificateEntry = CertificateFrontmatter & {
  slug: string;
  content: string;
};

/**
 * 6. Note Schema (Evergreen / Atomic Technical Notes)
 */
export const NoteStatusEnum = z.enum(['seed', 'growing', 'evergreen']);

export const NoteSchema = BaseContentSchema.extend({
  lastUpdated: z.string().min(1, 'Last updated date is required'),
  category: z.string().default('general'),
  tags: z.array(z.string()).default([]),
  status: NoteStatusEnum.default('growing'),
  relatedNotes: z.array(z.string()).default([]),
});

export type NoteFrontmatter = z.infer<typeof NoteSchema>;
export type NoteEntry = NoteFrontmatter & {
  slug: string;
  slugArray: string[];
  content: string;
  readingTime: string;
};

/**
 * 7. Page Schemas (Now, Uses, Resume, About)
 */
export const PageSchema = BaseContentSchema.extend({
  lastUpdated: z.string().optional(),
  summary: z.string().optional(),
});

export type PageFrontmatter = z.infer<typeof PageSchema>;
export type PageEntry = PageFrontmatter & {
  slug: string;
  content: string;
};

/**
 * Registry mapping for type-safe validation by collection key
 */
export type ContentCollectionKey =
  | 'articles'
  | 'journal'
  | 'projects'
  | 'career'
  | 'certificates'
  | 'notes'
  | 'pages';
