import { db } from '@/db/client';
import {
  knowledgeRelationships,
  relationshipTypes,
  relationshipTypeCompatibility,
} from '@/db/schema';
import { eq, and, sql, isNull, inArray } from 'drizzle-orm';
import {
  AppError,
  NotFoundError,
  RelationshipInvalidError,
  RelationshipDuplicateError,
  RelationshipIncompatibleError,
} from '@/lib/errors';
import { AuditService } from '@/services/audit.service';
import { EntityResolverService } from '@/services/entity-resolver.service';
import {
  type CanonicalEntityType,
  type CanonicalRelationshipTypeCode,
  RELATIONSHIP_INVERSE_LABELS,
  PROHIBITED_SEMANTIC_EDGES,
} from '@/domain/relationships';
import type {
  RelationshipTypeDTO,
  RelationshipEndpointDTO,
  RelationshipListItemDTO,
  RelationshipEditorDTO,
  RelationshipCandidateDTO,
  RelationshipHealthSummaryDTO,
  RelationshipHealthIssueDTO,
  EntityRelationshipsDTO,
} from '@/types/dtos';
import type {
  CreateRelationshipInput,
  UpdateRelationshipMetadataInput,
  RelationshipCandidateSearchInput,
} from '@/validations/relationship';

export class RelationshipService {
  /**
   * 1. Lists all active incoming and outgoing semantic relationships for an entity.
   */
  static async listRelationshipsForEntity(
    ownerId: string,
    entityType: CanonicalEntityType,
    entityId: string,
    executor: any = db
  ): Promise<EntityRelationshipsDTO> {
    // Verify source entity exists and belongs to owner
    await EntityResolverService.resolveOwnerEntity(ownerId, entityType, entityId, executor);

    // Outgoing edges: source is this entity
    const outgoingRows = await executor.query.knowledgeRelationships.findMany({
      where: and(
        eq(knowledgeRelationships.ownerId, ownerId),
        eq(knowledgeRelationships.sourceType, entityType),
        eq(knowledgeRelationships.sourceId, entityId),
        eq(knowledgeRelationships.status, 'active')
      ),
      with: {
        relationshipType: true,
      },
      orderBy: (t: any, { asc }: any) => [asc(t.sortOrder), asc(t.createdAt)],
    });

    // Incoming edges: target is this entity
    const incomingRows = await executor.query.knowledgeRelationships.findMany({
      where: and(
        eq(knowledgeRelationships.ownerId, ownerId),
        eq(knowledgeRelationships.targetType, entityType),
        eq(knowledgeRelationships.targetId, entityId),
        eq(knowledgeRelationships.status, 'active')
      ),
      with: {
        relationshipType: true,
      },
      orderBy: (t: any, { asc }: any) => [asc(t.sortOrder), asc(t.createdAt)],
    });

    // Map to DTOs with resolved endpoints
    const outgoing = await Promise.all(
      outgoingRows.map((row: any) => this.mapToListItemDTO(ownerId, row, executor))
    );

    const incoming = await Promise.all(
      incomingRows.map((row: any) => this.mapToListItemDTO(ownerId, row, executor))
    );

    return {
      outgoing: outgoing.filter((item): item is RelationshipListItemDTO => item !== null),
      incoming: incoming.filter((item): item is RelationshipListItemDTO => item !== null),
    };
  }

