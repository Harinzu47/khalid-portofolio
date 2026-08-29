import { z } from 'zod';

export const LearningPathStatusEnum = z.enum(['planned', 'active', 'paused', 'completed', 'archived']);

export const LearningPathFormSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters long').max(255),
    slug: z
      .string()
      .min(3)
      .max(280)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional()
      .or(z.literal('')),
    summary: z.string().max(500).optional().nullable(),
    status: LearningPathStatusEnum.default('planned'),
    startedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional()
      .nullable()
      .or(z.literal('')),
    completedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional()
      .nullable()
      .or(z.literal('')),
    progressMode: z.enum(['none', 'manual']).optional().nullable(),
    progressValue: z
      .number()
      .int()
      .min(0, 'Progress must be between 0 and 100')
      .max(100, 'Progress must be between 0 and 100')
      .optional()
      .nullable(),
    currentFocus: z.string().max(255).optional().nullable(),
    content: z.any().optional().nullable(),
    visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
    skillIds: z.array(z.string().uuid()).default([]),
    domainIds: z.array(z.string().uuid()).default([]),
    technologyIds: z.array(z.string().uuid()).default([]),
  })
  .refine(
    (data) => {
      if (data.startedAt && data.completedAt) {
        return new Date(data.completedAt) >= new Date(data.startedAt);
      }
      return true;
    },
    {
      message: 'Completion date cannot be earlier than start date.',
      path: ['completedAt'],
    }
  )
  .refine(
    (data) => {
      // Invariant: completed learning paths must have completedAt set (Amendment 6)
      if (data.status === 'completed' && !data.completedAt) {
        return false;
      }
      return true;
    },
    {
      message: 'Completed learning paths require a completion date.',
      path: ['completedAt'],
    }
  )
  .refine(
    (data) => {
      // Invariant: completed or archived paths cannot have active currentFocus (Amendment 6)
      if ((data.status === 'completed' || data.status === 'archived') && data.currentFocus && data.currentFocus.trim().length > 0) {
        return false;
      }
      return true;
    },
    {
      message: 'Completed or archived learning paths cannot have an active current focus.',
      path: ['currentFocus'],
    }
  );

export type LearningPathFormInput = z.input<typeof LearningPathFormSchema>;
export type LearningPathFormParsed = z.infer<typeof LearningPathFormSchema>;
