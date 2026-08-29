import { z } from 'zod';
import { CANONICAL_ENTITY_TYPES } from '@/domain/relationships';

export const CanonicalEntityTypeEnum = z.enum(CANONICAL_ENTITY_TYPES);

const VisibilityEnum = z.enum(['private', 'unlisted', 'public']);

/**
 * Validates relationship creation input (Amendment 14).
 */
export const CreateRelationshipSchema = z
  .object({
    relationshipTypeId: z.string().uuid('Invalid relationship type ID'),
    sourceType: CanonicalEntityTypeEnum,
    sourceId: z.string().uuid('Invalid source entity ID'),
    targetType: CanonicalEntityTypeEnum,
    targetId: z.string().uuid('Invalid target entity ID'),
    description: z.string().max(500, 'Description must be under 500 characters').optional().nullable(),
    visibility: VisibilityEnum.default('private'),
    sortOrder: z.coerce.number().int().default(0),
  })
  .refine(
    (data) => !(data.sourceType === data.targetType && data.sourceId === data.targetId),
    {
      message: 'Self-referencing relationships (same source and target) are prohibited.',
      path: ['targetId'],
    }
  );

export type CreateRelationshipInput = z.input<typeof CreateRelationshipSchema>;

/**
 * Validates relationship metadata updates (Amendment 16: identity is strictly immutable).
 */
export const UpdateRelationshipMetadataSchema = z.object({
  description: z.string().max(500, 'Description must be under 500 characters').optional().nullable(),
  visibility: VisibilityEnum.optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export type UpdateRelationshipMetadataInput = z.infer<typeof UpdateRelationshipMetadataSchema>;

/**
 * Validates candidate search with source context verification (Amendment 14).
 */
export const RelationshipCandidateSearchSchema = z.object({
  sourceType: CanonicalEntityTypeEnum,
  sourceId: z.string().uuid('Invalid source entity ID'),
  relationshipTypeId: z.string().uuid('Invalid relationship type ID'),
  targetType: CanonicalEntityTypeEnum,
  query: z.string().optional().default(''),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type RelationshipCandidateSearchInput = z.infer<typeof RelationshipCandidateSearchSchema>;
