import { db } from '@/db/client';
import {
  journalEntries,
  journalTags,
  journalProjects,
  journalSkills,
  journalDomains,
  journalTechnologies,
  tags,
  notes,
  articles,
  adrs,
  relationshipTypes,
  relationshipTypeCompatibility,
  knowledgeRelationships,
} from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError, AppError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { RelationshipService } from './relationship.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type {
  JournalFormInput,
  JournalQuickCaptureInput,
  JournalExtractionInput,
} from '@/validations/journal';
import type {
  KnowledgeListItemDTO,
  JournalEditorDTO,
  ExtractionResultDTO,
  PaginatedResultDTO,
} from '@/types/dtos';

/**
 * Resolves both tag IDs and raw tag names transactionally per Amendment 3.
 */
async function resolveTagIds(
  tx: any,
  ownerId: string,
  tagIds: string[] = [],
  tagNames: string[] = []
): Promise<string[]> {
  const resolvedIds = new Set<string>(tagIds);

  for (const rawName of tagNames) {
    const cleanName = rawName.trim();
    if (!cleanName) continue;
    const tagSlug = slugify(cleanName);

    let tag = await tx.query.tags.findFirst({
      where: and(eq(tags.slug, tagSlug), eq(tags.ownerId, ownerId)),
    });

    if (!tag) {
      const [createdTag] = await tx
        .insert(tags)
        .values({
          ownerId,
          name: cleanName,
          slug: tagSlug,
          visibility: 'private',
        })
        .returning();
      tag = createdTag;
    }

    if (tag) {
      resolvedIds.add(tag.id);
    }
  }

  return Array.from(resolvedIds);
}

export class JournalService {
  /**
   * Public query: Retrieves paginated published public journal entries.
   */
  static async getPublicJournalEntries(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 10);

