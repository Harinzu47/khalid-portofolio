import { db } from '@/db/client';
import {
  projects,
  projectCaseStudies,
  careerExperiences,
  skills,
  domains,
  technologies,
  articles,
  journalEntries,
  notes,
  adrs,
  learningPaths,
  roadmapItems,
  certificates,
  nowEntries,
  tags,
} from '@/db/schema';
import { eq, and, isNull, ilike, sql, not } from 'drizzle-orm';
import { NotFoundError, AppError } from '@/lib/errors';
import type { CanonicalEntityType } from '@/domain/relationships';
import { isEntityPubliclyEligible } from '@/domain/relationships';
import type {
  RelationshipEndpointDTO,
  RelationshipCandidateDTO,
} from '@/types/dtos';

export interface ResolvedEntity {
  id: string;
  entityType: CanonicalEntityType;
  ownerId: string;
  label: string;
  slug: string | null;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string | null;
  isArchived: boolean;
  typeCategory?: string | null;
}

export class EntityResolverService {
  /**
   * Resolves an entity in the owner context (Amendment 5).
   * Validates existence and strict owner ownership. Throws NotFoundError if missing or foreign.
   */
  static async resolveOwnerEntity(
    ownerId: string,
    entityType: CanonicalEntityType,
    entityId: string,
    executor: any = db
  ): Promise<ResolvedEntity> {
    const raw = await EntityResolverService.fetchRawEntity(entityType, entityId, executor);

    if (!raw || raw.ownerId !== ownerId) {
      throw new NotFoundError(entityType, entityId);
    }

    return raw;
  }

  /**
   * Resolves an entity for public traversal without owner scoping (Amendment 5 & 6).
   * Evaluates public eligibility (public + published + not archived, excluding unlisted).
   * Returns null if entity does not exist or fails public eligibility.
   */
  static async resolvePublicEntity(
    entityType: CanonicalEntityType,
    entityId: string,
    executor: any = db
  ): Promise<RelationshipEndpointDTO | null> {
    const raw = await EntityResolverService.fetchRawEntity(entityType, entityId, executor);

    if (!raw) return null;

    const isEligible = isEntityPubliclyEligible(
      entityType,
      raw.visibility,
      raw.publicationStatus,
      raw.isArchived
    );

    if (!isEligible) return null;

    return {
      id: raw.id,
      entityType: raw.entityType,
      label: raw.label,
      slug: raw.slug,
      visibility: raw.visibility,
      publicationStatus: raw.publicationStatus,
      isArchived: raw.isArchived,
      typeCategory: raw.typeCategory,
    };
  }

