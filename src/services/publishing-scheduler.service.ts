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
import { eq, and, sql, isNull, lte } from 'drizzle-orm';
import { PublishingService } from './publishing.service';
import {
  PUBLISHABLE_ENTITY_TYPES,
  type PublishableEntityType,
} from '@/domain/publishing';

export interface SchedulerExecutionResult {
  processed: number;
  succeeded: number;
  failed: number;
  results: Array<{
    id: string;
    entityType: PublishableEntityType;
    status: 'published' | 'failed';
    error?: string;
  }>;
}

export class PublishingSchedulerService {
  /**
   * Processes all due scheduled publications with per-entity transaction isolation (Amendments 18, 20, 21, 22).
   */
  static async processDuePublications(executor = db): Promise<SchedulerExecutionResult> {
    const dueItems: Array<{ id: string; ownerId: string; entityType: PublishableEntityType }> = [];
    const now = new Date();

    // 1. Scan 11 tables for due items (publicationStatus = 'scheduled' AND scheduledPublishAt <= now AND archivedAt IS NULL)
    const [
      dueArticles,
      dueNotes,
      dueAdrs,
      dueJournal,
      dueProjects,
      dueCaseStudies,
      dueCareer,
      dueLearning,
      dueRoadmap,
      dueCerts,
      dueNow,
    ] = await Promise.all([
      executor.query.articles.findMany({
        where: and(
          eq(articles.publicationStatus, 'scheduled'),
          lte(articles.scheduledPublishAt, now),
          isNull(articles.archivedAt),
          isNull(articles.deletedAt)
        ),
      }),
      executor.query.notes.findMany({
        where: and(
          eq(notes.publicationStatus, 'scheduled'),
          lte(notes.scheduledPublishAt, now),
          isNull(notes.archivedAt),
          isNull(notes.deletedAt)
        ),
      }),
      executor.query.adrs.findMany({
        where: and(
          eq(adrs.publicationStatus, 'scheduled'),
          lte(adrs.scheduledPublishAt, now),
          isNull(adrs.archivedAt)
        ),
      }),
      executor.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.publicationStatus, 'scheduled'),
          lte(journalEntries.scheduledPublishAt, now),
          isNull(journalEntries.archivedAt),
          isNull(journalEntries.deletedAt)
        ),
      }),
      executor.query.projects.findMany({
        where: and(
          eq(projects.publicationStatus, 'scheduled'),
          lte(projects.scheduledPublishAt, now),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt)
        ),
      }),
      executor.query.projectCaseStudies.findMany({
        where: and(
          eq(projectCaseStudies.publicationStatus, 'scheduled'),
          lte(projectCaseStudies.scheduledPublishAt, now),
          isNull(projectCaseStudies.archivedAt)
        ),
      }),
      executor.query.careerExperiences.findMany({
        where: and(
          eq(careerExperiences.publicationStatus, 'scheduled'),
          lte(careerExperiences.scheduledPublishAt, now),
          isNull(careerExperiences.archivedAt),
          isNull(careerExperiences.deletedAt)
        ),
      }),
      executor.query.learningPaths.findMany({
        where: and(
          eq(learningPaths.publicationStatus, 'scheduled'),
          lte(learningPaths.scheduledPublishAt, now),
          isNull(learningPaths.archivedAt)
        ),
      }),
      executor.query.roadmapItems.findMany({
        where: and(
          eq(roadmapItems.publicationStatus, 'scheduled'),
          lte(roadmapItems.scheduledPublishAt, now),
          isNull(roadmapItems.archivedAt)
        ),
      }),
      executor.query.certificates.findMany({
        where: and(
          eq(certificates.publicationStatus, 'scheduled'),
          lte(certificates.scheduledPublishAt, now),
          isNull(certificates.archivedAt)
        ),
      }),
      executor.query.nowEntries.findMany({
        where: and(
          eq(nowEntries.publicationStatus, 'scheduled'),
          lte(nowEntries.scheduledPublishAt, now),
          isNull(nowEntries.archivedAt)
        ),
      }),
    ]);

    for (const a of dueArticles) dueItems.push({ id: a.id, ownerId: a.ownerId, entityType: 'ARTICLE' });
    for (const n of dueNotes) dueItems.push({ id: n.id, ownerId: n.ownerId, entityType: 'TECH_NOTE' });
    for (const adr of dueAdrs) dueItems.push({ id: adr.id, ownerId: adr.ownerId, entityType: 'ADR' });
    for (const j of dueJournal) dueItems.push({ id: j.id, ownerId: j.ownerId, entityType: 'JOURNAL_ENTRY' });
    for (const p of dueProjects) dueItems.push({ id: p.id, ownerId: p.ownerId, entityType: 'PROJECT' });
    for (const cs of dueCaseStudies) dueItems.push({ id: cs.id, ownerId: cs.ownerId, entityType: 'PROJECT_CASE_STUDY' });
    for (const c of dueCareer) dueItems.push({ id: c.id, ownerId: c.ownerId, entityType: 'EXPERIENCE' });
    for (const lp of dueLearning) dueItems.push({ id: lp.id, ownerId: lp.ownerId, entityType: 'LEARNING_PATH' });
    for (const rm of dueRoadmap) dueItems.push({ id: rm.id, ownerId: rm.ownerId, entityType: 'ROADMAP' });
    for (const cert of dueCerts) dueItems.push({ id: cert.id, ownerId: cert.ownerId, entityType: 'CERTIFICATE' });
    for (const nowE of dueNow) dueItems.push({ id: nowE.id, ownerId: nowE.ownerId, entityType: 'NOW_ENTRY' });

    let succeeded = 0;
    let failed = 0;
    const results: SchedulerExecutionResult['results'] = [];

    // 2. Process each due publication independently (Amendment 21)
    for (const item of dueItems) {
      try {
        await PublishingService.publishNow(
          item.ownerId,
          item.entityType,
          item.id,
          item.ownerId,
          executor
        );
        succeeded++;
        results.push({
          id: item.id,
          entityType: item.entityType,
          status: 'published',
        });
      } catch (err: any) {
        failed++;
        results.push({
          id: item.id,
          entityType: item.entityType,
          status: 'failed',
          error: err?.message || 'Publication failed during scheduler execution.',
        });
      }
    }

    return {
      processed: dueItems.length,
      succeeded,
      failed,
      results,
    };
  }
}
