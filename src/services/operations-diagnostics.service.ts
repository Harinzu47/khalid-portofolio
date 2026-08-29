import { db } from '@/db/client';
import { sql, eq, and, isNull } from 'drizzle-orm';
import {
  projects,
  articles,
  notes,
  adrs,
  journalEntries,
  media,
  knowledgeRelationships,
} from '@/db/schema';
import { SearchOperationsService } from './search-operations.service';
import fs from 'fs';
import path from 'path';

export type DiagnosticStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';

export interface DiagnosticCheckItem {
  code: string;
  status: DiagnosticStatus;
  safeMessage: string;
  checkedAt: string;
  optionalSafeDetails?: Record<string, unknown>;
}

export interface OperationsDiagnosticsReport {
  overallStatus: DiagnosticStatus;
  checkedAt: string;
  categories: {
    database: DiagnosticCheckItem;
    search: DiagnosticCheckItem;
    publishing: DiagnosticCheckItem;
    media: DiagnosticCheckItem;
    migrationsSchema: DiagnosticCheckItem;
  };
}

/**
 * OperationsDiagnosticsService
 * Real-data private owner-only diagnostics surface for HZCODE Developer OS.
 * No percentages, no fake uptime, no decorative telemetry.
 */
export class OperationsDiagnosticsService {
  /**
   * Runs all operational diagnostics using real database and system state.
   */
  static async runDiagnostics(ownerId: string): Promise<OperationsDiagnosticsReport> {
    const checkedAt = new Date().toISOString();

    const [
      dbCheck,
      searchCheck,
      publishingCheck,
      mediaCheck,
      migrationsCheck,
    ] = await Promise.all([
      this.checkDatabase(),
      this.checkSearch(ownerId),
      this.checkPublishing(ownerId),
      this.checkMedia(ownerId),
      this.checkMigrationsSchema(),
    ]);

    const allChecks = [dbCheck, searchCheck, publishingCheck, mediaCheck, migrationsCheck];
    let overallStatus: DiagnosticStatus = 'HEALTHY';

    if (allChecks.some((c) => c.status === 'UNHEALTHY')) {
      overallStatus = 'UNHEALTHY';
    } else if (allChecks.some((c) => c.status === 'DEGRADED')) {
      overallStatus = 'DEGRADED';
    } else if (allChecks.some((c) => c.status === 'UNKNOWN')) {
      overallStatus = 'UNKNOWN';
    }

    return {
      overallStatus,
      checkedAt,
      categories: {
        database: dbCheck,
        search: searchCheck,
        publishing: publishingCheck,
        media: mediaCheck,
        migrationsSchema: migrationsCheck,
      },
    };
  }

