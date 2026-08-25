import { z } from 'zod';

export const NoteFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(255),
  slug: z
    .string()
    .min(3)
    .max(280)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  content: z.string().min(5, 'Note content must be at least 5 characters long'),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
});

export type NoteFormInput = z.infer<typeof NoteFormSchema>;