    const conditions = and(
      eq(journalEntries.status, 'published'),
      eq(journalEntries.visibility, 'public'),
      eq(journalEntries.publicationStatus, 'published'),
      isNull(journalEntries.deletedAt),
      isNull(journalEntries.archivedAt)
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
          domains: {
            with: {
              domain: true,
            },
          },
          skills: {
            with: {
              skill: true,
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
   * Public query: Retrieves single published journal entry by slug.
   */
  static async getPublicJournalEntryBySlug(slug: string) {
    const entry = await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.slug, slug),
        eq(journalEntries.status, 'published'),
        eq(journalEntries.visibility, 'public'),
        eq(journalEntries.publicationStatus, 'published'),
        isNull(journalEntries.deletedAt),
        isNull(journalEntries.archivedAt)
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
        domains: {
          with: {
            domain: true,
          },
        },
        skills: {
          with: {
            skill: true,
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
   * Owner-scoped query: Retrieves paginated journal logs for Admin Knowledge Surface.
   */
  static async getAdminJournalEntries(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<KnowledgeListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = and(
      eq(journalEntries.ownerId, ownerId),
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
          domains: {
            with: {
              domain: true,
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
    const formattedData: KnowledgeListItemDTO[] = data.map((j) => ({
      id: j.id,
      entityType: 'journal' as const,
      title: j.title,
      slug: j.slug,
      summary: j.summary,
      entryDate: j.entryDate,
      visibility: j.visibility as any,
      publicationStatus: j.publicationStatus as any,
      status: j.status,
      isFeatured: j.isFeatured,
      domains: (j.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      technologies: (j.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
      })),
      tags: (j.tags || []).map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      })),
      publishedAt: j.publishedAt ? j.publishedAt.toISOString() : null,
      updatedAt: j.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Owner-scoped query: Retrieves journal entry by ID for editor.
   */
  static async getJournalEditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<JournalEditorDTO> {
    const entry = await executor.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, id),
        eq(journalEntries.ownerId, ownerId),
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
        domains: {
          with: {
            domain: true,
          },
        },
        skills: {
          with: {
            skill: true,
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
      throw new NotFoundError('Journal Entry', id);
    }

    return {
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      entryDate: entry.entryDate,
      content: entry.content,
      summary: entry.summary,
      status: entry.status,
      visibility: entry.visibility as any,
      publicationStatus: entry.publicationStatus as any,
      startedAt: entry.startedAt ? entry.startedAt.toISOString() : null,
      endedAt: entry.endedAt ? entry.endedAt.toISOString() : null,
      sessionNumber: entry.sessionNumber,
      workState: entry.workState,
      isFeatured: entry.isFeatured,
      reflection: entry.reflection,
      publishedAt: entry.publishedAt ? entry.publishedAt.toISOString() : null,
      archivedAt: entry.archivedAt ? entry.archivedAt.toISOString() : null,
      domains: (entry.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      skills: (entry.skills || []).map((s: any) => ({
        id: s.skill.id,
        name: s.skill.name,
        slug: s.skill.slug,
      })),
      technologies: (entry.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
        iconName: t.technology.iconName,
      })),
      tags: (entry.tags || []).map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      })),
      projectIds: (entry.projects || []).map((p: any) => p.projectId),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }

  /**
   * Fast frictionless capture per Section 12 & Amendment 3.
   * Auto-generates safe title if omitted, enforces PRIVATE + DRAFT defaults.
   */
  static async quickCapture(
    ownerId: string,
    input: JournalQuickCaptureInput,
    actorId?: string
  ): Promise<JournalEditorDTO> {
    const entryDate = input.entryDate || new Date().toISOString().slice(0, 10);
    const title =
      input.title?.trim() ||
      `Engineering Log - ${entryDate} ${new Date().toTimeString().slice(0, 5)}`;
    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    return await db.transaction(async (tx) => {
      const [newEntry] = await tx
        .insert(journalEntries)
        .values({
          ownerId,
          title,
          slug: uniqueSlug,
          entryDate,
          content: input.content,
          sessionNumber: input.sessionNumber || null,
          workState: input.workState || null,
          startedAt: input.startedAt ? new Date(input.startedAt) : null,
          endedAt: input.endedAt ? new Date(input.endedAt) : null,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft',
        })
        .returning();

      // Resolve and Sync Tags
      const allTagIds = await resolveTagIds(tx, ownerId, [], input.tagNames);
      if (allTagIds.length > 0) {
        await tx.insert(journalTags).values(
          allTagIds.map((tagId) => ({
            journalId: newEntry.id,
            tagId,
          }))
        );
      }

      // Sync Projects
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(journalProjects).values(
          input.projectIds.map((projectId) => ({
            journalId: newEntry.id,
            projectId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'JOURNAL_QUICK_CAPTURE',
        entityType: 'journal_entry',
        entityId: newEntry.id,
        newValues: newEntry,
      });

      return await JournalService.getJournalEditorById(ownerId, newEntry.id, tx);
    });
  }

  /**
   * Creates a structured journal entry atomically.
   */
  static async createJournalEntry(
    ownerId: string,
    input: JournalFormInput,
    actorId?: string
  ): Promise<JournalEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    const existing = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`A journal entry with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const [newEntry] = await tx
        .insert(journalEntries)
        .values({
          ownerId,
          title: input.title.trim(),
          slug: finalSlug,
          entryDate: input.entryDate,
          content: input.content,
          summary: input.summary || null,
          sessionNumber: input.sessionNumber || null,
          workState: input.workState || null,
          startedAt: input.startedAt ? new Date(input.startedAt) : null,
          endedAt: input.endedAt ? new Date(input.endedAt) : null,
          isFeatured: input.isFeatured || false,
          reflection: input.reflection || null,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Strict DRAFT default
        })
        .returning();

      // 1. Resolve and Sync Tags
      const allTagIds = await resolveTagIds(tx, ownerId, input.tagIds, input.tagNames);
      if (allTagIds.length > 0) {
        await tx.insert(journalTags).values(
          allTagIds.map((tagId) => ({
            journalId: newEntry.id,
            tagId,
          }))
        );
      }

      // 2. Sync Projects
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(journalProjects).values(
          input.projectIds.map((projectId) => ({
            journalId: newEntry.id,
            projectId,
          }))
        );
      }

      // 3. Sync Domains
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(journalDomains).values(
          input.domainIds.map((domainId) => ({
            journalId: newEntry.id,
            domainId,
          }))
        );
      }

      // 4. Sync Skills
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(journalSkills).values(
          input.skillIds.map((skillId) => ({
            journalId: newEntry.id,
            skillId,
          }))
        );
      }

      // 5. Sync Technologies
      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(journalTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            journalId: newEntry.id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'JOURNAL_CREATE',
        entityType: 'journal_entry',
        entityId: newEntry.id,
        newValues: newEntry,
      });

      return await JournalService.getJournalEditorById(ownerId, newEntry.id, tx);
    });
  }

  /**
   * Updates an existing journal entry atomically (Owner scoped).
   */
  static async updateJournalEntry(
    ownerId: string,
    id: string,
    input: Partial<JournalFormInput>,
    actorId?: string
  ): Promise<JournalEditorDTO> {
    const existing = await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, id),
        eq(journalEntries.ownerId, ownerId),
        isNull(journalEntries.deletedAt)
      ),
    });

    if (!existing) {
      throw new NotFoundError('Journal Entry', id);
    }

    const finalSlug =
      input.slug?.trim() || (input.title ? slugify(input.title) : existing.slug);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.journalEntries.findFirst({
        where: and(eq(journalEntries.slug, finalSlug), sql`${journalEntries.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      const [updatedEntry] = await tx
        .update(journalEntries)
        .set({
          title: input.title !== undefined ? input.title.trim() : existing.title,
          slug: finalSlug,
          entryDate: input.entryDate !== undefined ? input.entryDate : existing.entryDate,
          content: input.content !== undefined ? input.content : existing.content,
          summary: input.summary !== undefined ? input.summary : existing.summary,
          sessionNumber:
            input.sessionNumber !== undefined ? input.sessionNumber : existing.sessionNumber,
          workState: input.workState !== undefined ? input.workState : existing.workState,
          startedAt: input.startedAt ? new Date(input.startedAt) : existing.startedAt,
          endedAt: input.endedAt ? new Date(input.endedAt) : existing.endedAt,
          isFeatured: input.isFeatured ?? existing.isFeatured,
          reflection: input.reflection !== undefined ? input.reflection : existing.reflection,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(journalEntries.id, id), eq(journalEntries.ownerId, ownerId)))
        .returning();

      // 1. Sync Tags
      await tx.delete(journalTags).where(eq(journalTags.journalId, id));
      const allTagIds = await resolveTagIds(tx, ownerId, input.tagIds, input.tagNames);
      if (allTagIds.length > 0) {
        await tx.insert(journalTags).values(
          allTagIds.map((tagId) => ({
            journalId: id,
            tagId,
          }))
        );
      }

      // 2. Sync Projects
      await tx.delete(journalProjects).where(eq(journalProjects.journalId, id));
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(journalProjects).values(
          input.projectIds.map((projectId) => ({
            journalId: id,
            projectId,
          }))
        );
      }

      // 3. Sync Domains
      await tx.delete(journalDomains).where(eq(journalDomains.journalId, id));
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(journalDomains).values(
          input.domainIds.map((domainId) => ({
            journalId: id,
            domainId,
          }))
        );
      }

      // 4. Sync Skills
      await tx.delete(journalSkills).where(eq(journalSkills.journalId, id));
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(journalSkills).values(
          input.skillIds.map((skillId) => ({
            journalId: id,
            skillId,
          }))
        );
      }

      // 5. Sync Technologies
      await tx.delete(journalTechnologies).where(eq(journalTechnologies.journalId, id));
      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(journalTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            journalId: id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'JOURNAL_UPDATE',
        entityType: 'journal_entry',
        entityId: id,
        oldValues: existing,
        newValues: updatedEntry,
      });

      return await JournalService.getJournalEditorById(ownerId, id, tx);
    });
  }

  /**
   * Soft-archives a journal entry (Owner scoped).
   */
  static async archiveJournalEntry(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.journalEntries.findFirst({
      where: and(eq(journalEntries.id, id), eq(journalEntries.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Journal Entry', id);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(journalEntries)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(journalEntries.id, id), eq(journalEntries.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'JOURNAL_ARCHIVE',
        entityType: 'journal_entry',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Maintenance delete for backward compatibility.
   */
  static async deleteJournalEntry(
    ownerId: string,
    id: string,
    actorId?: string,
    permanent = false
  ) {
    const existing = await db.query.journalEntries.findFirst({
      where: and(eq(journalEntries.id, id), eq(journalEntries.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Journal Entry', id);

    return await db.transaction(async (tx) => {
      if (permanent) {
        await tx.delete(journalTags).where(eq(journalTags.journalId, id));
        await tx.delete(journalProjects).where(eq(journalProjects.journalId, id));
        await tx.delete(journalDomains).where(eq(journalDomains.journalId, id));
        await tx.delete(journalSkills).where(eq(journalSkills.journalId, id));
        await tx.delete(journalTechnologies).where(eq(journalTechnologies.journalId, id));
        await tx
          .delete(journalEntries)
          .where(and(eq(journalEntries.id, id), eq(journalEntries.ownerId, ownerId)));
      } else {
        await tx
          .update(journalEntries)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(and(eq(journalEntries.id, id), eq(journalEntries.ownerId, ownerId)));
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: permanent ? 'JOURNAL_DELETE_PERMANENT' : 'JOURNAL_DELETE',
        entityType: 'journal_entry',
        entityId: id,
        oldValues: existing,
      });

      return existing;
    });
  }

  // ==============================================================================
  // EXTRACTION WORKFLOW (Amendments 6, 7, 8, 9, 10)
  // ==============================================================================

  /**
   * Helper: Validates compatibility and creates the atomic DERIVED_INTO edge.
   */
  private static async createProvenanceEdge(
    tx: any,
    ownerId: string,
    sourceId: string,
    targetType: 'TECH_NOTE' | 'ARTICLE' | 'ADR',
    targetId: string,
    actorId?: string
  ) {
    const relType = await tx.query.relationshipTypes.findFirst({
      where: eq(relationshipTypes.code, 'DERIVED_INTO'),
    });

    if (!relType) {
      throw new AppError(
        'Relationship type DERIVED_INTO is missing from system configuration.',
        'DATABASE_ERROR',
        500
      );
    }

    return RelationshipService.createRelationship(
      ownerId,
      {
        relationshipTypeId: relType.id,
        sourceType: 'JOURNAL_ENTRY',
        sourceId,
        targetType,
        targetId,
        description: `Extracted from Journal Entry into ${targetType}`,
        visibility: 'private',
        sortOrder: 0,
      },
      actorId,
      tx
    );
  }

  /**
   * Extracts a Journal Entry into a TechNote starting draft atomically.
   */
  static async extractToTechNote(
    ownerId: string,
    journalId: string,
    overrides?: Partial<JournalExtractionInput>,
    actorId?: string
  ): Promise<ExtractionResultDTO> {
    const journal = await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, journalId),
        eq(journalEntries.ownerId, ownerId),
        isNull(journalEntries.deletedAt)
      ),
    });

    if (!journal) {
      throw new NotFoundError('Journal Entry', journalId);
    }

    return await db.transaction(async (tx) => {
      const targetTitle = overrides?.title?.trim() || `Reference: ${journal.title}`;
      const baseSlug = overrides?.slug?.trim() || slugify(targetTitle);
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      const targetContent =
        overrides?.content ||
        `## Technical Summary\n\n${journal.summary || 'Extracted technical guidance.'}\n\n## Details\n\n${journal.content}`;

      // Insert target TechNote (notes table) with strict PRIVATE + DRAFT defaults (Amendment 9)
      const [newNote] = await tx
        .insert(notes)
        .values({
          ownerId,
          title: targetTitle,
          slug: uniqueSlug,
          summary: overrides?.summary || journal.summary || null,
          content: targetContent,
          difficulty: 'intermediate',
          verificationStatus: 'unverified', // Quality dimension separate from publication
          visibility: 'private',
          publicationStatus: 'draft',
        })
        .returning();

      // Create atomic provenance edge (Amendment 10)
      const edge = await JournalService.createProvenanceEdge(
        tx,
        ownerId,
        journalId,
        'TECH_NOTE',
        newNote.id,
        actorId
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'JOURNAL_EXTRACT_TECH_NOTE',
        entityType: 'note',
        entityId: newNote.id,
        newValues: { note: newNote, provenanceEdgeId: edge.id },
      });

      return {
        sourceJournalId: journalId,
        targetType: 'TECH_NOTE',
        targetId: newNote.id,
        targetSlug: newNote.slug,
        targetTitle: newNote.title,
        provenanceRelationshipId: edge.id,
        relationshipTypeCode: 'DERIVED_INTO',
        createdAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Extracts a Journal Entry into an Article starting draft atomically.
   */
  static async extractToArticle(
    ownerId: string,
    journalId: string,
    overrides?: Partial<JournalExtractionInput>,
    actorId?: string
  ): Promise<ExtractionResultDTO> {
    const journal = await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, journalId),
        eq(journalEntries.ownerId, ownerId),
        isNull(journalEntries.deletedAt)
      ),
    });

    if (!journal) {
      throw new NotFoundError('Journal Entry', journalId);
    }

    return await db.transaction(async (tx) => {
      const targetTitle = overrides?.title?.trim() || `Deep Dive: ${journal.title}`;
      const baseSlug = overrides?.slug?.trim() || slugify(targetTitle);
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      const targetContent =
        overrides?.content ||
        `# ${targetTitle}\n\n${journal.summary ? `> ${journal.summary}\n\n` : ''}${journal.content}\n\n${
          journal.reflection ? `### Key Takeaways\n${journal.reflection}` : ''
        }`;

      // Insert target Article with strict PRIVATE + DRAFT defaults
      const [newArticle] = await tx
        .insert(articles)
        .values({
          ownerId,
          title: targetTitle,
          slug: uniqueSlug,
          excerpt: overrides?.summary || journal.summary || null,
          content: targetContent,
          visibility: 'private',
          publicationStatus: 'draft',
        })
        .returning();

      // Create atomic provenance edge
      const edge = await JournalService.createProvenanceEdge(
        tx,
        ownerId,
        journalId,
        'ARTICLE',
        newArticle.id,
        actorId
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'JOURNAL_EXTRACT_ARTICLE',
        entityType: 'article',
        entityId: newArticle.id,
        newValues: { article: newArticle, provenanceEdgeId: edge.id },
      });

      return {
        sourceJournalId: journalId,
        targetType: 'ARTICLE',
        targetId: newArticle.id,
        targetSlug: newArticle.slug,
        targetTitle: newArticle.title,
        provenanceRelationshipId: edge.id,
        relationshipTypeCode: 'DERIVED_INTO',
        createdAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Extracts a Journal Entry into an ADR candidate starting draft atomically.
   */
  static async extractToADR(
    ownerId: string,
    journalId: string,
    overrides?: Partial<JournalExtractionInput>,
    actorId?: string
  ): Promise<ExtractionResultDTO> {
    const journal = await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, journalId),
        eq(journalEntries.ownerId, ownerId),
        isNull(journalEntries.deletedAt)
      ),
    });

    if (!journal) {
      throw new NotFoundError('Journal Entry', journalId);
    }

    return await db.transaction(async (tx) => {
      const targetTitle = overrides?.title?.trim() || `ADR: Decision from ${journal.title}`;
      const baseSlug = overrides?.slug?.trim() || slugify(targetTitle);
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      // Insert target ADR with status = 'proposed', visibility = 'private', publicationStatus = 'draft' (Amendment 9)
      const [newADR] = await tx
        .insert(adrs)
        .values({
          ownerId,
          title: targetTitle,
          slug: uniqueSlug,
          status: 'proposed', // Must not assume accepted
          context: overrides?.summary || journal.summary || `Context extracted from ${journal.title}`,
          decision: overrides?.content || journal.content,
          visibility: 'private',
          publicationStatus: 'draft',
        })
        .returning();

      // Create atomic provenance edge
      const edge = await JournalService.createProvenanceEdge(
        tx,
        ownerId,
        journalId,
        'ADR',
        newADR.id,
        actorId
      );

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'JOURNAL_EXTRACT_ADR',
        entityType: 'adr',
        entityId: newADR.id,
        newValues: { adr: newADR, provenanceEdgeId: edge.id },
      });

      return {
        sourceJournalId: journalId,
        targetType: 'ADR',
        targetId: newADR.id,
        targetSlug: newADR.slug,
        targetTitle: newADR.title,
        provenanceRelationshipId: edge.id,
        relationshipTypeCode: 'DERIVED_INTO',
        createdAt: new Date().toISOString(),
      };
    });
  }
}
