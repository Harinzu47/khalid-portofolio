import { z } from 'zod';

export const ADRFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(255),
  slug: z
    .string()
    .min(3)
    .max(280)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  number: z.number().int().positive().optional().nullable(),
  status: z
    .enum(['proposed', 'accepted', 'superseded', 'rejected', 'deprecated'])
    .default('proposed'),
  context: z.string().optional().nullable(),
  decision: z.string().optional().nullable(),
  alternatives: z.any().optional().nullable(),
  consequences: z.any().optional().nullable(),
  projectId: z.string().uuid().optional().nullable().or(z.literal('')),
  supersededById: z.string().uuid().optional().nullable().or(z.literal('')),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  decidedAt: z.string().optional().nullable(),
});

export type ADRFormInput = z.input<typeof ADRFormSchema>;
export type ADRFormParsed = z.infer<typeof ADRFormSchema>;
