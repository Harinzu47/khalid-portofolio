import { z } from 'zod';

export const LearningGoalFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long').max(255),
  description: z.string().optional(),
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

export const RoadmapItemFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long').max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['backlog', 'planned', 'in_progress', 'completed']).default('backlog'),
  priority: z.coerce.number().int().min(1).max(5).default(1),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .nullable()
    .or(z.literal('')),
  sortOrder: z.coerce.number().int().default(0),
});

export type LearningGoalFormInput = z.infer<typeof LearningGoalFormSchema>;
export type RoadmapItemFormInput = z.infer<typeof RoadmapItemFormSchema>;
