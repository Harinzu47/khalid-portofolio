import { z } from 'zod';

export const VisibilityEnum = z.enum(['private', 'unlisted', 'public']);

export const SkillFormSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters long').max(100),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  category: z.string().max(100).default('Infrastructure'),
  description: z.string().optional().nullable(),
  proficiencyLevel: z.coerce.number().min(1).max(5).optional().nullable(),
  isFeatured: z.boolean().default(false),
  visibility: VisibilityEnum.default('private'),
  domainIds: z.array(z.string().uuid()).optional().default([]),
});

export const DomainFormSchema = z.object({
  name: z.string().min(2, 'Domain name must be at least 2 characters long').max(100),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  visibility: VisibilityEnum.default('private'),
  skillIds: z.array(z.string().uuid()).optional().default([]),
});

export const TechnologyFormSchema = z.object({
  name: z.string().min(2, 'Technology name must be at least 2 characters long').max(100),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  category: z.string().max(100).optional().nullable(),
  technologyType: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')).nullable(),
  iconName: z.string().max(100).optional().nullable(),
  visibility: VisibilityEnum.default('private'),
});

export const TagFormSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(100),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  description: z.string().optional().nullable(),
  visibility: VisibilityEnum.default('private'),
});

export type SkillFormInput = z.infer<typeof SkillFormSchema>;
export type DomainFormInput = z.infer<typeof DomainFormSchema>;
export type TechnologyFormInput = z.infer<typeof TechnologyFormSchema>;
export type TagFormInput = z.infer<typeof TagFormSchema>;