  /**
   * 2. Retrieves a single relationship by ID with full editor projection.
   */
  static async getRelationshipById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<RelationshipEditorDTO> {
    const row = await executor.query.knowledgeRelationships.findFirst({
      where: and(
        eq(knowledgeRelationships.id, id),
        eq(knowledgeRelationships.ownerId, ownerId)
      ),
      with: {
        relationshipType: true,
      },
    });

    if (!row) {
      throw new NotFoundError('KnowledgeRelationship', id);
    }

    const source = await EntityResolverService.resolveOwnerEntity(
      ownerId,
      row.sourceType as CanonicalEntityType,
      row.sourceId,
      executor
    );

    const target = await EntityResolverService.resolveOwnerEntity(
      ownerId,
      row.targetType as CanonicalEntityType,
      row.targetId,
      executor
    );

    const code = row.relationshipType.code as CanonicalRelationshipTypeCode;

    return {
      id: row.id,
      relationshipTypeId: row.relationshipTypeId,
      relationshipTypeCode: code,
      relationshipTypeName: row.relationshipType.name,
      inverseLabel: row.relationshipType.inverseLabel || RELATIONSHIP_INVERSE_LABELS[code] || 'Related',
      sourceType: row.sourceType as CanonicalEntityType,
      sourceId: row.sourceId,
      source: {
        id: source.id,
        entityType: source.entityType,
        label: source.label,
        slug: source.slug,
        visibility: source.visibility,
        publicationStatus: source.publicationStatus,
        isArchived: source.isArchived,
        typeCategory: source.typeCategory,
      },
      targetType: row.targetType as CanonicalEntityType,
      targetId: row.targetId,
      target: {
        id: target.id,
        entityType: target.entityType,
        label: target.label,
        slug: target.slug,
        visibility: target.visibility,
        publicationStatus: target.publicationStatus,
        isArchived: target.isArchived,
        typeCategory: target.typeCategory,
      },
      description: row.description,
      sortOrder: row.sortOrder,
      visibility: row.visibility,
      status: row.status,
      archivedAt: row.archivedAt?.toISOString() || null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * 3. Creates a new semantic relationship edge with strict invariant validations.
   */
  static async createRelationship(
    ownerId: string,
    input: CreateRelationshipInput,
    actorId?: string,
    executor: any = db
  ): Promise<RelationshipEditorDTO> {
    // 1. Resolve source and target (ensures both exist and belong to authenticated owner)
    const source = await EntityResolverService.resolveOwnerEntity(
      ownerId,
      input.sourceType,
      input.sourceId,
      executor
    );
    const target = await EntityResolverService.resolveOwnerEntity(
      ownerId,
      input.targetType,
      input.targetId,
      executor
    );

    // 2. Reject self-edges (Amendment 19)
    if (input.sourceType === input.targetType && input.sourceId === input.targetId) {
      throw new RelationshipInvalidError('Self-referencing relationships (source == target) are prohibited.');
    }

    // 3. Load relationship type
    const relType = await executor.query.relationshipTypes.findFirst({
      where: eq(relationshipTypes.id, input.relationshipTypeId),
    });

    if (!relType || !relType.isActive) {
      throw new RelationshipInvalidError('The selected relationship type does not exist or is inactive.');
    }

    const typeCode = relType.code as CanonicalRelationshipTypeCode;

    // 4. Structural vs Semantic Non-Duplication Guard (Amendment 11)
    const isProhibited = PROHIBITED_SEMANTIC_EDGES.some(
      (p) =>
        p.relationshipTypeCode === typeCode &&
        p.sourceType === input.sourceType &&
        p.targetType === input.targetType
    );
    if (isProhibited) {
      throw new RelationshipInvalidError(
        `Creating semantic edge ${input.sourceType} --${typeCode}--> ${input.targetType} is prohibited because canonical structural storage exists for this relationship.`
      );
    }

    // 5. Validate compatibility matrix (Amendment 10)
    const compat = await executor.query.relationshipTypeCompatibility.findFirst({
      where: and(
        eq(relationshipTypeCompatibility.relationshipTypeId, relType.id),
        eq(relationshipTypeCompatibility.sourceType, input.sourceType),
        eq(relationshipTypeCompatibility.targetType, input.targetType)
      ),
    });

    if (!compat) {
      throw new RelationshipIncompatibleError(
        `Relationship type "${relType.name}" is incompatible with source ${input.sourceType} and target ${input.targetType}.`
      );
    }

    // 6. Check duplicate active edge (Amendment 20)
    const existingActive = await executor.query.knowledgeRelationships.findFirst({
      where: and(
        eq(knowledgeRelationships.ownerId, ownerId),
        eq(knowledgeRelationships.relationshipTypeId, relType.id),
        eq(knowledgeRelationships.sourceType, input.sourceType),
        eq(knowledgeRelationships.sourceId, input.sourceId),
        eq(knowledgeRelationships.targetType, input.targetType),
        eq(knowledgeRelationships.targetId, input.targetId),
        eq(knowledgeRelationships.status, 'active')
      ),
    });

    if (existingActive) {
      throw new RelationshipDuplicateError(
        `An active "${relType.name}" relationship between this source and target already exists.`
      );
    }

    // 7. Bounded cycle detection for BUILDS_ON (Amendment 4)
    if (typeCode === 'BUILDS_ON') {
      const wouldCycle = await this.detectBuildsOnCycle(
        ownerId,
        input.targetType,
        input.targetId,
        input.sourceType,
        input.sourceId,
        executor
      );
      if (wouldCycle) {
        throw new RelationshipInvalidError(
          'Adding this BUILDS_ON edge would create a cyclic dependency graph.'
        );
      }
    }

    // 8. Insert edge into knowledge_relationships (Amendment 1: default visibility = private, status = active)
    const [created] = await executor
      .insert(knowledgeRelationships)
      .values({
        ownerId,
        relationshipTypeId: relType.id,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        targetType: input.targetType,
        targetId: input.targetId,
        description: input.description?.trim() || null,
        sortOrder: input.sortOrder ?? 0,
        visibility: input.visibility ?? 'private',
        status: 'active',
        archivedAt: null,
      })
      .returning();

    // 9. Write audit record within same transaction (Amendment 19)
    await AuditService.record(executor, {
      action: 'CREATE',
      entityType: 'knowledge_relationships',
      entityId: created.id,
      actorId: actorId || ownerId,
      newValues: {
        relationshipTypeCode: typeCode,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        targetType: input.targetType,
        targetId: input.targetId,
        visibility: created.visibility,
      },
    });

    return {
      id: created.id,
      relationshipTypeId: relType.id,
      relationshipTypeCode: typeCode,
      relationshipTypeName: relType.name,
      inverseLabel: relType.inverseLabel || RELATIONSHIP_INVERSE_LABELS[typeCode] || 'Related',
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      source: {
        id: source.id,
        entityType: source.entityType,
        label: source.label,
        slug: source.slug,
        visibility: source.visibility,
        publicationStatus: source.publicationStatus,
        isArchived: source.isArchived,
        typeCategory: source.typeCategory,
      },
      targetType: input.targetType,
      targetId: input.targetId,
      target: {
        id: target.id,
        entityType: target.entityType,
        label: target.label,
        slug: target.slug,
        visibility: target.visibility,
        publicationStatus: target.publicationStatus,
        isArchived: target.isArchived,
        typeCategory: target.typeCategory,
      },
      description: created.description,
      sortOrder: created.sortOrder,
      visibility: created.visibility,
      status: created.status,
      archivedAt: null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  /**
   * 4. Updates relationship metadata (description, sortOrder, visibility).
   * Enforces immutability of source, target, and relationshipType (Amendment 16, 17).
   */
  static async updateRelationshipMetadata(
    ownerId: string,
    id: string,
    input: UpdateRelationshipMetadataInput,
    actorId?: string,
    executor: any = db
  ): Promise<RelationshipEditorDTO> {
    const existing = await executor.query.knowledgeRelationships.findFirst({
      where: and(
        eq(knowledgeRelationships.id, id),
        eq(knowledgeRelationships.ownerId, ownerId)
      ),
      with: {
        relationshipType: true,
      },
    });

    if (!existing) {
      throw new NotFoundError('KnowledgeRelationship', id);
    }

    const updates: Partial<typeof knowledgeRelationships.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.description !== undefined) {
      updates.description = input.description?.trim() || null;
    }
    if (input.visibility !== undefined) {
      updates.visibility = input.visibility;
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }

    const [updated] = await executor
      .update(knowledgeRelationships)
      .set(updates)
      .where(and(eq(knowledgeRelationships.id, id), eq(knowledgeRelationships.ownerId, ownerId)))
      .returning();

    await AuditService.record(executor, {
      action: 'UPDATE',
      entityType: 'knowledge_relationships',
      entityId: id,
      actorId: actorId || ownerId,
      newValues: { updates },
    });

    return this.getRelationshipById(ownerId, id, executor);
  }

  /**
   * 5. Archives a semantic relationship (idempotent, Amendment 2).
   */
  static async archiveRelationship(
    ownerId: string,
    id: string,
    actorId?: string,
    executor: any = db
  ): Promise<void> {
    const existing = await executor.query.knowledgeRelationships.findFirst({
      where: and(
        eq(knowledgeRelationships.id, id),
        eq(knowledgeRelationships.ownerId, ownerId)
      ),
      with: {
        relationshipType: true,
      },
    });

    if (!existing) {
      throw new NotFoundError('KnowledgeRelationship', id);
    }

    // Idempotent check (Amendment 2)
    if (existing.status === 'archived' && existing.archivedAt) {
      return;
    }

    await executor
      .update(knowledgeRelationships)
      .set({
        status: 'archived',
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(knowledgeRelationships.id, id), eq(knowledgeRelationships.ownerId, ownerId)));

    await AuditService.record(executor, {
      action: 'ARCHIVE',
      entityType: 'knowledge_relationships',
      entityId: id,
      actorId: actorId || ownerId,
      newValues: {
        relationshipTypeCode: existing.relationshipType.code,
        sourceType: existing.sourceType,
        targetType: existing.targetType,
      },
    });
  }

  /**
   * 6. Global configuration query: retrieves compatible relationship types.
   * Pure config query, no ownerId required (Amendment 12).
   */
  static async getCompatibleRelationshipTypes(
    sourceType: CanonicalEntityType,
    targetType?: CanonicalEntityType,
    executor: any = db
  ): Promise<RelationshipTypeDTO[]> {
    const whereConditions = [
      eq(relationshipTypeCompatibility.sourceType, sourceType),
      eq(relationshipTypes.isActive, true),
    ];

    if (targetType) {
      whereConditions.push(eq(relationshipTypeCompatibility.targetType, targetType));
    }

    const rows = await executor
      .select({
        id: relationshipTypes.id,
        code: relationshipTypes.code,
        name: relationshipTypes.name,
        category: relationshipTypes.category,
        inverseLabel: relationshipTypes.inverseLabel,
        description: relationshipTypes.description,
        directionality: relationshipTypes.directionality,
        isPublicEligible: relationshipTypes.isPublicEligible,
        isActive: relationshipTypes.isActive,
      })
      .from(relationshipTypes)
      .innerJoin(
        relationshipTypeCompatibility,
        eq(relationshipTypes.id, relationshipTypeCompatibility.relationshipTypeId)
      )
      .where(and(...whereConditions));

    // Deduplicate by ID
    const map = new Map<string, RelationshipTypeDTO>();
    for (const r of rows) {
      if (!map.has(r.id)) {
        map.set(r.id, {
          id: r.id,
          code: r.code as CanonicalRelationshipTypeCode,
          name: r.name,
          category: r.category,
          inverseLabel: r.inverseLabel || RELATIONSHIP_INVERSE_LABELS[r.code as CanonicalRelationshipTypeCode] || 'Related',
          description: r.description,
          directionality: r.directionality,
          isPublicEligible: r.isPublicEligible,
          isActive: r.isActive,
        });
      }
    }

    return Array.from(map.values());
  }

  /**
   * 7. Global configuration query: retrieves compatible target entity types for a source + relationship type.
   * Pure config query (Amendment 12).
   */
  static async getCompatibleTargetTypes(
    sourceType: CanonicalEntityType,
    relationshipTypeId: string,
    executor: any = db
  ): Promise<CanonicalEntityType[]> {
    const rows = await executor
      .select({ targetType: relationshipTypeCompatibility.targetType })
      .from(relationshipTypeCompatibility)
      .where(
        and(
          eq(relationshipTypeCompatibility.relationshipTypeId, relationshipTypeId),
          eq(relationshipTypeCompatibility.sourceType, sourceType)
        )
      );

    return rows.map((r: any) => r.targetType as CanonicalEntityType);
  }

  /**
   * 8. Searches candidate target entities with source compatibility pre-validation (Amendment 14).
   */
  static async searchCandidates(
    ownerId: string,
    input: RelationshipCandidateSearchInput,
    executor: any = db
  ): Promise<RelationshipCandidateDTO[]> {
    // 1. Verify source existence & ownership
    await EntityResolverService.resolveOwnerEntity(
      ownerId,
      input.sourceType,
      input.sourceId,
      executor
    );

    // 2. Verify targetType is compatible with (sourceType, relationshipTypeId)
    const allowedTargets = await this.getCompatibleTargetTypes(
      input.sourceType,
      input.relationshipTypeId,
      executor
    );

    if (!allowedTargets.includes(input.targetType)) {
      throw new RelationshipIncompatibleError(
        `Target type ${input.targetType} is not compatible with the selected relationship type and source ${input.sourceType}.`
      );
    }

    // 3. Search owner candidates, excluding source entity if self-edge would be invalid (Amendment 15)
    return EntityResolverService.searchOwnerCandidates(
      ownerId,
      input.targetType,
      input.query,
      input.sourceType === input.targetType ? input.sourceId : undefined,
      input.limit,
      executor
    );
  }

  /**
   * 9. Relationship health diagnostics (Amendment 23 & 24).
   * Identifies real integrity issues without mutating data or computing fake percentages.
   */
  static async getRelationshipHealth(
    ownerId: string,
    executor: any = db
  ): Promise<RelationshipHealthSummaryDTO> {
    const allEdges = await executor.query.knowledgeRelationships.findMany({
      where: eq(knowledgeRelationships.ownerId, ownerId),
      with: {
        relationshipType: true,
      },
    });

    const activeEdges = allEdges.filter((e: any) => e.status === 'active');
    const archivedEdges = allEdges.filter((e: any) => e.status === 'archived');
    const issues: RelationshipHealthIssueDTO[] = [];

    for (const edge of activeEdges) {
      let sourceEntity: any = null;
      let targetEntity: any = null;

      // 1. Verify source
      try {
        sourceEntity = await EntityResolverService.resolveOwnerEntity(
          ownerId,
          edge.sourceType as CanonicalEntityType,
          edge.sourceId,
          executor
        );
      } catch {
        issues.push({
          relationshipId: edge.id,
          relationshipTypeCode: edge.relationshipType?.code || 'UNKNOWN',
          severity: 'error',
          issueCode: 'MISSING_ENDPOINT',
          message: `Source entity (${edge.sourceType}:${edge.sourceId}) is missing or inaccessible.`,
          source: { entityType: edge.sourceType, id: edge.sourceId },
          target: { entityType: edge.targetType, id: edge.targetId },
        });
      }

      // 2. Verify target
      try {
        targetEntity = await EntityResolverService.resolveOwnerEntity(
          ownerId,
          edge.targetType as CanonicalEntityType,
          edge.targetId,
          executor
        );
      } catch {
        issues.push({
          relationshipId: edge.id,
          relationshipTypeCode: edge.relationshipType?.code || 'UNKNOWN',
          severity: 'error',
          issueCode: 'MISSING_ENDPOINT',
          message: `Target entity (${edge.targetType}:${edge.targetId}) is missing or inaccessible.`,
          source: { entityType: edge.sourceType, id: edge.sourceId, label: sourceEntity?.label },
          target: { entityType: edge.targetType, id: edge.targetId },
        });
      }

      // 3. Verify archived endpoints
      if (sourceEntity?.isArchived) {
        issues.push({
          relationshipId: edge.id,
          relationshipTypeCode: edge.relationshipType.code,
          severity: 'warning',
          issueCode: 'ARCHIVED_ENDPOINT',
          message: `Source entity "${sourceEntity.label}" is currently archived.`,
          source: { entityType: edge.sourceType, id: edge.sourceId, label: sourceEntity.label },
          target: { entityType: edge.targetType, id: edge.targetId, label: targetEntity?.label },
        });
      }

      if (targetEntity?.isArchived) {
        issues.push({
          relationshipId: edge.id,
          relationshipTypeCode: edge.relationshipType.code,
          severity: 'warning',
          issueCode: 'ARCHIVED_ENDPOINT',
          message: `Target entity "${targetEntity.label}" is currently archived.`,
          source: { entityType: edge.sourceType, id: edge.sourceId, label: sourceEntity?.label },
          target: { entityType: edge.targetType, id: edge.targetId, label: targetEntity.label },
        });
      }

      // 4. Verify public privacy mismatch (edge is public, but an endpoint is private/draft)
      if (edge.visibility === 'public') {
        const sourcePrivate = sourceEntity && sourceEntity.visibility !== 'public';
        const targetPrivate = targetEntity && targetEntity.visibility !== 'public';
        if (sourcePrivate || targetPrivate) {
          issues.push({
            relationshipId: edge.id,
            relationshipTypeCode: edge.relationshipType.code,
            severity: 'warning',
            issueCode: 'PUBLIC_PRIVACY_MISMATCH',
            message: 'Relationship edge is marked public, but one or both endpoints are private.',
            source: { entityType: edge.sourceType, id: edge.sourceId, label: sourceEntity?.label },
            target: { entityType: edge.targetType, id: edge.targetId, label: targetEntity?.label },
          });
        }
      }
    }

    return {
      totalActive: activeEdges.length,
      totalArchived: archivedEdges.length,
      totalIssues: issues.length,
      issues,
    };
  }

  /**
   * 10. Public Graph Traversal Query Boundary (Amendments 5, 6, 25, 26, 27, 28).
   * Strictly enforces PUBLIC (source) + PUBLIC (target) + PUBLIC (edge) rule.
   * Excludes unlisted entities, drafts, and archived records. Bounded depth.
   */
  static async getPublicRelationshipsForEntity(
    entityType: CanonicalEntityType,
    entityId: string,
    depth: number = 1,
    executor: any = db
  ): Promise<RelationshipListItemDTO[]> {
    // Clamp depth: min 1, max 2 (Amendment 27)
    const clampedDepth = Math.max(1, Math.min(depth, 2));

    // 1. Verify root entity public eligibility
    const rootPublic = await EntityResolverService.resolvePublicEntity(entityType, entityId, executor);
    if (!rootPublic) {
      return [];
    }

    const visitedNodes = new Set<string>();
    visitedNodes.add(`${entityType}:${entityId}`);

    const results: RelationshipListItemDTO[] = [];
    let currentQueue: Array<{ entityType: CanonicalEntityType; entityId: string }> = [
      { entityType, entityId },
    ];

    for (let d = 0; d < clampedDepth; d++) {
      if (currentQueue.length === 0) break;
      const nextQueue: Array<{ entityType: CanonicalEntityType; entityId: string }> = [];

      for (const node of currentQueue) {
        // Query active, public edges originating from or pointing to this node
        const edges = await executor.query.knowledgeRelationships.findMany({
          where: and(
            eq(knowledgeRelationships.visibility, 'public'),
            eq(knowledgeRelationships.status, 'active'),
            sql`(${knowledgeRelationships.sourceType} = ${node.entityType} AND ${knowledgeRelationships.sourceId} = ${node.entityId}) OR (${knowledgeRelationships.targetType} = ${node.entityType} AND ${knowledgeRelationships.targetId} = ${node.entityId})`
          ),
          with: {
            relationshipType: true,
          },
        });

        for (const edge of edges) {
          if (!edge.relationshipType?.isPublicEligible || !edge.relationshipType?.isActive) {
            continue;
          }

          // Resolve both endpoints with public eligibility checks
          const sourcePublic = await EntityResolverService.resolvePublicEntity(
            edge.sourceType as CanonicalEntityType,
            edge.sourceId,
            executor
          );
          const targetPublic = await EntityResolverService.resolvePublicEntity(
            edge.targetType as CanonicalEntityType,
            edge.targetId,
            executor
          );

          // Both endpoints MUST pass public eligibility (Amendment 25)
          if (!sourcePublic || !targetPublic) {
            continue;
          }

          const relCode = edge.relationshipType.code as CanonicalRelationshipTypeCode;
          const dto: RelationshipListItemDTO = {
            id: edge.id,
            relationshipType: {
              id: edge.relationshipType.id,
              code: relCode,
              name: edge.relationshipType.name,
              category: edge.relationshipType.category,
              inverseLabel: edge.relationshipType.inverseLabel || RELATIONSHIP_INVERSE_LABELS[relCode] || 'Related',
            },
            source: sourcePublic,
            target: targetPublic,
            description: edge.description,
            sortOrder: edge.sortOrder,
            visibility: edge.visibility,
            status: edge.status,
            createdAt: edge.createdAt.toISOString(),
          };

          // Deduplicate edges
          if (!results.some((r) => r.id === edge.id)) {
            results.push(dto);
          }

          // Enqueue neighbor node if not visited
          const neighborKey =
            edge.sourceId === node.entityId
              ? `${edge.targetType}:${edge.targetId}`
              : `${edge.sourceType}:${edge.sourceId}`;

          if (!visitedNodes.has(neighborKey)) {
            visitedNodes.add(neighborKey);
            if (edge.sourceId === node.entityId) {
              nextQueue.push({
                entityType: edge.targetType as CanonicalEntityType,
                entityId: edge.targetId,
              });
            } else {
              nextQueue.push({
                entityType: edge.sourceType as CanonicalEntityType,
                entityId: edge.sourceId,
              });
            }
          }
        }
      }

      currentQueue = nextQueue;
    }

    return results;
  }

  /**
   * Helper: Bounded cycle detector for BUILDS_ON (Amendment 4).
   * Checks if targetId can reach sourceId through BUILDS_ON edges alone (max depth 6).
   */
  private static async detectBuildsOnCycle(
    ownerId: string,
    currentType: string,
    currentId: string,
    targetType: string,
    targetId: string,
    executor: any
  ): Promise<boolean> {
    if (currentType === targetType && currentId === targetId) {
      return true;
    }

    const visited = new Set<string>();
    visited.add(`${currentType}:${currentId}`);

    let queue = [{ type: currentType, id: currentId }];
    let depth = 0;

    while (queue.length > 0 && depth < 6) {
      depth++;
      const nextQueue: typeof queue = [];

      for (const node of queue) {
        const outgoingBuildsOn = await executor.query.knowledgeRelationships.findMany({
          where: and(
            eq(knowledgeRelationships.ownerId, ownerId),
            eq(knowledgeRelationships.sourceType, node.type),
            eq(knowledgeRelationships.sourceId, node.id),
            eq(knowledgeRelationships.status, 'active')
          ),
          with: {
            relationshipType: true,
          },
        });

        for (const edge of outgoingBuildsOn) {
          if (edge.relationshipType?.code !== 'BUILDS_ON') continue;

          if (edge.targetType === targetType && edge.targetId === targetId) {
            return true;
          }

          const key = `${edge.targetType}:${edge.targetId}`;
          if (!visited.has(key)) {
            visited.add(key);
            nextQueue.push({ type: edge.targetType, id: edge.targetId });
          }
        }
      }

      queue = nextQueue;
    }

    return false;
  }

  /**
   * Helper: Maps raw relationship row to RelationshipListItemDTO.
   */
  private static async mapToListItemDTO(
    ownerId: string,
    row: any,
    executor: any
  ): Promise<RelationshipListItemDTO | null> {
    try {
      const source = await EntityResolverService.resolveOwnerEntity(
        ownerId,
        row.sourceType as CanonicalEntityType,
        row.sourceId,
        executor
      );
      const target = await EntityResolverService.resolveOwnerEntity(
        ownerId,
        row.targetType as CanonicalEntityType,
        row.targetId,
        executor
      );

      const code = row.relationshipType.code as CanonicalRelationshipTypeCode;

      return {
        id: row.id,
        relationshipType: {
          id: row.relationshipType.id,
          code,
          name: row.relationshipType.name,
          category: row.relationshipType.category,
          inverseLabel: row.relationshipType.inverseLabel || RELATIONSHIP_INVERSE_LABELS[code] || 'Related',
        },
        source: {
          id: source.id,
          entityType: source.entityType,
          label: source.label,
          slug: source.slug,
          visibility: source.visibility,
          publicationStatus: source.publicationStatus,
          isArchived: source.isArchived,
          typeCategory: source.typeCategory,
        },
        target: {
          id: target.id,
          entityType: target.entityType,
          label: target.label,
          slug: target.slug,
          visibility: target.visibility,
          publicationStatus: target.publicationStatus,
          isArchived: target.isArchived,
          typeCategory: target.typeCategory,
        },
        description: row.description,
        sortOrder: row.sortOrder,
        visibility: row.visibility,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      };
    } catch {
      return null;
    }
  }
}
