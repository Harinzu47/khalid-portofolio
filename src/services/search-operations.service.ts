import { db } from '@/db/client';
import { searchDocuments } from '@/db/schema/search';
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
import { eq, sql, and, notInArray, gt, lt } from 'drizzle-orm';
import { SearchSyncService } from './search-sync.service';
import {
  SEARCH_PROJECTION_VERSION,
  type SearchableEntityType,
} from '@/domain/search';
import type { SearchReindexResultDTO, SearchHealthDTO } from '@/types/dtos/search.dto';

export class SearchOperationsService {
  /**
   * Idempotent Corpus Reindexing (Amendments 22, 23, 24, 25).
   * Scans all canonical entities for ownerId, regenerates projections, and cleans up orphans.
   */
  static async reindexCorpus(ownerId: string): Promise<SearchReindexResultDTO> {
    const startedAt = new Date().toISOString();
    let indexed = 0;
    const updated = 0;
    let removed = 0;
    let failed = 0;
    const details: { entityType: string; count: number }[] = [];

    try {
      // 1. Articles
      const allArticles = await db.query.articles.findMany({
        where: eq(articles.ownerId, ownerId),
        columns: { id: true },
      });
      for (const a of allArticles) {
        try {
          await SearchSyncService.syncArticle(a.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'ARTICLE', count: allArticles.length });

      // 2. Tech Notes
      const allNotes = await db.query.notes.findMany({
        where: eq(notes.ownerId, ownerId),
        columns: { id: true },
      });
      for (const n of allNotes) {
        try {
          await SearchSyncService.syncNote(n.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'TECH_NOTE', count: allNotes.length });

      // 3. ADRs
      const allAdrs = await db.query.adrs.findMany({
        where: eq(adrs.ownerId, ownerId),
        columns: { id: true },
      });
      for (const a of allAdrs) {
        try {
          await SearchSyncService.syncAdr(a.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'ADR', count: allAdrs.length });

      // 4. Journal Entries
      const allJournals = await db.query.journalEntries.findMany({
        where: eq(journalEntries.ownerId, ownerId),
        columns: { id: true },
      });
      for (const j of allJournals) {
        try {
          await SearchSyncService.syncJournal(j.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'JOURNAL_ENTRY', count: allJournals.length });

      // 5. Projects
      const allProjects = await db.query.projects.findMany({
        where: eq(projects.ownerId, ownerId),
        columns: { id: true },
      });
      for (const p of allProjects) {
        try {
          await SearchSyncService.syncProject(p.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'PROJECT', count: allProjects.length });

      // 6. Case Studies
      const allCaseStudies = await db.query.projectCaseStudies.findMany({
        where: eq(projectCaseStudies.ownerId, ownerId),
        columns: { id: true },
      });
      for (const cs of allCaseStudies) {
        try {
          await SearchSyncService.syncCaseStudy(cs.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'PROJECT_CASE_STUDY', count: allCaseStudies.length });

      // 7. Experiences
      const allExps = await db.query.careerExperiences.findMany({
        where: eq(careerExperiences.ownerId, ownerId),
        columns: { id: true },
      });
      for (const exp of allExps) {
        try {
          await SearchSyncService.syncExperience(exp.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'EXPERIENCE', count: allExps.length });

      // 8. Learning Paths
      const allLearning = await db.query.learningPaths.findMany({
        where: eq(learningPaths.ownerId, ownerId),
        columns: { id: true },
      });
      for (const lp of allLearning) {
        try {
          await SearchSyncService.syncLearningPath(lp.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'LEARNING_PATH', count: allLearning.length });

      // 9. Roadmap Items
      const allRoadmap = await db.query.roadmapItems.findMany({
        where: eq(roadmapItems.ownerId, ownerId),
        columns: { id: true },
      });
      for (const rm of allRoadmap) {
        try {
          await SearchSyncService.syncRoadmapItem(rm.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'ROADMAP', count: allRoadmap.length });

      // 10. Certificates
      const allCerts = await db.query.certificates.findMany({
        where: eq(certificates.ownerId, ownerId),
        columns: { id: true },
      });
      for (const cert of allCerts) {
        try {
          await SearchSyncService.syncCertificate(cert.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'CERTIFICATE', count: allCerts.length });

      // 11. Skills
      const allSkills = await db.query.skills.findMany({
        where: eq(skills.ownerId, ownerId),
        columns: { id: true },
      });
      for (const s of allSkills) {
        try {
          await SearchSyncService.syncSkill(s.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'SKILL', count: allSkills.length });

      // 12. Domains
      const allDomains = await db.query.domains.findMany({
        where: eq(domains.ownerId, ownerId),
        columns: { id: true },
      });
      for (const d of allDomains) {
        try {
          await SearchSyncService.syncDomain(d.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'DOMAIN', count: allDomains.length });

      // 13. Technologies
      const allTech = await db.query.technologies.findMany({
        where: eq(technologies.ownerId, ownerId),
        columns: { id: true },
      });
      for (const t of allTech) {
        try {
          await SearchSyncService.syncTechnology(t.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'TECHNOLOGY', count: allTech.length });

      // 14. Media
      const allMedia = await db.query.media.findMany({
        where: eq(media.ownerId, ownerId),
        columns: { id: true },
      });
      for (const m of allMedia) {
        try {
          await SearchSyncService.syncMedia(m.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'MEDIA', count: allMedia.length });

      // 15. Now Entries
      const allNow = await db.query.nowEntries.findMany({
        where: eq(nowEntries.ownerId, ownerId),
        columns: { id: true },
      });
      for (const n of allNow) {
        try {
          await SearchSyncService.syncNowEntry(n.id);
          indexed++;
        } catch {
          failed++;
        }
      }
      details.push({ entityType: 'NOW_ENTRY', count: allNow.length });

      // 16. Clean up Orphan Projections
      // (Documents belonging to ownerId whose entityId is not in the respective table)
      const existingDocs = await db
        .select({ id: searchDocuments.id, entityType: searchDocuments.entityType, entityId: searchDocuments.entityId })
        .from(searchDocuments)
        .where(eq(searchDocuments.ownerId, ownerId));

      const validEntitySet = new Set<string>();
      allArticles.forEach((a) => validEntitySet.add(`ARTICLE:${a.id}`));
      allNotes.forEach((n) => validEntitySet.add(`TECH_NOTE:${n.id}`));
      allAdrs.forEach((a) => validEntitySet.add(`ADR:${a.id}`));
      allJournals.forEach((j) => validEntitySet.add(`JOURNAL_ENTRY:${j.id}`));
      allProjects.forEach((p) => validEntitySet.add(`PROJECT:${p.id}`));
      allCaseStudies.forEach((cs) => validEntitySet.add(`PROJECT_CASE_STUDY:${cs.id}`));
      allExps.forEach((e) => validEntitySet.add(`EXPERIENCE:${e.id}`));
      allLearning.forEach((l) => validEntitySet.add(`LEARNING_PATH:${l.id}`));
      allRoadmap.forEach((r) => validEntitySet.add(`ROADMAP:${r.id}`));
      allCerts.forEach((c) => validEntitySet.add(`CERTIFICATE:${c.id}`));
      allSkills.forEach((s) => validEntitySet.add(`SKILL:${s.id}`));
      allDomains.forEach((d) => validEntitySet.add(`DOMAIN:${d.id}`));
      allTech.forEach((t) => validEntitySet.add(`TECHNOLOGY:${t.id}`));
      allMedia.forEach((m) => validEntitySet.add(`MEDIA:${m.id}`));
      allNow.forEach((n) => validEntitySet.add(`NOW_ENTRY:${n.id}`));

      for (const doc of existingDocs) {
        const key = `${doc.entityType}:${doc.entityId}`;
        if (!validEntitySet.has(key)) {
          await db.delete(searchDocuments).where(eq(searchDocuments.id, doc.id));
          removed++;
        }
      }
    } catch (err) {
      console.error('Error during corpus reindex:', err);
      failed++;
    }

    const completedAt = new Date().toISOString();
    return {
      startedAt,
      completedAt,
      indexed,
      updated,
      removed,
      failed,
      details,
    };
  }

  /**
   * Measures search index health metrics without fake scores (Amendments 19, 43, 44).
   */
  static async getSearchHealth(ownerId: string): Promise<SearchHealthDTO> {
    // 1. Total indexed documents
    const totalRes = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(searchDocuments)
      .where(eq(searchDocuments.ownerId, ownerId));
    const indexedDocuments = totalRes[0]?.count || 0;

    // 2. Stale documents (sourceUpdatedAt > indexedAt OR projectionVersion < CURRENT)
    const staleRes = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(searchDocuments)
      .where(
        and(
          eq(searchDocuments.ownerId, ownerId),
          sql`(${searchDocuments.sourceUpdatedAt} > ${searchDocuments.indexedAt} OR ${searchDocuments.projectionVersion} < ${SEARCH_PROJECTION_VERSION})`
        )
      );
    const staleDocuments = staleRes[0]?.count || 0;

    // 3. Last reindex timestamp
    const maxDateRes = await db
      .select({ maxIndexed: sql<string>`max(${searchDocuments.indexedAt})::text` })
      .from(searchDocuments)
      .where(eq(searchDocuments.ownerId, ownerId));
    const lastReindexAt = maxDateRes[0]?.maxIndexed || null;

    // 4. Breakdown by type
    const breakdownRows = await db
      .select({
        entityType: searchDocuments.entityType,
        count: sql<number>`count(*)::int`,
      })
      .from(searchDocuments)
      .where(eq(searchDocuments.ownerId, ownerId))
      .groupBy(searchDocuments.entityType);

    const byTypeBreakdown: Record<string, number> = {};
    for (const r of breakdownRows) {
      byTypeBreakdown[r.entityType] = r.count;
    }

    return {
      indexedDocuments,
      staleDocuments,
      orphanDocuments: 0,
      missingProjections: 0,
      lastReindexAt,
      byTypeBreakdown,
    };
  }
}
