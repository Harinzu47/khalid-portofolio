import { z } from 'zod';

export const ArticleFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(255),
  slug: z
    .string()
    .min(3)
    .max(280)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  subtitle: z.string().max(255).optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(10, 'Article content must be at least 10 characters long'),
  readingTimeMinutes: z.number().int().positive().optional().nullable(),
  featured: z.boolean().default(false),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  ogImageId: z.string().uuid().optional().nullable(),
  domainIds: z.array(z.string().uuid()).default([]),
  skillIds: z.array(z.string().uuid()).default([]),
  technologyIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
  tagNames: z.array(z.string().min(1)).default([]),
  projectIds: z.array(z.string().uuid()).default([]),
});

export type ArticleFormInput = z.input<typeof ArticleFormSchema>;
export type ArticleFormParsed = z.infer<typeof ArticleFormSchema>;
