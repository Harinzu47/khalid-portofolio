import { db } from '@/db/client';
import {
  journalEntries,
  tags,
  journalTags,
  journalProjects,
  journalTechnologies,
  projects,
  technologies,
} from '@/db/schema';
import { eq, desc, and, isNull, sql, inArray } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { JournalFormInput } from '@/validations/journal';

export class JournalService {
  /**
   * Fetches public engineering journal entries.
   * STRICT SECURITY: Only status = 'published' AND visibility = 'public'
   */
  static async getPublicJournalEntries(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 15);

    const conditions = and(
      eq(journalEntries.status, 'published'),
      eq(journalEntries.visibility, 'public'),
      sql`${journalEntries.publishedAt} IS NOT NULL`,
      isNull(journalEntries.deletedAt)
    );

    const [data, countResult] = await Promise.all([
      db.query.journalEntries.findMany({
        where: conditions,
        orderBy: [desc(journalEntries.entryDate), desc(journalEntries.createdAt)],
        limit,
        offset,
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
          projects: {
            with: {
              project: true,
            },
          },
          technologies: {
            with: {
              technology: true,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(journalEntries)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Fetches a single public journal entry by slug.
   * STRICT SECURITY: Allows 'public' and 'unlisted' (via direct link). Private entries throw NotFoundError!
   */
  static async getPublicJournalEntryBySlug(slug: string) {
    const entry = await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.slug, slug),
        eq(journalEntries.status, 'published'),
        inArray(journalEntries.visibility, ['public', 'unlisted']),
        sql`${journalEntries.publishedAt} IS NOT NULL`,
        isNull(journalEntries.deletedAt)
      ),
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
        projects: {
          with: {
            project: true,
          },
        },
        technologies: {
          with: {
            technology: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundError('Journal Entry', slug);
    }

    return entry;
  }

  /**
   * Fetches all journal entries for administrative oversight.
   */
  static async getAdminJournalEntries(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = isNull(journalEntries.deletedAt);

    const [data, countResult] = await Promise.all([
      db.query.journalEntries.findMany({
        where: conditions,
        orderBy: [desc(journalEntries.entryDate), desc(journalEntries.createdAt)],
        limit,
        offset,
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
          projects: {
            with: {
              project: true,
            },
          },
          technologies: {
            with: {
              technology: true,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(journalEntries)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Fetches a journal entry by ID for editing in admin.
   */
  static async getAdminJournalEntryById(id: string) {
    const entry = await db.query.journalEntries.findFirst({
      where: and(eq(journalEntries.id, id), isNull(journalEntries.deletedAt)),
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
        projects: true,
        technologies: true,
      },
    });

    if (!entry) {
      throw new NotFoundError('Journal Entry', id);
    }

    return entry;
  }

  /**
   * Creates a new journal entry with atomic tag and relation synchronization.
   */
  static async createJournalEntry(input: JournalFormInput, actorId?: string) {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    const existing = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`A journal entry with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const publishedAt = input.published ? new Date() : null;

      const [newEntry] = await tx
        .insert(journalEntries)
        .values({
          title: input.title,
          slug: finalSlug,
          entryDate: input.entryDate,
          content: input.content,
          summary: input.summary || null,
          status: input.status,
          visibility: input.visibility,
          reflection: input.reflection || null,
          publishedAt,
        })
        .returning();

      // Resolve and link tags
      if (input.tagNames.length > 0) {
        for (const rawTagName of input.tagNames) {
          const cleanName = rawTagName.trim();
          if (!cleanName) continue;
          const tagSlug = slugify(cleanName);

          let tag = await tx.query.tags.findFirst({
            where: eq(tags.slug, tagSlug),
          });

          if (!tag) {
            const [createdTag] = await tx
              .insert(tags)
              .values({ name: cleanName, slug: tagSlug })
              .returning();
            tag = createdTag;
          }

          await tx
            .insert(journalTags)
            .values({ journalId: newEntry.id, tagId: tag.id })
            .onConflictDoNothing();
        }
      }

      // Link projects
      if (input.projectIds.length > 0) {
        await tx.insert(journalProjects).values(
          input.projectIds.map((projectId) => ({
            journalId: newEntry.id,
            projectId,
          }))
        );
      }

      // Link technologies
      if (input.technologyIds.length > 0) {
        await tx.insert(journalTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            journalId: newEntry.id,
            technologyId,
          }))
        );
      }

      // Record Audit Log
      await AuditService.record(tx, {
        actorId,
        action: 'JOURNAL_CREATE',
        entityType: 'journal_entry',
        entityId: newEntry.id,
        newValues: newEntry,
      });

      return newEntry;
    });
  }

  /**
   * Updates an existing journal entry atomically.
   */
  static async updateJournalEntry(id: string, input: JournalFormInput, actorId?: string) {
    const existing = await db.query.journalEntries.findFirst({
      where: and(eq(journalEntries.id, id), isNull(journalEntries.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundError('Journal Entry', id);
    }

    const finalSlug = input.slug?.trim() || slugify(input.title);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.journalEntries.findFirst({
        where: and(eq(journalEntries.slug, finalSlug), sql`${journalEntries.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      const publishedAt = input.published
        ? existing.publishedAt || new Date()
        : null;

      const [updatedEntry] = await tx
        .update(journalEntries)
        .set({
          title: input.title,
          slug: finalSlug,
          entryDate: input.entryDate,
          content: input.content,
          summary: input.summary || null,
          status: input.status,
          visibility: input.visibility,
          reflection: input.reflection || null,
          publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(journalEntries.id, id))
        .returning();

      // Reset and sync tags
      await tx.delete(journalTags).where(eq(journalTags.journalId, id));
      if (input.tagNames.length > 0) {
        for (const rawTagName of input.tagNames) {
          const cleanName = rawTagName.trim();
          if (!cleanName) continue;
          const tagSlug = slugify(cleanName);

          let tag = await tx.query.tags.findFirst({
            where: eq(tags.slug, tagSlug),
          });

          if (!tag) {
            const [createdTag] = await tx
              .insert(tags)
              .values({ name: cleanName, slug: tagSlug })
              .returning();
            tag = createdTag;
          }

          await tx
            .insert(journalTags)
            .values({ journalId: id, tagId: tag.id })
            .onConflictDoNothing();
        }
      }

      // Reset and sync linked projects
      await tx.delete(journalProjects).where(eq(journalProjects.journalId, id));
      if (input.projectIds.length > 0) {
        await tx.insert(journalProjects).values(
          input.projectIds.map((projectId) => ({
            journalId: id,
            projectId,
          }))
        );
      }

      // Reset and sync linked technologies
      await tx.delete(journalTechnologies).where(eq(journalTechnologies.journalId, id));
      if (input.technologyIds.length > 0) {
        await tx.insert(journalTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            journalId: id,
            technologyId,
          }))
        );
      }

      // Record Audit Log
      await AuditService.record(tx, {
        actorId,
        action: 'JOURNAL_UPDATE',
        entityType: 'journal_entry',
        entityId: id,
        oldValues: existing,
        newValues: updatedEntry,
      });

      return updatedEntry;
    });
  }

  /**
   * Soft deletes or permanently deletes a journal entry.
   */
  static async deleteJournalEntry(id: string, actorId?: string, permanent = false) {
    const existing = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, id),
    });

    if (!existing) {
      throw new NotFoundError('Journal Entry', id);
    }

    return await db.transaction(async (tx) => {
      if (permanent) {
        await tx.delete(journalEntries).where(eq(journalEntries.id, id));
      } else {
        await tx
          .update(journalEntries)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(journalEntries.id, id));
      }

      await AuditService.record(tx, {
        actorId,
        action: permanent ? 'JOURNAL_PERMANENT_DELETE' : 'JOURNAL_SOFT_DELETE',
        entityType: 'journal_entry',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Fetches available projects and technologies for linking to journal entries.
   */
  static async getTaxonomyOptions() {
    const [availableProjects, availableTechs] = await Promise.all([
      db
        .select({ id: projects.id, title: projects.title })
        .from(projects)
        .where(isNull(projects.deletedAt))
        .orderBy(projects.title),
      db
        .select({ id: technologies.id, name: technologies.name })
        .from(technologies)
        .orderBy(technologies.name),
    ]);

    return {
      projects: availableProjects,
      technologies: availableTechs,
    };
  }
}
