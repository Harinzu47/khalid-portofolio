import { db } from '@/db/client';
import {
  auditLogs,
  projects,
  articles,
  journalEntries,
  notes,
  careerExperiences,
  skills,
  technologies,
  certificates,
  media,
  roadmapItems,
  learningGoals,
} from '@/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';

export interface AuditLogFilterParams extends PaginationParams {
  action?: string;
  entityType?: string;
}

export class AnalyticsService {
  /**
   * Fetches paginated audit logs with optional action/entity filters.
   */
  static async getAuditLogs(params?: AuditLogFilterParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = [];
    if (params?.action) {
      conditions.push(eq(auditLogs.action, params.action));
    }
    if (params?.entityType) {
      conditions.push(eq(auditLogs.entityType, params.entityType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db.query.auditLogs.findMany({
        where: whereClause,
        orderBy: [desc(auditLogs.createdAt)],
        limit,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(whereClause),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Exports full audit history for security compliance and offline analysis.
   */
  static async exportAuditLogs() {
    return await db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.createdAt)],
      limit: 1000,
    });
  }

  /**
   * Computes operational system telemetry and domain entity metrics.
   */
  static async getSystemMetrics() {
    const [
      projectCount,
      articleCount,
      journalCount,
      noteCount,
      careerCount,
      skillCount,
      techCount,
      certCount,
      mediaCount,
      roadmapCount,
      goalCount,
      auditCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(projects),
      db.select({ count: sql<number>`count(*)::int` }).from(articles),
      db.select({ count: sql<number>`count(*)::int` }).from(journalEntries),
      db.select({ count: sql<number>`count(*)::int` }).from(notes),
      db.select({ count: sql<number>`count(*)::int` }).from(careerExperiences),
      db.select({ count: sql<number>`count(*)::int` }).from(skills),
      db.select({ count: sql<number>`count(*)::int` }).from(technologies),
      db.select({ count: sql<number>`count(*)::int` }).from(certificates),
      db.select({ count: sql<number>`count(*)::int` }).from(media),
      db.select({ count: sql<number>`count(*)::int` }).from(roadmapItems),
      db.select({ count: sql<number>`count(*)::int` }).from(learningGoals),
      db.select({ count: sql<number>`count(*)::int` }).from(auditLogs),
    ]);

    // Action distribution in audit logs
    const recentAudit = await db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.createdAt)],
      limit: 100,
    });

    const actionCounts: Record<string, number> = {};
    for (const log of recentAudit) {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    }

    return {
      entities: {
        projects: projectCount[0]?.count || 0,
        articles: articleCount[0]?.count || 0,
        journalEntries: journalCount[0]?.count || 0,
        notes: noteCount[0]?.count || 0,
        career: careerCount[0]?.count || 0,
        skills: skillCount[0]?.count || 0,
        technologies: techCount[0]?.count || 0,
        certificates: certCount[0]?.count || 0,
        media: mediaCount[0]?.count || 0,
        roadmapItems: roadmapCount[0]?.count || 0,
        learningGoals: goalCount[0]?.count || 0,
        totalAuditEvents: auditCount[0]?.count || 0,
      },
      telemetry: {
        nodeVersion: process.version,
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        status: 'OPERATIONAL',
      },
      actionDistribution: actionCounts,
    };
  }
}
