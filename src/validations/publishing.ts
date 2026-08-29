import { z } from 'zod';
import {
  PUBLISHABLE_ENTITY_TYPES,
  PUBLICATION_STATUSES,
} from '@/domain/publishing';
import { VisibilityEnum } from './taxonomy';
export { VisibilityEnum };

export const PublishableEntityTypeEnum = z.enum(PUBLISHABLE_ENTITY_TYPES);

export const PublicationStatusEnum = z.enum(PUBLICATION_STATUSES);

export const SubmitForReviewSchema = z.object({
  entityType: PublishableEntityTypeEnum,
  entityId: z.string().uuid('Invalid entity ID format'),
});

export type SubmitForReviewInput = z.infer<typeof SubmitForReviewSchema>;

export const ReturnToDraftSchema = z.object({
  entityType: PublishableEntityTypeEnum,
  entityId: z.string().uuid('Invalid entity ID format'),
});

export type ReturnToDraftInput = z.infer<typeof ReturnToDraftSchema>;

export const SchedulePublicationSchema = z
  .object({
    entityType: PublishableEntityTypeEnum,
    entityId: z.string().uuid('Invalid entity ID format'),
    scheduledAt: z.string().datetime({ message: 'Invalid ISO datetime format' }),
  })
  .refine(
    (data) => {
      const scheduledDate = new Date(data.scheduledAt);
      return scheduledDate.getTime() > Date.now();
    },
    {
      message: 'Scheduled publication time must be in the future.',
      path: ['scheduledAt'],
    }
  );

export type SchedulePublicationInput = z.infer<typeof SchedulePublicationSchema>;

export const PublishNowSchema = z.object({
  entityType: PublishableEntityTypeEnum,
  entityId: z.string().uuid('Invalid entity ID format'),
});

export type PublishNowInput = z.infer<typeof PublishNowSchema>;

export const UnpublishSchema = z.object({
  entityType: PublishableEntityTypeEnum,
  entityId: z.string().uuid('Invalid entity ID format'),
});

export type UnpublishInput = z.infer<typeof UnpublishSchema>;

export const ArchivePublicationSchema = z.object({
  entityType: PublishableEntityTypeEnum,
  entityId: z.string().uuid('Invalid entity ID format'),
});

export type ArchivePublicationInput = z.infer<typeof ArchivePublicationSchema>;

export const RestorePublicationSchema = z.object({
  entityType: PublishableEntityTypeEnum,
  entityId: z.string().uuid('Invalid entity ID format'),
});

export type RestorePublicationInput = z.infer<typeof RestorePublicationSchema>;

export const ChangeVisibilitySchema = z.object({
  entityType: PublishableEntityTypeEnum,
  entityId: z.string().uuid('Invalid entity ID format'),
  visibility: VisibilityEnum,
});

export type ChangeVisibilityInput = z.infer<typeof ChangeVisibilitySchema>;

export const PublishingListFilterSchema = z.object({
  status: z.string().optional(),
  entityType: PublishableEntityTypeEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PublishingListFilterInput = z.infer<typeof PublishingListFilterSchema>;
