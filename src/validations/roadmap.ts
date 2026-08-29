import { z } from 'zod';

export const LearningGoalFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long').max(255),
  description: z.string().optional().nullable(),
  status: z.enum(['planned', 'in_progress', 'completed', 'abandoned']).default('planned'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  progress: z.coerce.number().min(0).max(100).default(0),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .nullable()
    .or(z.literal('')),
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
});

export const RoadmapStatusEnum = z.enum(['backlog', 'planned', 'in_progress', 'completed']);

export const RoadmapItemFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long').max(255),
  slug: z
    .string()
    .min(2)
    .max(280)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  summary: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  roadmapType: z.string().max(50).optional().nullable(),
  status: RoadmapStatusEnum.default('backlog'),
  priority: z.coerce.number().int().min(1).max(5).default(1),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .nullable()
    .or(z.literal('')),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .nullable()
    .or(z.literal('')),
  sortOrder: z.coerce.number().int().default(0),
  content: z.any().optional().nullable(),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
});

export type LearningGoalFormInput = z.input<typeof LearningGoalFormSchema>;
export type RoadmapItemFormInput = z.input<typeof RoadmapItemFormSchema>;
export type RoadmapItemFormParsed = z.infer<typeof RoadmapItemFormSchema>;

/**
 * Reorder schema enforcing uniqueness of IDs and sort orders (Amendment 12)
 */
export const RoadmapReorderItemSchema = z.object({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0),
});

export const RoadmapReorderSchema = z
  .array(RoadmapReorderItemSchema)
  .min(1, 'At least one item required for reordering')
  .refine(
    (items) => {
      const ids = items.map((i) => i.id);
      return new Set(ids).size === ids.length;
    },
    { message: 'Duplicate roadmap item IDs in reorder payload.' }
  )
  .refine(
    (items) => {
      const orders = items.map((i) => i.sortOrder);
      return new Set(orders).size === orders.length;
    },
    { message: 'Duplicate sortOrder values in reorder payload.' }
  );

export type RoadmapReorderInput = z.infer<typeof RoadmapReorderSchema>;
