import { z } from 'zod';

export const ProfileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(150),
  username: z.string().min(2, 'Username must be at least 2 characters').max(100),
  headline: z.string().max(255).optional(),
  bio: z.string().optional(),
  location: z.string().max(150).optional(),
  websiteUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  avatarPath: z.string().optional(),
  resumePath: z.string().optional(),
});

export type ProfileFormInput = z.infer<typeof ProfileFormSchema>;

export const SocialLinkFormSchema = z.object({
  id: z.string().uuid().optional(),
  platform: z.string().min(1, 'Platform is required').max(50),
  label: z.string().max(100).optional(),
  url: z.string().url('Invalid URL'),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

export type SocialLinkFormInput = z.infer<typeof SocialLinkFormSchema>;

export const DatabaseBackupSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  entities: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
});

export type DatabaseBackupData = z.infer<typeof DatabaseBackupSchema>;