  /**
   * Searches owner candidates for target entity picker (Amendment 14, 15, 35).
   * Strictly owner-scoped; excludes source entity, archived rows, and foreign data.
   */
  static async searchOwnerCandidates(
    ownerId: string,
    entityType: CanonicalEntityType,
    query?: string,
    excludeId?: string,
    limit: number = 20,
    executor: any = db
  ): Promise<RelationshipCandidateDTO[]> {
    const sanitizedQuery = query?.trim() || '';

    switch (entityType) {
      case 'ARTICLE': {
        const rows = await executor.query.articles.findMany({
          where: and(
            eq(articles.ownerId, ownerId),
            isNull(articles.archivedAt),
            excludeId ? not(eq(articles.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(articles.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, slug: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'ARTICLE',
          label: r.title,
          slug: r.slug,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'TECH_NOTE': {
        const rows = await executor.query.notes.findMany({
          where: and(
            eq(notes.ownerId, ownerId),
            isNull(notes.archivedAt),
            excludeId ? not(eq(notes.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(notes.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, slug: true, category: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'TECH_NOTE',
          label: r.title,
          slug: r.slug,
          typeCategory: r.category,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'ADR': {
        const rows = await executor.query.adrs.findMany({
          where: and(
            eq(adrs.ownerId, ownerId),
            isNull(adrs.archivedAt),
            excludeId ? not(eq(adrs.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(adrs.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, slug: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'ADR',
          label: r.title,
          slug: r.slug,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'JOURNAL_ENTRY': {
        const rows = await executor.query.journalEntries.findMany({
          where: and(
            eq(journalEntries.ownerId, ownerId),
            isNull(journalEntries.archivedAt),
            excludeId ? not(eq(journalEntries.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(journalEntries.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, slug: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'JOURNAL_ENTRY',
          label: r.title,
          slug: r.slug,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'PROJECT': {
        const rows = await executor.query.projects.findMany({
          where: and(
            eq(projects.ownerId, ownerId),
            isNull(projects.archivedAt),
            isNull(projects.deletedAt),
            excludeId ? not(eq(projects.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(projects.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, slug: true, projectType: true, visibility: true, publicationStatus: true },
          orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'PROJECT',
          label: r.title,
          slug: r.slug,
          typeCategory: r.projectType,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'SKILL': {
        const rows = await executor.query.skills.findMany({
          where: and(
            eq(skills.ownerId, ownerId),
            isNull(skills.archivedAt),
            excludeId ? not(eq(skills.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(skills.name, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, name: true, slug: true, category: true, visibility: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'SKILL',
          label: r.name,
          slug: r.slug,
          typeCategory: r.category,
          visibility: r.visibility,
        }));
      }

      case 'DOMAIN': {
        const rows = await executor.query.domains.findMany({
          where: and(
            eq(domains.ownerId, ownerId),
            isNull(domains.archivedAt),
            excludeId ? not(eq(domains.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(domains.name, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, name: true, slug: true, visibility: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'DOMAIN',
          label: r.name,
          slug: r.slug,
          visibility: r.visibility,
        }));
      }

      case 'TECHNOLOGY': {
        const rows = await executor.query.technologies.findMany({
          where: and(
            eq(technologies.ownerId, ownerId),
            isNull(technologies.archivedAt),
            excludeId ? not(eq(technologies.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(technologies.name, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, name: true, slug: true, category: true, visibility: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'TECHNOLOGY',
          label: r.name,
          slug: r.slug,
          typeCategory: r.category,
          visibility: r.visibility,
        }));
      }

      case 'LEARNING_PATH': {
        const rows = await executor.query.learningPaths.findMany({
          where: and(
            eq(learningPaths.ownerId, ownerId),
            isNull(learningPaths.archivedAt),
            excludeId ? not(eq(learningPaths.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(learningPaths.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, slug: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'LEARNING_PATH',
          label: r.title,
          slug: r.slug,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'ROADMAP': {
        const rows = await executor.query.roadmapItems.findMany({
          where: and(
            eq(roadmapItems.ownerId, ownerId),
            isNull(roadmapItems.archivedAt),
            excludeId ? not(eq(roadmapItems.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(roadmapItems.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, slug: true, category: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'ROADMAP',
          label: r.title,
          slug: r.slug,
          typeCategory: r.category,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'CERTIFICATE': {
        const rows = await executor.query.certificates.findMany({
          where: and(
            eq(certificates.ownerId, ownerId),
            isNull(certificates.archivedAt),
            excludeId ? not(eq(certificates.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(certificates.name, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, name: true, issuer: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'CERTIFICATE',
          label: `${r.name} (${r.issuer})`,
          slug: null,
          typeCategory: r.issuer,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'NOW_ENTRY': {
        const rows = await executor.query.nowEntries.findMany({
          where: and(
            eq(nowEntries.ownerId, ownerId),
            isNull(nowEntries.archivedAt),
            excludeId ? not(eq(nowEntries.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(nowEntries.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, entryType: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'NOW_ENTRY',
          label: r.title,
          slug: null,
          typeCategory: r.entryType,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      case 'EXPERIENCE': {
        const rows = await executor.query.careerExperiences.findMany({
          where: and(
            eq(careerExperiences.ownerId, ownerId),
            isNull(careerExperiences.archivedAt),
            isNull(careerExperiences.deletedAt),
            excludeId ? not(eq(careerExperiences.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(careerExperiences.position, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, position: true, organizationId: true, visibility: true },
          orderBy: (t: any, { desc }: any) => [desc(t.startDate)],
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'EXPERIENCE',
          label: r.position,
          slug: null,
          visibility: r.visibility,
        }));
      }

      case 'TAG': {
        const rows = await executor.query.tags.findMany({
          where: and(
            eq(tags.ownerId, ownerId),
            isNull(tags.archivedAt),
            excludeId ? not(eq(tags.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(tags.name, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, name: true, slug: true, visibility: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'TAG',
          label: `#${r.name}`,
          slug: r.slug,
          visibility: r.visibility,
        }));
      }

      case 'PROJECT_CASE_STUDY': {
        const rows = await executor.query.projectCaseStudies.findMany({
          where: and(
            eq(projectCaseStudies.ownerId, ownerId),
            isNull(projectCaseStudies.archivedAt),
            excludeId ? not(eq(projectCaseStudies.id, excludeId)) : undefined,
            sanitizedQuery ? ilike(projectCaseStudies.title, `%${sanitizedQuery}%`) : undefined
          ),
          columns: { id: true, title: true, slug: true, visibility: true, publicationStatus: true },
          limit,
        });
        return rows.map((r: any) => ({
          id: r.id,
          entityType: 'PROJECT_CASE_STUDY',
          label: r.title,
          slug: r.slug,
          visibility: r.visibility,
          publicationStatus: r.publicationStatus,
        }));
      }

      default:
        throw new AppError(`Unsupported entity type: ${entityType}`, 'VALIDATION_ERROR', 400);
    }
  }

  /**
   * Internal dispatcher: retrieves raw table entry with strict parameterization (Amendment 28).
   */
  private static async fetchRawEntity(
    entityType: CanonicalEntityType,
    entityId: string,
    executor: any
  ): Promise<ResolvedEntity | null> {
    switch (entityType) {
      case 'ARTICLE': {
        const row = await executor.query.articles.findFirst({
          where: eq(articles.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'ARTICLE',
          ownerId: row.ownerId,
          label: row.title,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
        };
      }

      case 'TECH_NOTE': {
        const row = await executor.query.notes.findFirst({
          where: eq(notes.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'TECH_NOTE',
          ownerId: row.ownerId,
          label: row.title,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
          typeCategory: row.category,
        };
      }

      case 'ADR': {
        const row = await executor.query.adrs.findFirst({
          where: eq(adrs.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'ADR',
          ownerId: row.ownerId,
          label: row.title,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
        };
      }

      case 'JOURNAL_ENTRY': {
        const row = await executor.query.journalEntries.findFirst({
          where: eq(journalEntries.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'JOURNAL_ENTRY',
          ownerId: row.ownerId,
          label: row.title,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
        };
      }

      case 'PROJECT': {
        const row = await executor.query.projects.findFirst({
          where: eq(projects.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'PROJECT',
          ownerId: row.ownerId,
          label: row.title,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
          typeCategory: row.projectType,
        };
      }

      case 'PROJECT_CASE_STUDY': {
        const row = await executor.query.projectCaseStudies.findFirst({
          where: eq(projectCaseStudies.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'PROJECT_CASE_STUDY',
          ownerId: row.ownerId,
          label: row.title,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
        };
      }

      case 'SKILL': {
        const row = await executor.query.skills.findFirst({
          where: eq(skills.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'SKILL',
          ownerId: row.ownerId,
          label: row.name,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: null,
          isArchived: !!row.archivedAt,
          typeCategory: row.category,
        };
      }

      case 'DOMAIN': {
        const row = await executor.query.domains.findFirst({
          where: eq(domains.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'DOMAIN',
          ownerId: row.ownerId,
          label: row.name,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: null,
          isArchived: !!row.archivedAt,
        };
      }

      case 'TECHNOLOGY': {
        const row = await executor.query.technologies.findFirst({
          where: eq(technologies.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'TECHNOLOGY',
          ownerId: row.ownerId,
          label: row.name,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: null,
          isArchived: !!row.archivedAt,
          typeCategory: row.category,
        };
      }

      case 'LEARNING_PATH': {
        const row = await executor.query.learningPaths.findFirst({
          where: eq(learningPaths.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'LEARNING_PATH',
          ownerId: row.ownerId,
          label: row.title,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
        };
      }

      case 'ROADMAP': {
        const row = await executor.query.roadmapItems.findFirst({
          where: eq(roadmapItems.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'ROADMAP',
          ownerId: row.ownerId,
          label: row.title,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
          typeCategory: row.category,
        };
      }

      case 'CERTIFICATE': {
        const row = await executor.query.certificates.findFirst({
          where: eq(certificates.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'CERTIFICATE',
          ownerId: row.ownerId,
          label: `${row.name} (${row.issuer})`,
          slug: null,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
          typeCategory: row.issuer,
        };
      }

      case 'NOW_ENTRY': {
        const row = await executor.query.nowEntries.findFirst({
          where: eq(nowEntries.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'NOW_ENTRY',
          ownerId: row.ownerId,
          label: row.title,
          slug: null,
          visibility: row.visibility,
          publicationStatus: row.publicationStatus,
          isArchived: !!row.archivedAt,
          typeCategory: row.entryType,
        };
      }

      case 'EXPERIENCE': {
        const row = await executor.query.careerExperiences.findFirst({
          where: eq(careerExperiences.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'EXPERIENCE',
          ownerId: row.ownerId,
          label: row.position,
          slug: null,
          visibility: row.visibility,
          publicationStatus: null,
          isArchived: !!row.archivedAt,
        };
      }

      case 'TAG': {
        const row = await executor.query.tags.findFirst({
          where: eq(tags.id, entityId),
        });
        if (!row) return null;
        return {
          id: row.id,
          entityType: 'TAG',
          ownerId: row.ownerId,
          label: `#${row.name}`,
          slug: row.slug,
          visibility: row.visibility,
          publicationStatus: null,
          isArchived: !!row.archivedAt,
        };
      }

      default:
        throw new AppError(`Unsupported entity type: ${entityType}`, 'VALIDATION_ERROR', 400);
    }
  }
}
