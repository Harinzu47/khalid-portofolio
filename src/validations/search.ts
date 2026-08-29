import { z } from 'zod';
import { SEARCHABLE_ENTITY_TYPES, type SearchableEntityType } from '@/domain/search';

export const SearchSortSchema = z.enum([
  'RELEVANCE',
  'NEWEST',
  'OLDEST',
  'RECENTLY_UPDATED',
  'TITLE',
]);

export const PublicKnowledgeSearchSchema = z.object({
  q: z.string().max(200).optional().default(''),
  type: z.enum(['ARTICLE', 'TECH_NOTE', 'ADR', 'JOURNAL_ENTRY']).optional(),
  domain: z.string().max(100).optional(),
  technology: z.string().max(100).optional(),
  skill: z.string().max(100).optional(),
  tag: z.string().max(100).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  sort: SearchSortSchema.optional().default('RELEVANCE'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type PublicKnowledgeSearchInput = z.input<typeof PublicKnowledgeSearchSchema>;
export type PublicKnowledgeSearchParsed = z.infer<typeof PublicKnowledgeSearchSchema>;

export const PublicWorkSearchSchema = z.object({
  q: z.string().max(200).optional().default(''),
  type: z.enum(['PROJECT', 'PROJECT_CASE_STUDY', 'EXPERIENCE']).optional(),
  domain: z.string().max(100).optional(),
  technology: z.string().max(100).optional(),
  skill: z.string().max(100).optional(),
  sort: SearchSortSchema.optional().default('RELEVANCE'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type PublicWorkSearchInput = z.input<typeof PublicWorkSearchSchema>;
export type PublicWorkSearchParsed = z.infer<typeof PublicWorkSearchSchema>;

export const OwnerGlobalSearchSchema = z.object({
  query: z.string().max(200).default(''),
  entityTypes: z.array(z.enum(SEARCHABLE_ENTITY_TYPES as unknown as [SearchableEntityType, ...SearchableEntityType[]])).optional(),
  includeArchived: z.boolean().optional().default(false),
  sort: SearchSortSchema.optional().default('RELEVANCE'),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type OwnerGlobalSearchInput = z.input<typeof OwnerGlobalSearchSchema>;
export type OwnerGlobalSearchParsed = z.infer<typeof OwnerGlobalSearchSchema>;

export const CommandPaletteSearchSchema = z.object({
  query: z.string().max(100).default(''),
  limit: z.number().int().min(1).max(30).optional().default(12),
});

export type CommandPaletteSearchInput = z.input<typeof CommandPaletteSearchSchema>;
export type CommandPaletteSearchParsed = z.infer<typeof CommandPaletteSearchSchema>;

export const EntityPickerSearchSchema = z.object({
  entityTypes: z.array(z.enum(SEARCHABLE_ENTITY_TYPES as unknown as [SearchableEntityType, ...SearchableEntityType[]])).min(1),
  query: z.string().max(100).default(''),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export type EntityPickerSearchInput = z.input<typeof EntityPickerSearchSchema>;
export type EntityPickerSearchParsed = z.infer<typeof EntityPickerSearchSchema>;
