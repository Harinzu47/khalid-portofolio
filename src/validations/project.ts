import { z } from 'zod';

export const ProjectLinkSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.string().url('Must be a valid URL'),
  linkType: z.string().optional(),
});

export const ProjectFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(200),
  slug: z
    .string()
    .min(3)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  problemStatement: z.string().optional(),
  solution: z.string().optional(),
  architecture: z.string().optional(),
  role: z.string().max(150).optional(),
  status: z.enum(['idea', 'planning', 'active', 'completed', 'archived']).default('planning'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  repositoryUrl: z.string().url('Invalid repository URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Invalid live URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  technologyIds: z.array(z.string().uuid()).default([]),
  skillIds: z.array(z.string().uuid()).default([]),
  links: z.array(ProjectLinkSchema).default([]),
});

export type ProjectFormInput = z.infer<typeof ProjectFormSchema>;
