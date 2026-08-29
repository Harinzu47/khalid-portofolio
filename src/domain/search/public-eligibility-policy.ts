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
} from '@/db/schema';
import { inArray, and, eq, isNull, lte, sql } from 'drizzle-orm';
import type { SearchableEntityType } from './search-entity-registry';

export interface EntityKey {
  entityType: SearchableEntityType;
  entityId: string;
}

/**
 * Validates candidates against canonical live database tables to ensure FAIL-CLOSED security (Amendments 5, 6, 7).
 * Even if a search_documents row is stale and marked public, if the canonical entity has been made
 * private, draft, unlisted, or archived, this policy discards it.
 */
export async function validateCanonicalPublicEligibility(
  keys: EntityKey[]
): Promise<Set<string>> {
  if (keys.length === 0) return new Set();

  const now = new Date();
  const validIds = new Set<string>();

  // Group entity IDs by type
  const byType = new Map<SearchableEntityType, string[]>();
  for (const k of keys) {
    const list = byType.get(k.entityType) || [];
    list.push(k.entityId);
    byType.set(k.entityType, list);
  }

  const queries: Promise<void>[] = [];

  // 1. Articles
  const articleIds = byType.get('ARTICLE');
  if (articleIds && articleIds.length > 0) {
    queries.push(
      db.query.articles
        .findMany({
          where: and(
            inArray(articles.id, articleIds),
            eq(articles.visibility, 'public'),
            eq(articles.status, 'published'),
            lte(articles.publishedAt, now),
            isNull(articles.deletedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  // 2. Tech Notes
  const noteIds = byType.get('TECH_NOTE');
  if (noteIds && noteIds.length > 0) {
    queries.push(
      db.query.notes
        .findMany({
          where: and(
            inArray(notes.id, noteIds),
            eq(notes.visibility, 'public'),
            eq(notes.status, 'published'),
            lte(notes.publishedAt, now),
            isNull(notes.deletedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  // 3. ADRs
  const adrIds = byType.get('ADR');
  if (adrIds && adrIds.length > 0) {
    queries.push(
      db.query.adrs
        .findMany({
          where: and(
            inArray(adrs.id, adrIds),
            eq(adrs.visibility, 'public'),
            eq(adrs.publicationStatus, 'published'),
            lte(adrs.publishedAt, now),
            isNull(adrs.archivedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  // 4. Journal Entries (Public only!)
  const journalIds = byType.get('JOURNAL_ENTRY');
  if (journalIds && journalIds.length > 0) {
    queries.push(
      db.query.journalEntries
        .findMany({
          where: and(
            inArray(journalEntries.id, journalIds),
            eq(journalEntries.visibility, 'public'),
            eq(journalEntries.status, 'published'),
            lte(journalEntries.publishedAt, now),
            isNull(journalEntries.deletedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  // 5. Projects
  const projectIds = byType.get('PROJECT');
  if (projectIds && projectIds.length > 0) {
    queries.push(
      db.query.projects
        .findMany({
          where: and(
            inArray(projects.id, projectIds),
            eq(projects.visibility, 'public'),
            eq(projects.status, 'published'),
            lte(projects.publishedAt, now),
            isNull(projects.deletedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  // 6. Project Case Studies (Parent Project Dependency Check - Amendment 5)
  const caseStudyIds = byType.get('PROJECT_CASE_STUDY');
  if (caseStudyIds && caseStudyIds.length > 0) {
    queries.push(
      db.query.projectCaseStudies
        .findMany({
          where: and(
            inArray(projectCaseStudies.id, caseStudyIds),
            eq(projectCaseStudies.publicationStatus, 'published'),
            isNull(projectCaseStudies.archivedAt)
          ),
          with: {
            project: {
              columns: {
                id: true,
                visibility: true,
                status: true,
                publishedAt: true,
                deletedAt: true,
                archivedAt: true,
              },
            },
          },
        })
        .then((rows) => {
          for (const cs of rows) {
            // Case study is valid ONLY IF parent project is also public, published, and not deleted/archived
            if (
              cs.project &&
              cs.project.visibility === 'public' &&
              cs.project.publishedAt &&
              cs.project.publishedAt <= now &&
              !cs.project.deletedAt &&
              !cs.project.archivedAt
            ) {
              validIds.add(cs.id);
            }
          }
        })
    );
  }

  // 7. Career Experiences
  const expIds = byType.get('EXPERIENCE');
  if (expIds && expIds.length > 0) {
    queries.push(
      db.query.careerExperiences
        .findMany({
          where: and(
            inArray(careerExperiences.id, expIds),
            eq(careerExperiences.visibility, 'public'),
            isNull(careerExperiences.archivedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  // 8. Learning Paths
  const lpIds = byType.get('LEARNING_PATH');
  if (lpIds && lpIds.length > 0) {
    queries.push(
      db.query.learningPaths
        .findMany({
          where: and(
            inArray(learningPaths.id, lpIds),
            eq(learningPaths.visibility, 'public'),
            eq(learningPaths.status, 'published'),
            isNull(learningPaths.archivedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  // 9. Roadmap Items
  const roadmapItemIds = byType.get('ROADMAP');
  if (roadmapItemIds && roadmapItemIds.length > 0) {
    queries.push(
      db.query.roadmapItems
        .findMany({
          where: and(
            inArray(roadmapItems.id, roadmapItemIds),
            eq(roadmapItems.visibility, 'public'),
            eq(roadmapItems.status, 'published'),
            isNull(roadmapItems.archivedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  // 10. Certificates
  const certIds = byType.get('CERTIFICATE');
  if (certIds && certIds.length > 0) {
    queries.push(
      db.query.certificates
        .findMany({
          where: and(
            inArray(certificates.id, certIds),
            eq(certificates.visibility, 'public'),
            eq(certificates.publicationStatus, 'published'),
            isNull(certificates.archivedAt)
          ),
          columns: { id: true },
        })
        .then((rows) => rows.forEach((r) => validIds.add(r.id)))
    );
  }

  await Promise.all(queries);
  return validIds;
}
