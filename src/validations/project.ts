import { z } from 'zod';
import { VisibilityEnum } from './taxonomy';

export const ProjectLinkSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.string().url('Must be a valid URL'),
  linkType: z.string().optional().nullable(),
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
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  projectType: z.string().max(50).optional().nullable(),
  problemStatement: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  architecture: z.string().optional().nullable(),
  role: z.string().max(150).optional().nullable(),
  roleSummary: z.string().optional().nullable(),
  status: z
    .enum(['idea', 'planning', 'active', 'maintained', 'completed', 'archived', 'experimental'])
    .default('planning'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  repositoryUrl: z.string().url('Invalid repository URL').optional().or(z.literal('')).nullable(),
  liveUrl: z.string().url('Invalid live URL').optional().or(z.literal('')).nullable(),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  visibility: VisibilityEnum.default('private'),
  domainIds: z.array(z.string().uuid()).default([]),
  skillIds: z.array(z.string().uuid()).default([]),
  technologyIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
  links: z.array(ProjectLinkSchema).default([]),
});

export type ProjectFormInput = z.infer<typeof ProjectFormSchema>;
