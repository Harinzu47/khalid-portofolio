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
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10, 'Article content must be at least 10 characters long'),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  tagNames: z.array(z.string().min(1)).default([]),
  projectIds: z.array(z.string().uuid()).default([]),
});

export type ArticleFormInput = z.infer<typeof ArticleFormSchema>;
