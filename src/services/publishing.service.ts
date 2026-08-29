import { db } from '@/db/client';
import {
  articles,
  notes,
  adrs,
  journalEntries,
  projects,
  projectCaseStudies,
  careerExperiences,
  learningPaths,
  roadmapItems,
  certificates,
  nowEntries,
  knowledgeRelationships,
  media,
  projectMedia,
} from '@/db/schema';
import { eq, and, sql, isNull, inArray } from 'drizzle-orm';
import { AppError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { SearchSyncService } from './search-sync.service';
import {
  PUBLISHABLE_ENTITY_TYPES,
  PUBLISHABLE_ENTITY_CAPABILITIES,
  ENTITY_READINESS_POLICIES,
  PUBLIC_ROUTE_NAMESPACES,
  isPublishableEntityType,
  isExposureIncreasing,
  isPubliclyDiscoverable,
  isDirectlyResolvable,
  getAllowedCommandsForStatus,
  getPublicRouteForEntity,
  type PublishableEntityType,
  type PublicationStatus,
  type Visibility,
  type PublicationIssue,
} from '@/domain/publishing';
import type {
  PublicationReadinessDTO,
  PublicImpactPreviewDTO,
  PublicationStateDTO,
  PublishingListItemDTO,
  PublishingOverviewDTO,
} from '@/types/dtos/publishing.dto';
import type { PublishingListFilterInput } from '@/validations/publishing';
import { revalidatePath } from 'next/cache';

export class PublishingService {
  /**
   * Evaluates publication readiness for an entity (Amendments 9, 10, 11, 12).
   * Stable issue codes, deterministic result.
   */
  static async getPublicationReadiness(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    executor: any = db
  ): Promise<PublicationReadinessDTO> {
    const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, executor);
    const issues = await this.evaluateReadinessForEntity(ownerId, entityType, rawEntity, executor);

    const hasErrors = issues.some((i) => i.severity === 'error');
    const hasWarnings = issues.some((i) => i.severity === 'warning');

    return {
      isReady: !hasErrors,
      hasErrors,
      hasWarnings,
      issues: issues.map((i) => ({
        code: i.code,
        severity: i.severity,
        message: i.message,
        field: i.field,
      })),
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluates public impact preview for target state (Amendments 7, 8, 38, 39, 40).
   * Side-effect free, read-only operation.
   */
  static async getPublicImpactPreview(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    targetVisibility?: Visibility,
    targetStatus?: PublicationStatus,
    executor: any = db
  ): Promise<PublicImpactPreviewDTO> {
    const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, executor);

    const currentVisibility = (rawEntity.visibility || 'private') as Visibility;
    const currentPublicationStatus = (rawEntity.publicationStatus || 'draft') as PublicationStatus;
    const effectiveTargetVisibility = targetVisibility || currentVisibility;
    const effectiveTargetStatus = targetStatus || currentPublicationStatus;

    const isArchived = Boolean(rawEntity.archivedAt);
    const willBeDiscoverable = isPubliclyDiscoverable(
      effectiveTargetVisibility,
      effectiveTargetStatus,
      isArchived
    );
    const willBeDirectAccessible = isDirectlyResolvable(
      effectiveTargetVisibility,
      effectiveTargetStatus,
      isArchived
    );

    const slug = rawEntity.slug || null;
    let parentSlug: string | null = null;

    if (entityType === 'PROJECT_CASE_STUDY' && rawEntity.projectId) {
      const parent = await executor.query.projects.findFirst({
        where: and(eq(projects.id, rawEntity.projectId), eq(projects.ownerId, ownerId)),
      });
      parentSlug = parent?.slug || null;
    }

    const publicRoute = getPublicRouteForEntity(entityType, slug, parentSlug);

    // Evaluate connected relationships
    const relationships = await executor.query.knowledgeRelationships.findMany({
      where: and(
        eq(knowledgeRelationships.ownerId, ownerId),
        isNull(knowledgeRelationships.archivedAt),
        sql`(${knowledgeRelationships.sourceId} = ${entityId} OR ${knowledgeRelationships.targetId} = ${entityId})`
      ),
      with: {
        relationshipType: true,
      },
    });

    const eligibleRelationships: PublicImpactPreviewDTO['eligibleRelationships'] = [];
    let hiddenPrivateRelationshipsCount = 0;

    for (const rel of relationships) {
      const isOutbound = rel.sourceId === entityId;
      const otherNodeType = isOutbound ? rel.targetType : rel.sourceType;
      const isEdgePublic = rel.visibility === 'public';

      if (isEdgePublic && willBeDiscoverable) {
        eligibleRelationships.push({
          id: rel.id,
          relationshipTypeCode: rel.relationshipTypeCode,
          relationshipTypeName: rel.relationshipType?.name || rel.relationshipTypeCode,
          targetLabel: isOutbound ? `Target (${otherNodeType})` : `Source (${otherNodeType})`,
          targetType: otherNodeType,
        });
      } else {
        hiddenPrivateRelationshipsCount++;
      }
    }

    // Media references count
    let totalMediaCount = 0;
    if ('ogImageId' in rawEntity && rawEntity.ogImageId) totalMediaCount++;
    if ('certificateMediaId' in rawEntity && rawEntity.certificateMediaId) totalMediaCount++;
    if (entityType === 'PROJECT') {
      const pmRows = await executor
        .select({ count: sql<number>`count(*)::int` })
        .from(projectMedia)
        .where(eq(projectMedia.projectId, entityId));
      totalMediaCount += pmRows[0]?.count || 0;
    }

    const warnings: string[] = [];
    if (effectiveTargetVisibility === 'public' && effectiveTargetStatus === 'published') {
      const readiness = await this.getPublicationReadiness(ownerId, entityType, entityId, executor);
      for (const issue of readiness.issues) {
        if (issue.severity === 'warning') {
          warnings.push(issue.message);
        }
      }
    }

    return {
      entityType,
      entityId,
      entityTitle: this.getEntityDisplayTitle(rawEntity, entityType),
      slug,
      currentVisibility,
      targetVisibility: effectiveTargetVisibility,
      currentPublicationStatus,
      targetPublicationStatus: effectiveTargetStatus,
      publicRoute,
      isNewlyDiscoverable: willBeDiscoverable && !isPubliclyDiscoverable(currentVisibility, currentPublicationStatus, isArchived),
      isDirectlyAccessible: willBeDirectAccessible,
      eligibleRelationshipsCount: eligibleRelationships.length,
      eligibleRelationships,
      hiddenPrivateRelationshipsCount,
      mediaImpact: {
        totalMediaCount,
        referencedPublicly: willBeDiscoverable && totalMediaCount > 0,
      },
      sitemapImpact: willBeDiscoverable && Boolean(publicRoute),
      searchImpact: {
        isEligibleForFutureSearch: willBeDiscoverable,
      },
      warnings,
    };
  }

  /**
   * Transitions DRAFT -> REVIEW (Amendment 16).
   */
  static async submitForReview(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    actorId?: string,
    executor: any = db
  ): Promise<PublicationStateDTO> {
    const capability = PUBLISHABLE_ENTITY_CAPABILITIES[entityType];
    if (!capability.supportsReview) {
      throw new AppError(`${capability.label} does not participate in editorial review.`, 'BAD_REQUEST', 400);
    }

    return executor.transaction(async (tx: any) => {
      const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, tx);
      const currentStatus = rawEntity.publicationStatus as PublicationStatus;

      if (currentStatus === 'review') {
        return this.mapEntityToPublicationState(rawEntity, entityType);
      }

      if (currentStatus !== 'draft') {
        throw new AppError(
          `Cannot submit for review from status "${currentStatus}". Must be in DRAFT.`,
          'CONFLICT',
          409
        );
      }

      const policy = ENTITY_READINESS_POLICIES[entityType];
      const basicIssues = policy.evaluateBasicReadiness(rawEntity);
      const basicErrors = basicIssues.filter((i) => i.severity === 'error');
      if (basicErrors.length > 0) {
        throw new AppError(
          `Basic readiness validation failed: ${basicErrors.map((e) => e.message).join('; ')}`,
          'PUBLICATION_BLOCKED',
          422
        );
      }

      const updated = await this.executeStatusTransition(
        tx,
        entityType,
        entityId,
        ownerId,
        ['draft'],
        { publicationStatus: 'review', updatedAt: new Date() }
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'SUBMIT_FOR_REVIEW',
        entityType,
        entityId,
        oldValues: { publicationStatus: currentStatus },
        newValues: { publicationStatus: 'review' },
      });

      return this.mapEntityToPublicationState(updated, entityType);
    });
  }

  /**
   * Transitions REVIEW/SCHEDULED/PUBLISHED -> DRAFT (Amendment 11, 26, 42).
   */
  static async returnToDraft(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    actorId?: string,
    executor: any = db
  ): Promise<PublicationStateDTO> {
    let previousStatus: PublicationStatus | null = null;
    let entitySlug: string | null = null;

    const result = await executor.transaction(async (tx: any) => {
      const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, tx);
      previousStatus = rawEntity.publicationStatus as PublicationStatus;
      entitySlug = rawEntity.slug || null;

      if (previousStatus === 'draft') {
        return this.mapEntityToPublicationState(rawEntity, entityType);
      }

      const updated = await this.executeStatusTransition(
        tx,
        entityType,
        entityId,
        ownerId,
        ['review', 'scheduled', 'published'],
        {
          publicationStatus: 'draft',
          scheduledPublishAt: null, // Clear schedule timestamp (Amendment 26)
          updatedAt: new Date(),
        }
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'RETURN_TO_DRAFT',
        entityType,
        entityId,
        oldValues: { publicationStatus: previousStatus, scheduledPublishAt: rawEntity.scheduledPublishAt },
        newValues: { publicationStatus: 'draft', scheduledPublishAt: null },
      });

      return this.mapEntityToPublicationState(updated, entityType);
    });

    // Post-commit cache revalidation (Amendment 42 & 44)
    if (previousStatus === 'published') {
      this.revalidateEntityPublicRoutes(entityType, entitySlug);
    }

    return result;
  }

  /**
   * Transitions DRAFT/REVIEW/SCHEDULED -> SCHEDULED (Amendment 13, 17, 26).
   */
  static async schedulePublication(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    scheduledAt: Date,
    actorId?: string,
    executor: any = db
  ): Promise<PublicationStateDTO> {
    const capability = PUBLISHABLE_ENTITY_CAPABILITIES[entityType];
    if (!capability.supportsScheduling) {
      throw new AppError(`${capability.label} does not support scheduling.`, 'BAD_REQUEST', 400);
    }

    if (scheduledAt.getTime() <= Date.now()) {
      throw new AppError('Scheduled publication time must be in the future.', 'BAD_REQUEST', 400);
    }

    return executor.transaction(async (tx: any) => {
      const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, tx);
      const currentStatus = rawEntity.publicationStatus as PublicationStatus;

      // Full readiness gate at schedule creation time (Amendment 17)
      const issues = await this.evaluateReadinessForEntity(ownerId, entityType, rawEntity, tx);
      const errors = issues.filter((i) => i.severity === 'error');
      if (errors.length > 0) {
        throw new AppError(
          `Publication readiness failed: ${errors.map((e) => e.message).join('; ')}`,
          'PUBLICATION_BLOCKED',
          422
        );
      }

      const updated = await this.executeStatusTransition(
        tx,
        entityType,
        entityId,
        ownerId,
        ['draft', 'review', 'scheduled'],
        {
          publicationStatus: 'scheduled',
          scheduledPublishAt: scheduledAt,
          updatedAt: new Date(),
        }
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'SCHEDULE_PUBLICATION',
        entityType,
        entityId,
        oldValues: { publicationStatus: currentStatus, scheduledPublishAt: rawEntity.scheduledPublishAt },
        newValues: { publicationStatus: 'scheduled', scheduledPublishAt: scheduledAt },
      });

      return this.mapEntityToPublicationState(updated, entityType);
    });
  }

  /**
   * Publishes entity immediately (DRAFT/REVIEW/SCHEDULED -> PUBLISHED).
   * Direct publish from DRAFT is canonical (Amendment 15, 23, 24, 25, 26, 42).
   */
  static async publishNow(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    actorId?: string,
    executor: any = db
  ): Promise<PublicationStateDTO> {
    let previousStatus: PublicationStatus | null = null;
    let entitySlug: string | null = null;

    const result = await executor.transaction(async (tx: any) => {
      const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, tx);
      previousStatus = rawEntity.publicationStatus as PublicationStatus;
      entitySlug = rawEntity.slug || null;

      // Idempotent when already published (Amendment 24)
      if (previousStatus === 'published') {
        return this.mapEntityToPublicationState(rawEntity, entityType);
      }

      // Revalidate full readiness at command execution (Amendment 8, 11, 15)
      const issues = await this.evaluateReadinessForEntity(ownerId, entityType, rawEntity, tx);
      const errors = issues.filter((i) => i.severity === 'error');
      if (errors.length > 0) {
        throw new AppError(
          `Publication readiness failed: ${errors.map((e) => e.message).join('; ')}`,
          'PUBLICATION_BLOCKED',
          422
        );
      }

      // First publication sets publishedAt = now(); republication preserves original publishedAt (Amendment 25)
      const now = new Date();
      const effectivePublishedAt = rawEntity.publishedAt || now;

      const updated = await this.executeStatusTransition(
        tx,
        entityType,
        entityId,
        ownerId,
        ['draft', 'review', 'scheduled'],
        {
          publicationStatus: 'published',
          publishedAt: effectivePublishedAt,
          scheduledPublishAt: null, // Clear schedule timestamp (Amendment 26)
          updatedAt: now,
        }
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'PUBLISH',
        entityType,
        entityId,
        oldValues: { publicationStatus: previousStatus, publishedAt: rawEntity.publishedAt },
        newValues: { publicationStatus: 'published', publishedAt: effectivePublishedAt },
      });

      return this.mapEntityToPublicationState(updated, entityType);
    });

    // Post-commit cache revalidation (Amendment 42 & 44)
    this.revalidateEntityPublicRoutes(entityType, entitySlug);

    return result;
  }

  /**
   * Unpublishes entity (PUBLISHED -> DRAFT) (Amendment 25, 26, 42).
   */
  static async unpublish(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    actorId?: string,
    executor: any = db
  ): Promise<PublicationStateDTO> {
    let entitySlug: string | null = null;

    const result = await executor.transaction(async (tx: any) => {
      const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, tx);
      const currentStatus = rawEntity.publicationStatus as PublicationStatus;
      entitySlug = rawEntity.slug || null;

      if (currentStatus !== 'published') {
        throw new AppError(
          `Cannot unpublish entity in status "${currentStatus}". Must be PUBLISHED.`,
          'CONFLICT',
          409
        );
      }

      const updated = await this.executeStatusTransition(
        tx,
        entityType,
        entityId,
        ownerId,
        ['published'],
        {
          publicationStatus: 'draft',
          scheduledPublishAt: null,
          updatedAt: new Date(),
        }
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'UNPUBLISH',
        entityType,
        entityId,
        oldValues: { publicationStatus: 'published' },
        newValues: { publicationStatus: 'draft' },
      });

      return this.mapEntityToPublicationState(updated, entityType);
    });

    // Post-commit cache revalidation
    this.revalidateEntityPublicRoutes(entityType, entitySlug);

    return result;
  }

  /**
   * Archives publication (PUBLISHED/DRAFT/REVIEW/SCHEDULED -> ARCHIVED) (Amendment 4, 26, 42).
   */
  static async archivePublication(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    actorId?: string,
    executor: any = db
  ): Promise<PublicationStateDTO> {
    let previousStatus: PublicationStatus | null = null;
    let entitySlug: string | null = null;

    const result = await executor.transaction(async (tx: any) => {
      const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, tx);
      previousStatus = rawEntity.publicationStatus as PublicationStatus;
      entitySlug = rawEntity.slug || null;

      if (previousStatus === 'archived') {
        return this.mapEntityToPublicationState(rawEntity, entityType);
      }

      const now = new Date();
      const updated = await this.executeStatusTransition(
        tx,
        entityType,
        entityId,
        ownerId,
        ['draft', 'review', 'scheduled', 'published'],
        {
          publicationStatus: 'archived',
          archivedAt: rawEntity.archivedAt || now,
          scheduledPublishAt: null,
          updatedAt: now,
        }
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ARCHIVE_PUBLICATION',
        entityType,
        entityId,
        oldValues: { publicationStatus: previousStatus, archivedAt: rawEntity.archivedAt },
        newValues: { publicationStatus: 'archived', archivedAt: rawEntity.archivedAt || now },
      });

      return this.mapEntityToPublicationState(updated, entityType);
    });

    if (previousStatus === 'published') {
      this.revalidateEntityPublicRoutes(entityType, entitySlug);
    }

    return result;
  }

  /**
   * Restores publication to DRAFT (ARCHIVED -> DRAFT) (Amendment 4, 27).
   * NEVER auto-publishes. Clears archivedAt.
   */
  static async restoreToDraft(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    actorId?: string,
    executor: any = db
  ): Promise<PublicationStateDTO> {
    return executor.transaction(async (tx: any) => {
      const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, tx);
      const currentStatus = rawEntity.publicationStatus as PublicationStatus;

      if (currentStatus !== 'archived') {
        throw new AppError(
          `Cannot restore entity in status "${currentStatus}". Must be ARCHIVED.`,
          'CONFLICT',
          409
        );
      }

      const updated = await this.executeStatusTransition(
        tx,
        entityType,
        entityId,
        ownerId,
        ['archived'],
        {
          publicationStatus: 'draft',
          archivedAt: null, // Clear operational archival (Amendment 4 & 27)
          updatedAt: new Date(),
        }
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'RESTORE_TO_DRAFT',
        entityType,
        entityId,
        oldValues: { publicationStatus: 'archived', archivedAt: rawEntity.archivedAt },
        newValues: { publicationStatus: 'draft', archivedAt: null },
      });

      return this.mapEntityToPublicationState(updated, entityType);
    });
  }

  /**
   * Modifies visibility (Amendments 5, 6, 49).
   * Exposure-increasing transitions for already published entities run full readiness gate!
   */
  static async changeVisibility(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    newVisibility: Visibility,
    actorId?: string,
    executor: any = db
  ): Promise<PublicationStateDTO> {
    let wasPublished = false;
    let entitySlug: string | null = null;

    const result = await executor.transaction(async (tx: any) => {
      const rawEntity = await this.resolveRawOwnerEntity(ownerId, entityType, entityId, tx);
      const currentVisibility = (rawEntity.visibility || 'private') as Visibility;
      const currentPublicationStatus = rawEntity.publicationStatus as PublicationStatus;
      wasPublished = currentPublicationStatus === 'published';
      entitySlug = rawEntity.slug || null;

      if (currentVisibility === newVisibility) {
        return this.mapEntityToPublicationState(rawEntity, entityType);
      }

      // Exposure escalation check (Amendment 5)
      if (wasPublished && isExposureIncreasing(currentVisibility, newVisibility)) {
        const issues = await this.evaluateReadinessForEntity(ownerId, entityType, rawEntity, tx);
        const errors = issues.filter((i) => i.severity === 'error');
        if (errors.length > 0) {
          throw new AppError(
            `Cannot increase visibility to ${newVisibility.toUpperCase()}: Publication readiness errors present: ${errors.map((e) => e.message).join('; ')}`,
            'PUBLICATION_BLOCKED',
            422
          );
        }
      }

      const updated = await this.executeTableUpdate(
        tx,
        entityType,
        entityId,
        ownerId,
        {
          visibility: newVisibility,
          updatedAt: new Date(),
        }
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'CHANGE_VISIBILITY',
        entityType,
        entityId,
        oldValues: { visibility: currentVisibility },
        newValues: { visibility: newVisibility },
      });

      return this.mapEntityToPublicationState(updated, entityType);
    });

    if (wasPublished) {
      this.revalidateEntityPublicRoutes(entityType, entitySlug);
    }

    return result;
  }

  /**
   * Publishing Center aggregation query (Amendments 45 & 47).
   */
  static async listPublishingItems(
    ownerId: string,
    filters: Partial<PublishingListFilterInput> = {},
    executor: any = db
  ): Promise<PublishingListItemDTO[]> {
    const normalizedFilters: PublishingListFilterInput = {
      page: 1,
      limit: 100,
      ...filters,
    };
    const typesToFetch: PublishableEntityType[] = normalizedFilters.entityType
      ? [normalizedFilters.entityType as PublishableEntityType]
      : (PUBLISHABLE_ENTITY_TYPES as unknown as PublishableEntityType[]);
    const items: PublishingListItemDTO[] = [];

    for (const type of typesToFetch) {
      const entities = await this.fetchEntitiesForList(ownerId, type, normalizedFilters, executor);
      for (const ent of entities) {
        const capability = PUBLISHABLE_ENTITY_CAPABILITIES[type];
        const issues = ENTITY_READINESS_POLICIES[type].evaluateBasicReadiness(ent);
        const hasErrors = issues.some((i: PublicationIssue) => i.severity === 'error');
        const hasWarnings = issues.some((i: PublicationIssue) => i.severity === 'warning');

        items.push({
          id: ent.id,
          entityType: type,
          entityTypeLabel: capability.label,
          title: this.getEntityDisplayTitle(ent, type),
          slug: ent.slug || null,
          visibility: (ent.visibility || 'private') as Visibility,
          publicationStatus: (ent.publicationStatus || 'draft') as PublicationStatus,
          publishedAt: ent.publishedAt ? new Date(ent.publishedAt).toISOString() : null,
          scheduledPublishAt: ent.scheduledPublishAt ? new Date(ent.scheduledPublishAt).toISOString() : null,
          archivedAt: ent.archivedAt ? new Date(ent.archivedAt).toISOString() : null,
          updatedAt: ent.updatedAt ? new Date(ent.updatedAt).toISOString() : new Date().toISOString(),
          hasReadinessErrors: hasErrors,
          hasReadinessWarnings: hasWarnings,
          publicRoute: getPublicRouteForEntity(type, ent.slug),
        });
      }
    }

    // Sort by updatedAt desc
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return items;
  }

  /**
   * Publishing Center overview counter (Amendment 45 & 46).
   */
  static async getPublishingOverview(
    ownerId: string,
    executor: any = db
  ): Promise<PublishingOverviewDTO> {
    const overview: PublishingOverviewDTO = {
      total: 0,
      draft: 0,
      review: 0,
      scheduled: 0,
      published: 0,
      archived: 0,
      unlisted: 0,
      private: 0,
      needsAttention: 0,
    };

    const allItems = await this.listPublishingItems(ownerId, {}, executor);
    overview.total = allItems.length;

    for (const item of allItems) {
      if (item.publicationStatus === 'draft') overview.draft++;
      if (item.publicationStatus === 'review') overview.review++;
      if (item.publicationStatus === 'scheduled') overview.scheduled++;
      if (item.publicationStatus === 'published') overview.published++;
      if (item.publicationStatus === 'archived') overview.archived++;

      if (item.visibility === 'unlisted') overview.unlisted++;
      if (item.visibility === 'private') overview.private++;

      if (item.hasReadinessErrors || (item.publicationStatus === 'review' && item.hasReadinessWarnings)) {
        overview.needsAttention++;
      }
    }

    return overview;
  }

  // ---------------------------------------------------------------------------
  // Internal Helpers & Resolvers
  // ---------------------------------------------------------------------------

  private static async evaluateReadinessForEntity(
    ownerId: string,
    entityType: PublishableEntityType,
    rawEntity: any,
    executor: any = db
  ): Promise<PublicationIssue[]> {
    const policy = ENTITY_READINESS_POLICIES[entityType];
    let parentEntity = null;
    let hasDuplicateRouteSlug = false;

    // Check slug collision in public route namespace (Amendment 13)
    if (rawEntity.slug && PUBLISHABLE_ENTITY_CAPABILITIES[entityType].requiresSlug) {
      hasDuplicateRouteSlug = await this.checkSlugCollisionInNamespace(
        ownerId,
        entityType,
        rawEntity.id,
        rawEntity.slug,
        executor
      );
    }

    // Check parent entity if applicable (Amendment 33)
    if (entityType === 'PROJECT_CASE_STUDY' && rawEntity.projectId) {
      const parent = await executor.query.projects.findFirst({
        where: and(eq(projects.id, rawEntity.projectId), eq(projects.ownerId, ownerId)),
      });
      if (parent) {
        parentEntity = {
          id: parent.id,
          visibility: parent.visibility,
          publicationStatus: parent.publicationStatus,
          archivedAt: parent.archivedAt,
        };
      }
    }

    return policy.evaluateFullReadiness(rawEntity, {
      parentEntity,
      hasDuplicateRouteSlug,
    });
  }

  private static async checkSlugCollisionInNamespace(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    slug: string,
    executor: any = db
  ): Promise<boolean> {
    switch (entityType) {
      case 'ARTICLE': {
        const existing = await executor.query.articles.findFirst({
          where: and(
            eq(articles.ownerId, ownerId),
            eq(articles.slug, slug),
            sql`${articles.id} != ${entityId}`
          ),
        });
        return Boolean(existing);
      }
      case 'TECH_NOTE': {
        const existing = await executor.query.notes.findFirst({
          where: and(
            eq(notes.ownerId, ownerId),
            eq(notes.slug, slug),
            sql`${notes.id} != ${entityId}`
          ),
        });
        return Boolean(existing);
      }
      case 'ADR': {
        const existing = await executor.query.adrs.findFirst({
          where: and(
            eq(adrs.ownerId, ownerId),
            eq(adrs.slug, slug),
            sql`${adrs.id} != ${entityId}`
          ),
        });
        return Boolean(existing);
      }
      case 'JOURNAL_ENTRY': {
        const existing = await executor.query.journalEntries.findFirst({
          where: and(
            eq(journalEntries.ownerId, ownerId),
            eq(journalEntries.slug, slug),
            sql`${journalEntries.id} != ${entityId}`
          ),
        });
        return Boolean(existing);
      }
      case 'PROJECT': {
        const existing = await executor.query.projects.findFirst({
          where: and(
            eq(projects.ownerId, ownerId),
            eq(projects.slug, slug),
            sql`${projects.id} != ${entityId}`
          ),
        });
        return Boolean(existing);
      }
      case 'LEARNING_PATH': {
        const existing = await executor.query.learningPaths.findFirst({
          where: and(
            eq(learningPaths.ownerId, ownerId),
            eq(learningPaths.slug, slug),
            sql`${learningPaths.id} != ${entityId}`
          ),
        });
        return Boolean(existing);
      }
      default:
        return false;
    }
  }

  private static async resolveRawOwnerEntity(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    executor: any = db
  ): Promise<any> {
    let result: any = null;

    switch (entityType) {
      case 'ARTICLE':
        result = await executor.query.articles.findFirst({
          where: and(eq(articles.id, entityId), eq(articles.ownerId, ownerId), isNull(articles.deletedAt)),
        });
        break;
      case 'TECH_NOTE':
        result = await executor.query.notes.findFirst({
          where: and(eq(notes.id, entityId), eq(notes.ownerId, ownerId), isNull(notes.deletedAt)),
        });
        break;
      case 'ADR':
        result = await executor.query.adrs.findFirst({
          where: and(eq(adrs.id, entityId), eq(adrs.ownerId, ownerId)),
        });
        break;
      case 'JOURNAL_ENTRY':
        result = await executor.query.journalEntries.findFirst({
          where: and(eq(journalEntries.id, entityId), eq(journalEntries.ownerId, ownerId), isNull(journalEntries.deletedAt)),
        });
        break;
      case 'PROJECT':
        result = await executor.query.projects.findFirst({
          where: and(eq(projects.id, entityId), eq(projects.ownerId, ownerId), isNull(projects.deletedAt)),
        });
        break;
      case 'PROJECT_CASE_STUDY':
        result = await executor.query.projectCaseStudies.findFirst({
          where: and(eq(projectCaseStudies.id, entityId), eq(projectCaseStudies.ownerId, ownerId)),
        });
        break;
      case 'EXPERIENCE':
        result = await executor.query.careerExperiences.findFirst({
          where: and(eq(careerExperiences.id, entityId), eq(careerExperiences.ownerId, ownerId), isNull(careerExperiences.deletedAt)),
        });
        break;
      case 'LEARNING_PATH':
        result = await executor.query.learningPaths.findFirst({
          where: and(eq(learningPaths.id, entityId), eq(learningPaths.ownerId, ownerId)),
        });
        break;
      case 'ROADMAP':
        result = await executor.query.roadmapItems.findFirst({
          where: and(eq(roadmapItems.id, entityId), eq(roadmapItems.ownerId, ownerId)),
        });
        break;
      case 'CERTIFICATE':
        result = await executor.query.certificates.findFirst({
          where: and(eq(certificates.id, entityId), eq(certificates.ownerId, ownerId)),
        });
        break;
      case 'NOW_ENTRY':
        result = await executor.query.nowEntries.findFirst({
          where: and(eq(nowEntries.id, entityId), eq(nowEntries.ownerId, ownerId)),
        });
        break;
      default:
        throw new AppError(`Unsupported publishable entity type: ${entityType}`, 'BAD_REQUEST', 400);
    }

    if (!result) {
      throw new AppError(
        `${PUBLISHABLE_ENTITY_CAPABILITIES[entityType]?.label || entityType} with ID "${entityId}" was not found or access denied.`,
        'NOT_FOUND',
        404
      );
    }

    return result;
  }

  private static async executeStatusTransition(
    tx: any,
    entityType: PublishableEntityType,
    entityId: string,
    ownerId: string,
    allowedFromStatuses: readonly string[],
    updates: Record<string, any>
  ): Promise<any> {
    const tableMap: Record<PublishableEntityType, any> = {
      ARTICLE: articles,
      TECH_NOTE: notes,
      ADR: adrs,
      JOURNAL_ENTRY: journalEntries,
      PROJECT: projects,
      PROJECT_CASE_STUDY: projectCaseStudies,
      EXPERIENCE: careerExperiences,
      LEARNING_PATH: learningPaths,
      ROADMAP: roadmapItems,
      CERTIFICATE: certificates,
      NOW_ENTRY: nowEntries,
    };

    const table = tableMap[entityType];
    const [updated] = await tx
      .update(table)
      .set(updates)
      .where(
        and(
          eq(table.id, entityId),
          eq(table.ownerId, ownerId),
          inArray(table.publicationStatus, allowedFromStatuses)
        )
      )
      .returning();

    if (!updated) {
      throw new AppError(
        `Cannot transition ${entityType} ${entityId}. Expected current status to be one of: ${allowedFromStatuses.join(', ')}`,
        'CONFLICT',
        409
      );
    }

    // Trigger Search Projection Sync (Amendment 9)
    this.syncSearchProjection(entityType, entityId).catch((e) =>
      console.warn(`[SearchSync] Async sync error for ${entityType}:${entityId}`, e)
    );

    return updated;
  }

  private static async syncSearchProjection(
    entityType: PublishableEntityType,
    entityId: string
  ): Promise<void> {
    switch (entityType) {
      case 'ARTICLE':
        await SearchSyncService.syncArticle(entityId);
        break;
      case 'TECH_NOTE':
        await SearchSyncService.syncNote(entityId);
        break;
      case 'ADR':
        await SearchSyncService.syncAdr(entityId);
        break;
      case 'JOURNAL_ENTRY':
        await SearchSyncService.syncJournal(entityId);
        break;
      case 'PROJECT':
        await SearchSyncService.syncProject(entityId);
        break;
      case 'PROJECT_CASE_STUDY':
        await SearchSyncService.syncCaseStudy(entityId);
        break;
      case 'EXPERIENCE':
        await SearchSyncService.syncExperience(entityId);
        break;
      case 'LEARNING_PATH':
        await SearchSyncService.syncLearningPath(entityId);
        break;
      case 'ROADMAP':
        await SearchSyncService.syncRoadmapItem(entityId);
        break;
      case 'CERTIFICATE':
        await SearchSyncService.syncCertificate(entityId);
        break;
      case 'NOW_ENTRY':
        await SearchSyncService.syncNowEntry(entityId);
        break;
    }
  }

  private static async executeTableUpdate(
    tx: any,
    entityType: PublishableEntityType,
    entityId: string,
    ownerId: string,
    updates: Record<string, any>
  ): Promise<any> {
    const tableMap: Record<PublishableEntityType, any> = {
      ARTICLE: articles,
      TECH_NOTE: notes,
      ADR: adrs,
      JOURNAL_ENTRY: journalEntries,
      PROJECT: projects,
      PROJECT_CASE_STUDY: projectCaseStudies,
      EXPERIENCE: careerExperiences,
      LEARNING_PATH: learningPaths,
      ROADMAP: roadmapItems,
      CERTIFICATE: certificates,
      NOW_ENTRY: nowEntries,
    };

    const table = tableMap[entityType];
    const [updated] = await tx
      .update(table)
      .set(updates)
      .where(and(eq(table.id, entityId), eq(table.ownerId, ownerId)))
      .returning();

    if (!updated) {
      throw new AppError(
        `Failed to update ${entityType} ${entityId}. Entity not found or access denied.`,
        'NOT_FOUND',
        404
      );
    }

    return updated;
  }

  private static async fetchEntitiesForList(
    ownerId: string,
    type: PublishableEntityType,
    filters: PublishingListFilterInput,
    executor: any = db
  ): Promise<any[]> {
    switch (type) {
      case 'ARTICLE':
        return executor.query.articles.findMany({
          where: and(
            eq(articles.ownerId, ownerId),
            isNull(articles.deletedAt),
            filters.status ? eq(articles.publicationStatus, filters.status) : undefined
          ),
        });
      case 'TECH_NOTE':
        return executor.query.notes.findMany({
          where: and(
            eq(notes.ownerId, ownerId),
            isNull(notes.deletedAt),
            filters.status ? eq(notes.publicationStatus, filters.status) : undefined
          ),
        });
      case 'ADR':
        return executor.query.adrs.findMany({
          where: and(
            eq(adrs.ownerId, ownerId),
            filters.status ? eq(adrs.publicationStatus, filters.status) : undefined
          ),
        });
      case 'JOURNAL_ENTRY':
        return executor.query.journalEntries.findMany({
          where: and(
            eq(journalEntries.ownerId, ownerId),
            isNull(journalEntries.deletedAt),
            filters.status ? eq(journalEntries.publicationStatus, filters.status) : undefined
          ),
        });
      case 'PROJECT':
        return executor.query.projects.findMany({
          where: and(
            eq(projects.ownerId, ownerId),
            isNull(projects.deletedAt),
            filters.status ? eq(projects.publicationStatus, filters.status) : undefined
          ),
        });
      case 'PROJECT_CASE_STUDY':
        return executor.query.projectCaseStudies.findMany({
          where: and(
            eq(projectCaseStudies.ownerId, ownerId),
            filters.status ? eq(projectCaseStudies.publicationStatus, filters.status) : undefined
          ),
        });
      case 'EXPERIENCE':
        return executor.query.careerExperiences.findMany({
          where: and(
            eq(careerExperiences.ownerId, ownerId),
            isNull(careerExperiences.deletedAt),
            filters.status ? eq(careerExperiences.publicationStatus, filters.status) : undefined
          ),
        });
      case 'LEARNING_PATH':
        return executor.query.learningPaths.findMany({
          where: and(
            eq(learningPaths.ownerId, ownerId),
            filters.status ? eq(learningPaths.publicationStatus, filters.status) : undefined
          ),
        });
      case 'ROADMAP':
        return executor.query.roadmapItems.findMany({
          where: and(
            eq(roadmapItems.ownerId, ownerId),
            filters.status ? eq(roadmapItems.publicationStatus, filters.status) : undefined
          ),
        });
      case 'CERTIFICATE':
        return executor.query.certificates.findMany({
          where: and(
            eq(certificates.ownerId, ownerId),
            filters.status ? eq(certificates.publicationStatus, filters.status) : undefined
          ),
        });
      case 'NOW_ENTRY':
        return executor.query.nowEntries.findMany({
          where: and(
            eq(nowEntries.ownerId, ownerId),
            filters.status ? eq(nowEntries.publicationStatus, filters.status) : undefined
          ),
        });
      default:
        return [];
    }
  }

  private static mapEntityToPublicationState(raw: any, entityType: PublishableEntityType): PublicationStateDTO {
    const visibility = (raw.visibility || 'private') as Visibility;
    const publicationStatus = (raw.publicationStatus || 'draft') as PublicationStatus;
    const isArchived = Boolean(raw.archivedAt);
    const capability = PUBLISHABLE_ENTITY_CAPABILITIES[entityType];

    return {
      id: raw.id,
      entityType,
      entityTitle: this.getEntityDisplayTitle(raw, entityType),
      slug: raw.slug || null,
      visibility,
      publicationStatus,
      publishedAt: raw.publishedAt ? new Date(raw.publishedAt).toISOString() : null,
      scheduledPublishAt: raw.scheduledPublishAt ? new Date(raw.scheduledPublishAt).toISOString() : null,
      archivedAt: raw.archivedAt ? new Date(raw.archivedAt).toISOString() : null,
      isPubliclyDiscoverable: isPubliclyDiscoverable(visibility, publicationStatus, isArchived),
      isDirectlyResolvable: isDirectlyResolvable(visibility, publicationStatus, isArchived),
      allowedCommands: getAllowedCommandsForStatus(publicationStatus, capability),
      publicRoute: getPublicRouteForEntity(entityType, raw.slug),
    };
  }

  private static getEntityDisplayTitle(raw: any, entityType: PublishableEntityType): string {
    if (raw.title) return raw.title;
    if (raw.name) return raw.name;
    if (raw.position) return raw.position;
    if (entityType === 'PROJECT_CASE_STUDY') return raw.title || 'Case Study';
    return `${PUBLISHABLE_ENTITY_CAPABILITIES[entityType]?.label || entityType} #${raw.id.slice(0, 8)}`;
  }

  private static revalidateEntityPublicRoutes(entityType: PublishableEntityType, slug?: string | null) {
    try {
      revalidatePath('/');
      const route = getPublicRouteForEntity(entityType, slug);
      if (route) {
        revalidatePath(route);
      }
      const baseNamespace = PUBLIC_ROUTE_NAMESPACES[entityType];
      if (baseNamespace) {
        revalidatePath(baseNamespace);
      }
      revalidatePath('/sitemap.xml');
      revalidatePath('/rss.xml');
      revalidatePath('/graph');
    } catch {
      // In non-Next execution or test environment, safely continue
    }
  }
}
