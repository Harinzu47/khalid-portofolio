import { db } from '@/db/client';
import { notes } from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { NoteFormInput } from '@/validations/note';

export class NotesService {
  /**
   * Fetches public engineering notes and snippets.
   */
  static async getPublicNotes(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 20);

    const conditions = and(
      eq(notes.status, 'published'),
      isNull(notes.deletedAt)
    );

    const [data, countResult] = await Promise.all([
      db.query.notes.findMany({
        where: conditions,
        orderBy: [desc(notes.createdAt)],
        limit,
        offset,
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
   * Fetches a single public note by slug.
   */
  static async getPublicNoteBySlug(slug: string) {
    const note = await db.query.notes.findFirst({
      where: and(
        eq(notes.slug, slug),
        eq(notes.status, 'published'),
        isNull(notes.deletedAt)
      ),
    });

    if (!note) {
      throw new NotFoundError('Note', slug);
    }

    return note;
  }

  /**
   * Fetches all notes for the administrative workspace.
   */
  static async getAdminNotes(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = isNull(notes.deletedAt);

    const [data, countResult] = await Promise.all([
      db.query.notes.findMany({
        where: conditions,
        orderBy: [desc(notes.updatedAt)],
        limit,
        offset,
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
   * Fetches a note by ID for editing in admin.
   */
  static async getAdminNoteById(id: string) {
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.id, id), isNull(notes.deletedAt)),
    });

    if (!note) {
      throw new NotFoundError('Note', id);
    }

    return note;
  }

  /**
   * Creates a new technical note atomically with audit logging.
   */
  static async createNote(input: NoteFormInput, actorId?: string) {
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
          title: input.title,
          slug: finalSlug,
          content: input.content,
          status: input.status,
        })
        .returning();

      // Record Audit Log
      await AuditService.record(tx, {
        actorId,
        action: 'NOTE_CREATE',
        entityType: 'note',
        entityId: newNote.id,
        newValues: newNote,
      });

      return newNote;
    });
  }

  /**
   * Updates an existing note atomically.
   */
  static async updateNote(id: string, input: NoteFormInput, actorId?: string) {
    const existing = await db.query.notes.findFirst({
      where: and(eq(notes.id, id), isNull(notes.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundError('Note', id);
    }

    const finalSlug = input.slug?.trim() || slugify(input.title);

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
          title: input.title,
          slug: finalSlug,
          content: input.content,
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(notes.id, id))
        .returning();

      // Record Audit Log
      await AuditService.record(tx, {
        actorId,
        action: 'NOTE_UPDATE',
        entityType: 'note',
        entityId: id,
        oldValues: existing,
        newValues: updatedNote,
      });

      return updatedNote;
    });
  }

  /**
   * Soft deletes or permanently deletes a note.
   */
  static async deleteNote(id: string, actorId?: string, permanent = false) {
    const existing = await db.query.notes.findFirst({
      where: eq(notes.id, id),
    });

    if (!existing) {
      throw new NotFoundError('Note', id);
    }

    return await db.transaction(async (tx) => {
      if (permanent) {
        await tx.delete(notes).where(eq(notes.id, id));
      } else {
        await tx
          .update(notes)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(notes.id, id));
      }

      await AuditService.record(tx, {
        actorId,
        action: permanent ? 'NOTE_PERMANENT_DELETE' : 'NOTE_SOFT_DELETE',
        entityType: 'note',
        entityId: id,
        oldValues: existing,
      });
    });
  }
}
