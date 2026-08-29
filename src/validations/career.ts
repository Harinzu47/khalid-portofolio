import { z } from 'zod';
import { VisibilityEnum } from './taxonomy';

export const OrganizationFormSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters long').max(200),
  slug: z
    .string()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  organizationType: z.string().max(50).optional().nullable(),
  location: z.string().max(150).optional().nullable(),
  description: z.string().optional().nullable(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')).nullable(),
  logoPath: z.string().optional().nullable(),
  visibility: VisibilityEnum.default('private'),
});

export const CareerExperienceFormSchema = z
  .object({
    organizationId: z.string().uuid().optional().or(z.literal('')),
    newOrganizationName: z.string().max(200).optional(),
    position: z.string().min(2, 'Position title must be at least 2 characters long').max(200),
    employmentType: z.string().max(50).default('Full-time'),
    location: z.string().max(150).optional().nullable(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional()
      .nullable()
      .or(z.literal('')),
    isCurrent: z.boolean().default(false),
    description: z.string().optional().nullable(),
    responsibilities: z.array(z.string()).optional().default([]),
    sortOrder: z.coerce.number().int().default(0),
    visibility: VisibilityEnum.default('private'),
    projectIds: z.array(z.string().uuid()).default([]),
    skillIds: z.array(z.string().uuid()).default([]),
    domainIds: z.array(z.string().uuid()).default([]),
    technologyIds: z.array(z.string().uuid()).default([]),
  })
  .refine(
    (data) => data.organizationId || (data.newOrganizationName && data.newOrganizationName.trim().length > 0),
    {
      message: 'Please select an existing organization or provide a new organization name.',
      path: ['organizationId'],
    }
  )
  .refine(
    (data) => {
      if (!data.isCurrent && data.endDate && data.startDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be after or equal to the start date.',
      path: ['endDate'],
    }
  );

export type OrganizationFormInput = z.infer<typeof OrganizationFormSchema>;
export type CareerExperienceFormInput = z.infer<typeof CareerExperienceFormSchema>;
