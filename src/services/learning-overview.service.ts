import { db } from '@/db/client';
import { learningPaths, nowEntries, roadmapItems, certificates } from '@/db/schema';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import type {
  LearningOverviewDTO,
  LearningPathListItemDTO,
  NowEntryListItemDTO,
  RoadmapListItemDTO,
  NowEntryType,
  LearningPathStatus,
  RoadmapStatus,
} from '@/types/dtos';

export class LearningOverviewService {
  /**
   * Aggregate read model for /admin/learning (Amendment 2).
   * Retrieves active learning paths, current LEARNING focus NowEntries, upcoming roadmap items, and counts.
   */
  static async getOverview(ownerId: string): Promise<LearningOverviewDTO> {
    const [
      activePathsRaw,
      currentLearningNowRaw,
      upcomingRoadmapRaw,
      totalPathsCount,
      totalCertsCount,
      totalRoadmapCount,
      totalCurrentNowCount,
    ] = await Promise.all([
      // 1. Active learning paths
      db.query.learningPaths.findMany({
        where: and(
          eq(learningPaths.ownerId, ownerId),
          eq(learningPaths.status, 'active'),
          isNull(learningPaths.archivedAt)
        ),
        orderBy: [desc(learningPaths.updatedAt)],
        limit: 10,
        with: {
          skills: { with: { skill: true } },
          domains: { with: { domain: true } },
          technologies: { with: { technology: true } },
        },
      }),

      // 2. Current LEARNING focus NowEntries
      db.query.nowEntries.findMany({
        where: and(
          eq(nowEntries.ownerId, ownerId),
          eq(nowEntries.entryType, 'learning'),
          eq(nowEntries.isCurrent, true),
          isNull(nowEntries.archivedAt)
        ),
        orderBy: [desc(nowEntries.sortOrder), desc(nowEntries.createdAt)],
        limit: 10,
        with: {
          projects: { with: { project: true } },
          learningPaths: { with: { learningPath: true } },
          roadmaps: { with: { roadmap: true } },
          domains: { with: { domain: true } },
          technologies: { with: { technology: true } },
        },
      }),

      // 3. Upcoming/active roadmap items (backlog, planned, in_progress)
      db.query.roadmapItems.findMany({
        where: and(
          eq(roadmapItems.ownerId, ownerId),
          isNull(roadmapItems.archivedAt)
        ),
        orderBy: [asc(roadmapItems.sortOrder), desc(roadmapItems.priority)],
        limit: 10,
      }),

      // Counts
      db.select({ count: sql<number>`count(*)::int` }).from(learningPaths).where(eq(learningPaths.ownerId, ownerId)),
      db.select({ count: sql<number>`count(*)::int` }).from(certificates).where(eq(certificates.ownerId, ownerId)),
      db.select({ count: sql<number>`count(*)::int` }).from(roadmapItems).where(eq(roadmapItems.ownerId, ownerId)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(nowEntries)
        .where(and(eq(nowEntries.ownerId, ownerId), eq(nowEntries.isCurrent, true))),
    ]);

    const activeLearningPaths: LearningPathListItemDTO[] = activePathsRaw.map((lp) => ({
      id: lp.id,
      title: lp.title,
      slug: lp.slug,
      summary: lp.summary,
      status: lp.status as LearningPathStatus,
      startedAt: lp.startedAt,
      completedAt: lp.completedAt,
      progressMode: lp.progressMode as any,
      progressValue: lp.progressValue,
      currentFocus: lp.currentFocus,
      visibility: lp.visibility as any,
      publicationStatus: lp.publicationStatus,
      skills: (lp.skills || []).map((s: any) => ({
        id: s.skill?.id || s.skillId,
        name: s.skill?.name || 'Skill',
      })),
      domains: (lp.domains || []).map((d: any) => ({
        id: d.domain?.id || d.domainId,
        name: d.domain?.name || 'Domain',
      })),
      technologies: (lp.technologies || []).map((t: any) => ({
        id: t.technology?.id || t.technologyId,
        name: t.technology?.name || 'Technology',
      })),
      createdAt: lp.createdAt.toISOString(),
      updatedAt: lp.updatedAt.toISOString(),
    }));

    const currentLearningNowEntries: NowEntryListItemDTO[] = currentLearningNowRaw.map((entry) => ({
      id: entry.id,
      entryType: entry.entryType as NowEntryType,
      title: entry.title,
      description: entry.description,
      status: entry.status as any,
      isCurrent: entry.isCurrent,
      startedAt: entry.startedAt,
      endedAt: entry.endedAt,
      sortOrder: entry.sortOrder,
      visibility: entry.visibility as any,
      publicationStatus: entry.publicationStatus,
      projectNames: (entry.projects || []).map((p: any) => p.project?.title || p.project?.name).filter(Boolean),
      learningPathNames: (entry.learningPaths || []).map((lp: any) => lp.learningPath?.title).filter(Boolean),
      roadmapItemNames: (entry.roadmaps || []).map((r: any) => r.roadmap?.title).filter(Boolean),
      domainNames: (entry.domains || []).map((d: any) => d.domain?.name).filter(Boolean),
      technologyNames: (entry.technologies || []).map((t: any) => t.technology?.name).filter(Boolean),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

    const upcomingRoadmapItems: RoadmapListItemDTO[] = upcomingRoadmapRaw.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      category: item.category,
      roadmapType: item.roadmapType,
      status: item.status as RoadmapStatus,
      priority: item.priority || 1,
      startDate: item.startDate,
      targetDate: item.targetDate,
      sortOrder: item.sortOrder,
      visibility: item.visibility as any,
      publicationStatus: item.publicationStatus,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return {
      activeLearningPaths,
      currentLearningNowEntries,
      upcomingRoadmapItems,
      totalLearningPaths: totalPathsCount[0]?.count || 0,
      totalCertificates: totalCertsCount[0]?.count || 0,
      totalRoadmapItems: totalRoadmapCount[0]?.count || 0,
      totalCurrentNow: totalCurrentNowCount[0]?.count || 0,
    };
  }
}
