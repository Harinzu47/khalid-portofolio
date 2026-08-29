import { z } from 'zod';
import { MEDIA_KINDS, ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_BYTES, MAX_DOCUMENT_SIZE_BYTES } from '@/domain/media';
import { VisibilityEnum } from './taxonomy';

export { ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_BYTES, MAX_DOCUMENT_SIZE_BYTES };

export const MediaKindEnum = z.enum(MEDIA_KINDS);

export const MediaFormSchema = z.object({
  altText: z.string().max(255, 'Alt text must be under 255 characters').optional().nullable(),
  caption: z.string().max(1000, 'Caption must be under 1000 characters').optional().nullable(),
  visibility: VisibilityEnum.default('private'),
});

export type MediaFormInput = z.infer<typeof MediaFormSchema>;

export const UpdateMediaMetadataSchema = z.object({
  mediaId: z.string().uuid('Invalid media ID format'),
  altText: z.string().max(255, 'Alt text must be under 255 characters').optional().nullable(),
  caption: z.string().max(1000, 'Caption must be under 1000 characters').optional().nullable(),
  visibility: VisibilityEnum.optional(),
});

export type UpdateMediaMetadataInput = z.infer<typeof UpdateMediaMetadataSchema>;

export const MediaFilterSchema = z.object({
  mediaKind: MediaKindEnum.optional(),
  visibility: VisibilityEnum.optional(),
  archived: z.enum(['active', 'archived', 'all']).default('active'),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export type MediaFilterInput = z.infer<typeof MediaFilterSchema>;

export const AttachProjectMediaSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  mediaId: z.string().uuid('Invalid media ID'),
  isCover: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export type AttachProjectMediaInput = z.infer<typeof AttachProjectMediaSchema>;

export const ReorderProjectMediaSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  mediaIds: z.array(z.string().uuid('Invalid media ID')).min(1, 'Must provide at least one media ID'),
  coverMediaId: z.string().uuid('Invalid cover media ID').optional().nullable(),
});

export type ReorderProjectMediaInput = z.infer<typeof ReorderProjectMediaSchema>;
