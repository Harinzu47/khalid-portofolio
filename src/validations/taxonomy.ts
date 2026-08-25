import { z } from 'zod';

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
  description: z.string().optional(),
  proficiencyLevel: z.coerce.number().min(1).max(5).optional().nullable(),
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
  category: z.string().max(100).optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  iconName: z.string().max(100).optional(),
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
});

export type SkillFormInput = z.infer<typeof SkillFormSchema>;
export type TechnologyFormInput = z.infer<typeof TechnologyFormSchema>;
export type TagFormInput = z.infer<typeof TagFormSchema>;