  /**
   * 1. DATABASE Diagnostic
   */
  static async checkDatabase(): Promise<DiagnosticCheckItem> {
    const checkedAt = new Date().toISOString();
    const startTime = Date.now();

    try {
      await db.execute(sql`SELECT 1`);
      const latencyMs = Date.now() - startTime;

      const [projCount, artCount, jnlCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(projects),
        db.select({ count: sql<number>`count(*)::int` }).from(articles),
        db.select({ count: sql<number>`count(*)::int` }).from(journalEntries),
      ]);

      const status: DiagnosticStatus = latencyMs > 500 ? 'DEGRADED' : 'HEALTHY';
      const safeMessage =
        status === 'HEALTHY'
          ? 'Database connection active with normal response latency.'
          : 'Database connection active but experiencing elevated query latency.';

      return {
        code: 'DB_CONNECTION_ACTIVE',
        status,
        safeMessage,
        checkedAt,
        optionalSafeDetails: {
          latencyMs,
          totalProjects: projCount[0]?.count ?? 0,
          totalArticles: artCount[0]?.count ?? 0,
          totalJournalEntries: jnlCount[0]?.count ?? 0,
        },
      };
    } catch {
      return {
        code: 'DB_CONNECTION_FAILED',
        status: 'UNHEALTHY',
        safeMessage: 'Database ping failed. Engine is unreachable or query failed.',
        checkedAt,
      };
    }
  }

  /**
   * 2. SEARCH Diagnostic (reusing SearchOperationsService)
   */
  static async checkSearch(ownerId: string): Promise<DiagnosticCheckItem> {
    const checkedAt = new Date().toISOString();

    try {
      const health = await SearchOperationsService.getSearchHealth(ownerId);

      let status: DiagnosticStatus = 'HEALTHY';
      let safeMessage = 'Search projections synchronized and indexed.';

      if (health.missingProjections > 0 || health.staleDocuments > 0) {
        status = 'DEGRADED';
        safeMessage = `Search projection drift detected: ${health.missingProjections} missing, ${health.staleDocuments} stale projections.`;
      }

      return {
        code: status === 'HEALTHY' ? 'SEARCH_PROJECTIONS_HEALTHY' : 'SEARCH_PROJECTIONS_STALE',
        status,
        safeMessage,
        checkedAt,
        optionalSafeDetails: {
          indexedDocuments: health.indexedDocuments,
          staleDocuments: health.staleDocuments,
          missingProjections: health.missingProjections,
          lastReindexAt: health.lastReindexAt,
          byTypeBreakdown: health.byTypeBreakdown,
        },
      };
    } catch {
      return {
        code: 'SEARCH_HEALTH_CHECK_FAILED',
        status: 'UNKNOWN',
        safeMessage: 'Unable to evaluate search index state.',
        checkedAt,
      };
    }
  }

  /**
   * 3. PUBLISHING Diagnostic
   */
  static async checkPublishing(ownerId: string): Promise<DiagnosticCheckItem> {
    const checkedAt = new Date().toISOString();

    try {
      const now = new Date();

      // Check overdue scheduled items across articles, notes, adrs
      const [overdueArticles, overdueNotes, overdueAdrs] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(articles)
          .where(
            and(
              eq(articles.ownerId, ownerId),
              eq(articles.publicationStatus, 'scheduled'),
              isNull(articles.archivedAt),
              sql`${articles.scheduledPublishAt} <= now()`
            )
          ),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(notes)
          .where(
            and(
              eq(notes.ownerId, ownerId),
              eq(notes.publicationStatus, 'scheduled'),
              isNull(notes.archivedAt),
              sql`${notes.scheduledPublishAt} <= now()`
            )
          ),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(adrs)
          .where(
            and(
              eq(adrs.ownerId, ownerId),
              eq(adrs.publicationStatus, 'scheduled'),
              isNull(adrs.archivedAt),
              sql`${adrs.scheduledPublishAt} <= now()`
            )
          ),
      ]);

      const overdueCount =
        (overdueArticles[0]?.count ?? 0) +
        (overdueNotes[0]?.count ?? 0) +
        (overdueAdrs[0]?.count ?? 0);

      let status: DiagnosticStatus = 'HEALTHY';
      let safeMessage = 'Publishing state consistent; no overdue scheduled items.';

      if (overdueCount > 0) {
        status = 'DEGRADED';
        safeMessage = `${overdueCount} scheduled items are due for publication and pending execution.`;
      }

      return {
        code: status === 'HEALTHY' ? 'PUBLISHING_CONSISTENT' : 'PUBLISHING_OVERDUE_ITEMS',
        status,
        safeMessage,
        checkedAt,
        optionalSafeDetails: {
          overdueScheduledCount: overdueCount,
        },
      };
    } catch (err) {
      console.error('[checkPublishing Error]', err);
      return {
        code: 'PUBLISHING_DIAGNOSTICS_FAILED',
        status: 'UNKNOWN',
        safeMessage: 'Unable to evaluate publishing state.',
        checkedAt,
      };
    }
  }

  /**
   * 4. MEDIA Diagnostic
   */
  static async checkMedia(ownerId: string): Promise<DiagnosticCheckItem> {
    const checkedAt = new Date().toISOString();

    try {
      // 1. Check for media with invalid/missing MIME types or empty paths
      const invalidMedia = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(media)
        .where(
          and(
            eq(media.ownerId, ownerId),
            sql`(${media.mimeType} IS NULL OR ${media.mimeType} = '' OR ${media.path} IS NULL OR ${media.path} = '')`
          )
        );

      const invalidCount = invalidMedia[0]?.count ?? 0;

      // 2. Check for archived media still referenced by published entities in knowledge relationships
      const archivedReferenced = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(media)
        .innerJoin(
          knowledgeRelationships,
          sql`(${knowledgeRelationships.sourceId} = ${media.id} AND ${knowledgeRelationships.sourceType} = 'MEDIA') OR (${knowledgeRelationships.targetId} = ${media.id} AND ${knowledgeRelationships.targetType} = 'MEDIA')`
        )
        .where(
          and(
            eq(media.ownerId, ownerId),
            sql`${media.archivedAt} IS NOT NULL`
          )
        );

      const archivedRefCount = archivedReferenced[0]?.count ?? 0;

      let status: DiagnosticStatus = 'HEALTHY';
      let safeMessage = 'Media metadata and relationships consistent.';

      if (invalidCount > 0 || archivedRefCount > 0) {
        status = 'DEGRADED';
        safeMessage = `Media anomalies detected: ${invalidCount} invalid metadata records, ${archivedRefCount} archived assets with active relationship references.`;
      }

      return {
        code: status === 'HEALTHY' ? 'MEDIA_HEALTHY' : 'MEDIA_ANOMALIES_DETECTED',
        status,
        safeMessage,
        checkedAt,
        optionalSafeDetails: {
          invalidMetadataCount: invalidCount,
          archivedWithReferencesCount: archivedRefCount,
        },
      };
    } catch {
      return {
        code: 'MEDIA_DIAGNOSTICS_FAILED',
        status: 'UNKNOWN',
        safeMessage: 'Unable to evaluate media repository state.',
        checkedAt,
      };
    }
  }

  /**
   * 5. MIGRATIONS / SCHEMA Diagnostic
   */
  static async checkMigrationsSchema(): Promise<DiagnosticCheckItem> {
    const checkedAt = new Date().toISOString();

    try {
      const journalPath = path.resolve(process.cwd(), 'src/db/migrations/meta/_journal.json');
      if (!fs.existsSync(journalPath)) {
        return {
          code: 'MIGRATIONS_JOURNAL_MISSING',
          status: 'DEGRADED',
          safeMessage: 'Drizzle migration journal not found on filesystem.',
          checkedAt,
        };
      }

      const journalContent = fs.readFileSync(journalPath, 'utf8');
      const journal = JSON.parse(journalContent);
      const entries: Array<{ idx: number; tag: string }> = journal.entries || [];

      // Verify idx sequence is contiguous (0, 1, 2, ...)
      let isContiguous = true;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].idx !== i) {
          isContiguous = false;
          break;
        }
      }

      const status: DiagnosticStatus = isContiguous ? 'HEALTHY' : 'DEGRADED';
      const safeMessage = isContiguous
        ? `Migration journal intact (${entries.length} tracked migrations, continuous idx sequence).`
        : 'Migration journal idx sequence mismatch detected.';

      return {
        code: isContiguous ? 'MIGRATIONS_JOURNAL_INTACT' : 'MIGRATIONS_JOURNAL_DISCONTINUOUS',
        status,
        safeMessage,
        checkedAt,
        optionalSafeDetails: {
          trackedMigrationCount: entries.length,
          latestMigrationTag: entries[entries.length - 1]?.tag || null,
        },
      };
    } catch {
      return {
        code: 'MIGRATIONS_CHECK_FAILED',
        status: 'UNKNOWN',
        safeMessage: 'Unable to evaluate schema migration metadata.',
        checkedAt,
      };
    }
  }
}
