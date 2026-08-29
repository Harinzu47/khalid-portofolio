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
  skills,
  domains,
  technologies,
  media,
  nowEntries,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SearchRepositoryService } from './search-repository.service';
import {
  extractExactTerms,
  SEARCH_PROJECTION_VERSION,
  type SearchableEntityType,
} from '@/domain/search';

export class SearchSyncService {
  /**
   * Synchronizes an Article into search_documents projection.
   */
  static async syncArticle(articleId: string): Promise<void> {
    const item = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
      with: {
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
        tags: { with: { tag: true } },
      },
    });

    if (!item) return;

    const taxonomy = {
      domains: item.domains?.map((r) => r.domain.name) || [],
      technologies: item.technologies?.map((r) => r.technology.name) || [],
      skills: item.skills?.map((r) => r.skill.name) || [],
      tags: item.tags?.map((r) => r.tag.name) || [],
    };

    const exactTerms = extractExactTerms(item.title, item.excerpt, taxonomy);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'ARTICLE',
      entityId: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.excerpt,
      bodyText: item.content?.slice(0, 10000) || '',
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.publishedAt,
      archivedAt: item.deletedAt || item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Tech Note into search_documents projection.
   */
  static async syncNote(noteId: string): Promise<void> {
    const item = await db.query.notes.findFirst({
      where: eq(notes.id, noteId),
      with: {
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
        tags: { with: { tag: true } },
      },
    });

    if (!item) return;

    const taxonomy = {
      domains: item.domains?.map((r) => r.domain.name) || [],
      technologies: item.technologies?.map((r) => r.technology.name) || [],
      skills: item.skills?.map((r) => r.skill.name) || [],
      tags: item.tags?.map((r) => r.tag.name) || [],
    };

    const exactTerms = extractExactTerms(item.title, item.content?.slice(0, 200), taxonomy);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'TECH_NOTE',
      entityId: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.content?.slice(0, 300) || '',
      bodyText: item.content?.slice(0, 10000) || '',
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.publishedAt,
      archivedAt: item.deletedAt || item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy,
      exactTerms,
    });
  }

  /**
   * Synchronizes an ADR into search_documents projection.
   */
  static async syncAdr(adrId: string): Promise<void> {
    const item = await db.query.adrs.findFirst({
      where: eq(adrs.id, adrId),
      with: {
        project: true,
      },
    });

    if (!item) return;

    const exactTerms = extractExactTerms(item.title, item.context?.slice(0, 200));

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'ADR',
      entityId: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.context?.slice(0, 300) || '',
      bodyText: `${item.context || ''}\n${item.decision || ''}\n${item.consequences || ''}`.slice(0, 10000),
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.publishedAt,
      archivedAt: item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Journal Entry into search_documents projection.
   */
  static async syncJournal(journalId: string): Promise<void> {
    const item = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, journalId),
      with: {
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
        tags: { with: { tag: true } },
      },
    });

    if (!item) return;

    const taxonomy = {
      domains: item.domains?.map((r) => r.domain.name) || [],
      technologies: item.technologies?.map((r) => r.technology.name) || [],
      skills: item.skills?.map((r) => r.skill.name) || [],
      tags: item.tags?.map((r) => r.tag.name) || [],
    };

    const exactTerms = extractExactTerms(item.title, item.summary, taxonomy);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'JOURNAL_ENTRY',
      entityId: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      bodyText: item.content?.slice(0, 10000) || '',
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.publishedAt,
      archivedAt: item.deletedAt || item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Project into search_documents projection.
   */
  static async syncProject(projectId: string): Promise<void> {
    const item = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
        tags: { with: { tag: true } },
      },
    });

    if (!item) return;

    const taxonomy = {
      domains: item.domains?.map((r) => r.domain.name) || [],
      technologies: item.technologies?.map((r) => r.technology.name) || [],
      skills: item.skills?.map((r) => r.skill.name) || [],
      tags: item.tags?.map((r) => r.tag.name) || [],
    };

    const exactTerms = extractExactTerms(item.title, item.shortDescription, taxonomy);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'PROJECT',
      entityId: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.shortDescription,
      bodyText: item.description?.slice(0, 10000) || '',
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.publishedAt,
      archivedAt: item.deletedAt || item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Project Case Study into search_documents projection.
   */
  static async syncCaseStudy(caseStudyId: string): Promise<void> {
    const item = await db.query.projectCaseStudies.findFirst({
      where: eq(projectCaseStudies.id, caseStudyId),
      with: {
        project: true,
      },
    });

    if (!item) return;

    const title = item.title || 'Case Study';
    const summary = item.executiveSummary || item.problemStatement || '';
    const exactTerms = extractExactTerms(title, summary);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'PROJECT_CASE_STUDY',
      entityId: item.id,
      title,
      slug: item.project?.slug || null,
      summary,
      bodyText: `${item.problemStatement || ''}\n${item.executiveSummary || ''}`.slice(0, 10000),
      visibility: item.visibility || item.project?.visibility || 'private',
      publicationStatus: item.publicationStatus,
      publishedAt: item.publishedAt || item.project?.publishedAt || null,
      archivedAt: item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Career Experience into search_documents projection.
   */
  static async syncExperience(experienceId: string): Promise<void> {
    const item = await db.query.careerExperiences.findFirst({
      where: eq(careerExperiences.id, experienceId),
      with: {
        organization: true,
        skills: { with: { skill: true } },
      },
    });

    if (!item) return;

    const taxonomy = {
      domains: [],
      technologies: [],
      skills: item.skills?.map((s) => s.skill.name) || [],
      tags: [],
    };

    const title = `${item.position} at ${item.organization?.name || 'Organization'}`;
    const summary = item.description || '';
    const exactTerms = extractExactTerms(title, summary, taxonomy);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'EXPERIENCE',
      entityId: item.id,
      title,
      slug: null,
      summary,
      bodyText: summary,
      visibility: item.visibility,
      publicationStatus: item.publicationStatus || 'published',
      publishedAt: item.startDate ? new Date(item.startDate) : null,
      archivedAt: item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Learning Path into search_documents projection.
   */
  static async syncLearningPath(pathId: string): Promise<void> {
    const item = await db.query.learningPaths.findFirst({
      where: eq(learningPaths.id, pathId),
    });

    if (!item) return;

    const summary = item.summary || '';
    const exactTerms = extractExactTerms(item.title, summary);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'LEARNING_PATH',
      entityId: item.id,
      title: item.title,
      slug: item.slug,
      summary,
      bodyText: summary,
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.publishedAt || item.updatedAt,
      archivedAt: item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Roadmap Item into search_documents projection.
   */
  static async syncRoadmapItem(roadmapId: string): Promise<void> {
    const item = await db.query.roadmapItems.findFirst({
      where: eq(roadmapItems.id, roadmapId),
    });

    if (!item) return;

    const exactTerms = extractExactTerms(item.title, item.description);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'ROADMAP',
      entityId: item.id,
      title: item.title,
      slug: null,
      summary: item.description,
      bodyText: item.description || '',
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.targetDate ? new Date(item.targetDate) : null,
      archivedAt: item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Certificate into search_documents projection.
   */
  static async syncCertificate(certId: string): Promise<void> {
    const item = await db.query.certificates.findFirst({
      where: eq(certificates.id, certId),
    });

    if (!item) return;

    const title = item.title || item.name;
    const exactTerms = extractExactTerms(title, item.issuer);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'CERTIFICATE',
      entityId: item.id,
      title: `${title} (${item.issuer})`,
      slug: null,
      summary: `${item.issuer} - Issued: ${item.issuedAt || 'N/A'}`,
      bodyText: item.credentialUrl || '',
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.issuedAt ? new Date(item.issuedAt) : null,
      archivedAt: item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Skill into search_documents projection.
   */
  static async syncSkill(skillId: string): Promise<void> {
    const item = await db.query.skills.findFirst({
      where: eq(skills.id, skillId),
    });

    if (!item) return;

    const exactTerms = extractExactTerms(item.name, item.description);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'SKILL',
      entityId: item.id,
      title: item.name,
      slug: item.slug,
      summary: item.description,
      bodyText: item.category || '',
      visibility: 'public',
      publicationStatus: 'published',
      publishedAt: item.createdAt,
      archivedAt: null,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Domain into search_documents projection.
   */
  static async syncDomain(domainId: string): Promise<void> {
    const item = await db.query.domains.findFirst({
      where: eq(domains.id, domainId),
    });

    if (!item) return;

    const exactTerms = extractExactTerms(item.name, item.description);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'DOMAIN',
      entityId: item.id,
      title: item.name,
      slug: item.slug,
      summary: item.description,
      bodyText: item.description || '',
      visibility: 'public',
      publicationStatus: 'published',
      publishedAt: item.createdAt,
      archivedAt: null,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Technology into search_documents projection.
   */
  static async syncTechnology(techId: string): Promise<void> {
    const item = await db.query.technologies.findFirst({
      where: eq(technologies.id, techId),
    });

    if (!item) return;

    const exactTerms = extractExactTerms(item.name, item.description);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'TECHNOLOGY',
      entityId: item.id,
      title: item.name,
      slug: item.slug,
      summary: item.description,
      bodyText: item.category || '',
      visibility: 'public',
      publicationStatus: 'published',
      publishedAt: item.createdAt,
      archivedAt: null,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Media asset metadata (Owner-only search).
   */
  static async syncMedia(mediaId: string): Promise<void> {
    const item = await db.query.media.findFirst({
      where: eq(media.id, mediaId),
    });

    if (!item) return;

    const exactTerms = extractExactTerms(item.originalName, item.caption);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'MEDIA',
      entityId: item.id,
      title: item.originalName,
      slug: null,
      summary: item.altText || item.caption,
      bodyText: item.mimeType,
      visibility: item.visibility,
      publicationStatus: 'published',
      publishedAt: item.createdAt,
      archivedAt: item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Synchronizes a Now Entry (Owner-only search).
   */
  static async syncNowEntry(entryId: string): Promise<void> {
    const item = await db.query.nowEntries.findFirst({
      where: eq(nowEntries.id, entryId),
    });

    if (!item) return;

    const exactTerms = extractExactTerms(item.title, item.description);

    await SearchRepositoryService.upsertDocument({
      ownerId: item.ownerId,
      entityType: 'NOW_ENTRY',
      entityId: item.id,
      title: item.title,
      slug: null,
      summary: item.description,
      bodyText: `${item.entryType} - ${item.description || ''}`,
      visibility: item.visibility,
      publicationStatus: item.publicationStatus,
      publishedAt: item.publishedAt || item.createdAt,
      archivedAt: item.archivedAt,
      sourceUpdatedAt: item.updatedAt,
      projectionVersion: SEARCH_PROJECTION_VERSION,
      taxonomy: null,
      exactTerms,
    });
  }

  /**
   * Removes projection on entity deletion.
   */
  static async removeEntity(
    ownerId: string,
    entityType: SearchableEntityType,
    entityId: string
  ): Promise<void> {
    await SearchRepositoryService.deleteDocument(ownerId, entityType, entityId);
  }
}
