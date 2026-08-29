import { db } from '@/db/client';
import {
  notes,
  noteTags,
  noteProjects,
  noteSkills,
  noteDomains,
  noteTechnologies,
  tags,
} from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { TechNoteFormInput } from '@/validations/note';
import type { KnowledgeListItemDTO, TechNoteEditorDTO, PaginatedResultDTO } from '@/types/dtos';

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

export class TechNoteService {
  /**
   * Alias for getPublicTechNotes
   */
  static getPublicNotes(params?: PaginationParams) {
    return TechNoteService.getPublicTechNotes(params);
  }

  /**
   * Alias for getPublicTechNoteBySlug
   */
  static getPublicNoteBySlug(slug: string) {
    return TechNoteService.getPublicTechNoteBySlug(slug);
  }

  /**
   * Public query: Retrieves paginated published public technical notes.
   */
  static async getPublicTechNotes(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 10);

    const conditions = and(
      eq(notes.status, 'published'),
      eq(notes.visibility, 'public'),
      eq(notes.publicationStatus, 'published'),
      isNull(notes.deletedAt),
      isNull(notes.archivedAt)
    );

    const [data, countResult] = await Promise.all([
      db.query.notes.findMany({
        where: conditions,
        orderBy: [desc(notes.createdAt)],
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
        .from(notes)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Public query: Retrieves single published tech note by slug.
   */
  static async getPublicTechNoteBySlug(slug: string) {
    const note = await db.query.notes.findFirst({
      where: and(
        eq(notes.slug, slug),
        eq(notes.status, 'published'),
        eq(notes.visibility, 'public'),
        eq(notes.publicationStatus, 'published'),
        isNull(notes.deletedAt),
        isNull(notes.archivedAt)
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

    if (!note) {
      throw new NotFoundError('Tech Note', slug);
    }

    return note;
  }

  /**
   * Owner-scoped query: Retrieves paginated tech notes for the Admin Knowledge Surface.
   */
  static async getAdminTechNotes(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<KnowledgeListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = and(eq(notes.ownerId, ownerId), isNull(notes.deletedAt));

    const [data, countResult] = await Promise.all([
      db.query.notes.findMany({
        where: conditions,
        orderBy: [desc(notes.createdAt)],
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
        .from(notes)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    const formattedData: KnowledgeListItemDTO[] = data.map((n) => ({
      id: n.id,
      entityType: 'note' as const,
      title: n.title,
      slug: n.slug,
      summary: n.summary,
      difficulty: n.difficulty,
      verificationStatus: n.verificationStatus,
      visibility: n.visibility as any,
      publicationStatus: n.publicationStatus as any,
      status: n.status,
      isFeatured: n.isFeatured,
      domains: (n.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      technologies: (n.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
      })),
      tags: (n.tags || []).map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      })),
      publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
      updatedAt: n.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Owner-scoped query: Retrieves tech note by ID for editor.
   */
  static async getTechNoteEditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<TechNoteEditorDTO> {
    const note = await executor.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.ownerId, ownerId), isNull(notes.deletedAt)),
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

    if (!note) {
      throw new NotFoundError('Tech Note', id);
    }

    return {
      id: note.id,
      title: note.title,
      slug: note.slug,
      summary: note.summary,
      content: note.content,
      difficulty: note.difficulty,
      verificationStatus: note.verificationStatus,
      lastVerifiedAt: note.lastVerifiedAt ? note.lastVerifiedAt.toISOString() : null,
      testedVersions: note.testedVersions as any,
      isFeatured: note.isFeatured,
      status: note.status,
      visibility: note.visibility as any,
      publicationStatus: note.publicationStatus as any,
      publishedAt: note.publishedAt ? note.publishedAt.toISOString() : null,
      archivedAt: note.archivedAt ? note.archivedAt.toISOString() : null,
      domains: (note.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      skills: (note.skills || []).map((s: any) => ({
        id: s.skill.id,
        name: s.skill.name,
        slug: s.skill.slug,
      })),
      technologies: (note.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
        iconName: t.technology.iconName,
      })),
      tags: (note.tags || []).map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      })),
      projectIds: (note.projects || []).map((p: any) => p.projectId),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  /**
   * Creates a new tech note atomically with owner isolation and transactional junction sync.
   * Invariant: Sets publicationStatus = 'draft' by default.
   */
  static async createTechNote(
    ownerId: string,
    input: TechNoteFormInput,
    actorId?: string
  ): Promise<TechNoteEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    const existing = await db.query.notes.findFirst({
      where: eq(notes.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`A note with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const [newNote] = await tx
        .insert(notes)
        .values({
          ownerId,
          title: input.title.trim(),
          slug: finalSlug,
          summary: input.summary || null,
          content: input.content,
          difficulty: input.difficulty || null,
          verificationStatus: input.verificationStatus || 'unverified',
          lastVerifiedAt: input.lastVerifiedAt ? new Date(input.lastVerifiedAt) : null,
          testedVersions: input.testedVersions || null,
          isFeatured: input.isFeatured || false,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Strict DRAFT default
        })
        .returning();

      // 1. Resolve and Sync Tags
      const allTagIds = await resolveTagIds(tx, ownerId, input.tagIds, input.tagNames);
      if (allTagIds.length > 0) {
        await tx.insert(noteTags).values(
          allTagIds.map((tagId) => ({
            noteId: newNote.id,
            tagId,
          }))
        );
      }

      // 2. Sync Projects
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(noteProjects).values(
          input.projectIds.map((projectId) => ({
            noteId: newNote.id,
            projectId,
          }))
        );
      }

      // 3. Sync Domains
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(noteDomains).values(
          input.domainIds.map((domainId) => ({
            noteId: newNote.id,
            domainId,
          }))
        );
      }

      // 4. Sync Skills
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(noteSkills).values(
          input.skillIds.map((skillId) => ({
            noteId: newNote.id,
            skillId,
          }))
        );
      }

      // 5. Sync Technologies
      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(noteTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            noteId: newNote.id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'NOTE_CREATE',
        entityType: 'note',
        entityId: newNote.id,
        newValues: newNote,
      });

      return await TechNoteService.getTechNoteEditorById(ownerId, newNote.id, tx);
    });
  }

  /**
   * Updates an existing tech note atomically (Owner scoped).
   * Note: Does NOT modify publicationStatus.
   */
  static async updateTechNote(
    ownerId: string,
    id: string,
    input: Partial<TechNoteFormInput>,
    actorId?: string
  ): Promise<TechNoteEditorDTO> {
    const existing = await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.ownerId, ownerId), isNull(notes.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundError('Tech Note', id);
    }

    const finalSlug =
      input.slug?.trim() || (input.title ? slugify(input.title) : existing.slug);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.notes.findFirst({
        where: and(eq(notes.slug, finalSlug), sql`${notes.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      const [updatedNote] = await tx
        .update(notes)
        .set({
          title: input.title !== undefined ? input.title.trim() : existing.title,
          slug: finalSlug,
          summary: input.summary !== undefined ? input.summary : existing.summary,
          content: input.content !== undefined ? input.content : existing.content,
          difficulty: input.difficulty !== undefined ? input.difficulty : existing.difficulty,
          verificationStatus:
            input.verificationStatus !== undefined
              ? input.verificationStatus
              : existing.verificationStatus,
          lastVerifiedAt: input.lastVerifiedAt
            ? new Date(input.lastVerifiedAt)
            : existing.lastVerifiedAt,
          testedVersions:
            input.testedVersions !== undefined ? input.testedVersions : existing.testedVersions,
          isFeatured: input.isFeatured ?? existing.isFeatured,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(notes.id, id), eq(notes.ownerId, ownerId)))
        .returning();

      // 1. Sync Tags
      await tx.delete(noteTags).where(eq(noteTags.noteId, id));
      const allTagIds = await resolveTagIds(tx, ownerId, input.tagIds, input.tagNames);
      if (allTagIds.length > 0) {
        await tx.insert(noteTags).values(
          allTagIds.map((tagId) => ({
            noteId: id,
            tagId,
          }))
        );
      }

      // 2. Sync Projects
      await tx.delete(noteProjects).where(eq(noteProjects.noteId, id));
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(noteProjects).values(
          input.projectIds.map((projectId) => ({
            noteId: id,
            projectId,
          }))
        );
      }

      // 3. Sync Domains
      await tx.delete(noteDomains).where(eq(noteDomains.noteId, id));
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(noteDomains).values(
          input.domainIds.map((domainId) => ({
            noteId: id,
            domainId,
          }))
        );
      }

      // 4. Sync Skills
      await tx.delete(noteSkills).where(eq(noteSkills.noteId, id));
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(noteSkills).values(
          input.skillIds.map((skillId) => ({
            noteId: id,
            skillId,
          }))
        );
      }

      // 5. Sync Technologies
      await tx.delete(noteTechnologies).where(eq(noteTechnologies.noteId, id));
      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(noteTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            noteId: id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'NOTE_UPDATE',
        entityType: 'note',
        entityId: id,
        oldValues: existing,
        newValues: updatedNote,
      });

      return await TechNoteService.getTechNoteEditorById(ownerId, id, tx);
    });
  }

  /**
   * Soft-archives a tech note (Owner scoped).
   */
  static async archiveTechNote(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Tech Note', id);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(notes)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(notes.id, id), eq(notes.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'NOTE_ARCHIVE',
        entityType: 'note',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Maintenance delete for backward compatibility.
   */
  static async deleteNote(ownerId: string, id: string, actorId?: string, permanent = false) {
    const existing = await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Tech Note', id);

    return await db.transaction(async (tx) => {
      if (permanent) {
        await tx.delete(noteTags).where(eq(noteTags.noteId, id));
        await tx.delete(noteProjects).where(eq(noteProjects.noteId, id));
        await tx.delete(noteDomains).where(eq(noteDomains.noteId, id));
        await tx.delete(noteSkills).where(eq(noteSkills.noteId, id));
        await tx.delete(noteTechnologies).where(eq(noteTechnologies.noteId, id));
        await tx.delete(notes).where(and(eq(notes.id, id), eq(notes.ownerId, ownerId)));
      } else {
        await tx
          .update(notes)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(and(eq(notes.id, id), eq(notes.ownerId, ownerId)));
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: permanent ? 'NOTE_DELETE_PERMANENT' : 'NOTE_DELETE',
        entityType: 'note',
        entityId: id,
        oldValues: existing,
      });

      return existing;
    });
  }
}

// Backward compatibility aliases
export const NotesService = TechNoteService;
