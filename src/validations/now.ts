import { z } from 'zod';

export const NowEntryTypeEnum = z.enum([
  'building',
  'learning',
  'managing',
  'researching',
  'reading',
  'watching',
  'exploring',
  'using',
]);

export const NowEntryStatusEnum = z.enum(['active', 'idle', 'completed', 'archived']);

export const NowEntryFormSchema = z
  .object({
    entryType: NowEntryTypeEnum,
    title: z.string().min(2, 'Title must be at least 2 characters long').max(255),
    description: z.string().max(1000).optional().nullable(),
    status: NowEntryStatusEnum.default('active'),
    startedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional()
      .nullable()
      .or(z.literal('')),
    endedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional()
      .nullable()
      .or(z.literal('')),
    isCurrent: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
    visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
    projectIds: z.array(z.string().uuid()).default([]),
    learningPathIds: z.array(z.string().uuid()).default([]),
    roadmapIds: z.array(z.string().uuid()).default([]),
    domainIds: z.array(z.string().uuid()).default([]),
    technologyIds: z.array(z.string().uuid()).default([]),
  })
  .refine(
    (data) => {
      if (data.startedAt && data.endedAt) {
        return new Date(data.endedAt) >= new Date(data.startedAt);
      }
      return true;
    },
    {
      message: 'End date cannot be earlier than start date.',
      path: ['endedAt'],
    }
  )
  .refine(
    (data) => {
      // Invariant: isCurrent = true requires status to be active or idle (Amendment 3)
      if (data.isCurrent && (data.status === 'completed' || data.status === 'archived')) {
        return false;
      }
      return true;
    },
    {
      message: 'Completed or archived entries cannot be marked as current.',
      path: ['isCurrent'],
    }
  );

export type NowEntryFormInput = z.input<typeof NowEntryFormSchema>;
export type NowEntryFormParsed = z.infer<typeof NowEntryFormSchema>;

/**
 * Low-friction Quick Add schema for capturing current activity (Amendments 15, 16).
 */
export const NowQuickAddSchema = z.object({
  entryType: NowEntryTypeEnum,
  title: z.string().min(2, 'Title must be at least 2 characters long').max(255),
  description: z.string().max(1000).optional().nullable(),
  projectIds: z.array(z.string().uuid()).default([]),
  learningPathIds: z.array(z.string().uuid()).default([]),
  domainIds: z.array(z.string().uuid()).default([]),
  technologyIds: z.array(z.string().uuid()).default([]),
});

export type NowQuickAddInput = z.input<typeof NowQuickAddSchema>;
