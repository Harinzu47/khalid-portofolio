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
  summary: z.string().max(500).optional().nullable(),
  content: z.string().min(5, 'Note content must be at least 5 characters long'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional().nullable(),
  verificationStatus: z
    .enum(['unverified', 'verified', 'outdated', 'deprecated'])
    .default('unverified'),
  lastVerifiedAt: z.string().optional().nullable(),
  testedVersions: z.record(z.string(), z.string()).optional().nullable(),
  isFeatured: z.boolean().default(false),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  domainIds: z.array(z.string().uuid()).default([]),
  skillIds: z.array(z.string().uuid()).default([]),
  technologyIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
  tagNames: z.array(z.string().min(1)).default([]),
  projectIds: z.array(z.string().uuid()).default([]),
});

export const TechNoteFormSchema = NoteFormSchema;

export type NoteFormInput = z.input<typeof NoteFormSchema>;
export type NoteFormParsed = z.infer<typeof NoteFormSchema>;
export type TechNoteFormInput = NoteFormInput;
