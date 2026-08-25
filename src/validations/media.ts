import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const MediaFormSchema = z.object({
  altText: z.string().max(255).optional(),
  caption: z.string().optional(),
});

export type MediaFormInput = z.infer<typeof MediaFormSchema>;
