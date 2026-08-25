import { z } from 'zod';

export const JournalFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(255),
  slug: z
    .string()
    .min(3)
    .max(280)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  content: z.string().min(5, 'Content must be at least 5 characters long'),
  summary: z.string().max(500).optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  reflection: z.string().optional(),
  published: z.boolean().default(false),
  tagNames: z.array(z.string().min(1)).default([]),
  projectIds: z.array(z.string().uuid()).default([]),
  technologyIds: z.array(z.string().uuid()).default([]),
});

export type JournalFormInput = z.infer<typeof JournalFormSchema>;
