'use server';

import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { actionOk, fromError, type ActionResult } from '@/lib/action-result';
import {
  CreateRelationshipSchema,
  UpdateRelationshipMetadataSchema,
  RelationshipCandidateSearchSchema,
} from '@/validations/relationship';
import { RelationshipService } from '@/services/relationship.service';
import type {
  RelationshipEditorDTO,
  RelationshipListItemDTO,
  RelationshipTypeDTO,
  RelationshipCandidateDTO,
  RelationshipHealthSummaryDTO,
  EntityRelationshipsDTO,
} from '@/types/dtos';
import type { CanonicalEntityType } from '@/domain/relationships';

/**
 * Creates a semantic relationship edge.
 */
export async function createRelationshipAction(
  rawInput: unknown
): Promise<ActionResult<RelationshipEditorDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = CreateRelationshipSchema.parse(rawInput);

    const result = await RelationshipService.createRelationship(
      session.userId,
      validated,
      session.userId
    );

    revalidatePath('/admin/relationships');
    revalidatePath(`/admin/${validated.sourceType.toLowerCase()}s`);
    revalidatePath(`/admin/${validated.targetType.toLowerCase()}s`);

    return actionOk(result);
  } catch (error) {
    return fromError(error);
  }
}

/**
 * Updates relationship metadata (description, sortOrder, visibility).
 * Enforces identity immutability (Amendment 16).
 */
export async function updateRelationshipMetadataAction(
  id: string,
  rawInput: unknown
): Promise<ActionResult<RelationshipEditorDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = UpdateRelationshipMetadataSchema.parse(rawInput);

    const result = await RelationshipService.updateRelationshipMetadata(
      session.userId,
      id,
      validated,
      session.userId
    );

    revalidatePath('/admin/relationships');
    return actionOk(result);
  } catch (error) {
    return fromError(error);
  }
}

/**
 * Archives a relationship edge (idempotent, Amendment 2).
 */
export async function archiveRelationshipAction(id: string): Promise<ActionResult<void>> {
  try {
    const session = await requireOwnerSession();
    await RelationshipService.archiveRelationship(session.userId, id, session.userId);

    revalidatePath('/admin/relationships');
    return actionOk(undefined);
  } catch (error) {
    return fromError(error);
  }
}

/**
 * Retrieves incoming and outgoing relationships for a specific entity.
 */
export async function getRelationshipsForEntityAction(
  entityType: CanonicalEntityType,
  entityId: string
): Promise<ActionResult<EntityRelationshipsDTO>> {
  try {
    const session = await requireOwnerSession();
    const result = await RelationshipService.listRelationshipsForEntity(
      session.userId,
      entityType,
      entityId
    );
    return actionOk(result);
  } catch (error) {
    return fromError(error);
  }
}

/**
 * Global configuration query: compatible relationship types.
 */
export async function getCompatibleRelationshipTypesAction(
  sourceType: CanonicalEntityType,
  targetType?: CanonicalEntityType
): Promise<ActionResult<RelationshipTypeDTO[]>> {
  try {
    await requireOwnerSession();
    const result = await RelationshipService.getCompatibleRelationshipTypes(sourceType, targetType);
    return actionOk(result);
  } catch (error) {
    return fromError(error);
  }
}

/**
 * Global configuration query: compatible target types.
 */
export async function getCompatibleTargetTypesAction(
  sourceType: CanonicalEntityType,
  relationshipTypeId: string
): Promise<ActionResult<CanonicalEntityType[]>> {
  try {
    await requireOwnerSession();
    const result = await RelationshipService.getCompatibleTargetTypes(
      sourceType,
      relationshipTypeId
    );
    return actionOk(result);
  } catch (error) {
    return fromError(error);
  }
}

/**
 * Searches candidate target entities with source compatibility pre-validation (Amendment 14).
 */
export async function searchRelationshipCandidatesAction(
  rawInput: unknown
): Promise<ActionResult<RelationshipCandidateDTO[]>> {
  try {
    const session = await requireOwnerSession();
    const validated = RelationshipCandidateSearchSchema.parse(rawInput);

    const result = await RelationshipService.searchCandidates(session.userId, validated);
    return actionOk(result);
  } catch (error) {
    return fromError(error);
  }
}

/**
 * Retrieves relationship health diagnostics summary (Amendment 24).
 */
export async function getRelationshipHealthAction(): Promise<
  ActionResult<RelationshipHealthSummaryDTO>
> {
  try {
    const session = await requireOwnerSession();
    const result = await RelationshipService.getRelationshipHealth(session.userId);
    return actionOk(result);
  } catch (error) {
    return fromError(error);
  }
}
