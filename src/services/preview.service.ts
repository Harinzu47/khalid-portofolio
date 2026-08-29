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
} from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { AppError } from '@/lib/errors';
import {
  PUBLISHABLE_ENTITY_CAPABILITIES,
  type PublishableEntityType,
} from '@/domain/publishing';

export interface EntityPreviewDataDTO {
  entityType: PublishableEntityType;
  entityId: string;
  title: string;
  slug: string | null;
  visibility: string;
  publicationStatus: string;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  rawContent: any;
  previewMode: true;
}

export class PreviewService {
  /**
   * Resolves owner preview data bypassing public eligibility gate (Amendments 36, 37, 52).
   */
  static async resolveOwnerPreview(
    ownerId: string,
    entityType: PublishableEntityType,
    entityId: string,
    executor = db
  ): Promise<EntityPreviewDataDTO> {
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
        `Preview not found for ${PUBLISHABLE_ENTITY_CAPABILITIES[entityType]?.label || entityType} #${entityId}`,
        'NOT_FOUND',
        404
      );
    }

    return {
      entityType,
      entityId: result.id,
      title: result.title || result.name || result.position || 'Preview',
      slug: result.slug || null,
      visibility: result.visibility,
      publicationStatus: result.publicationStatus,
      publishedAt: result.publishedAt ? new Date(result.publishedAt).toISOString() : null,
      scheduledPublishAt: result.scheduledPublishAt ? new Date(result.scheduledPublishAt).toISOString() : null,
      rawContent: result,
      previewMode: true,
    };
  }
}
