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
  content: z.string().min(3, 'Content must be at least 3 characters long'),
  summary: z.string().max(500).optional().nullable(),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  sessionNumber: z.number().int().optional().nullable(),
  workState: z.string().max(50).optional().nullable(),
  startedAt: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/).optional().nullable()),
  endedAt: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/).optional().nullable()),
  isFeatured: z.boolean().default(false),
  reflection: z.string().optional().nullable(),
  domainIds: z.array(z.string().uuid()).default([]),
  skillIds: z.array(z.string().uuid()).default([]),
  technologyIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
  tagNames: z.array(z.string().min(1)).default([]),
  projectIds: z.array(z.string().uuid()).default([]),
});

export type JournalFormInput = z.input<typeof JournalFormSchema>;
export type JournalFormParsed = z.infer<typeof JournalFormSchema>;

/**
 * Lightweight Quick Capture schema for frictionless capture per Section 12 & Amendment 3.
 */
export const JournalQuickCaptureSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(3, 'Content must be at least 3 characters long'),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  sessionNumber: z.number().int().optional().nullable(),
  workState: z.string().max(50).optional().nullable(),
  startedAt: z.string().optional().nullable(),
  endedAt: z.string().optional().nullable(),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  tagNames: z.array(z.string().min(1)).default([]),
  projectIds: z.array(z.string().uuid()).default([]),
});

export type JournalQuickCaptureInput = z.input<typeof JournalQuickCaptureSchema>;

/**
 * Schema for explicit journal extraction to TechNote, Article, or ADR.
 */
export const JournalExtractionSchema = z.object({
  targetType: z.enum(['TECH_NOTE', 'ARTICLE', 'ADR']),
  title: z.string().max(255).optional(),
  slug: z.string().max(280).optional(),
  summary: z.string().max(500).optional(),
  content: z.string().optional(),
});

export type JournalExtractionInput = z.input<typeof JournalExtractionSchema>;
