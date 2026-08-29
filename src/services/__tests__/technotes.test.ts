import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import { notes, noteTags, noteProjects, projects, domains, skills, technologies } from '@/db/schema';
import { TechNoteService } from '../notes.service';
import { eq } from 'drizzle-orm';

describe('TechNoteService Integration Tests', () => {
  const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
  let createdNoteId: string;
  let testProjectId: string;
  let testDomainId: string;
  let testSkillId: string;
  let testTechId: string;

  beforeAll(async () => {
    const [proj] = await db
      .insert(projects)
      .values({
        ownerId: TEST_OWNER_ID,
        title: 'Note Test Project',
        slug: `note-proj-${Date.now()}`,
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    testProjectId = proj.id;

    const [dom] = await db
      .insert(domains)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Note Domain',
        slug: `note-dom-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    testDomainId = dom.id;

    const [sk] = await db
      .insert(skills)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Note Skill',
        slug: `note-sk-${Date.now()}`,
        category: 'backend',
        visibility: 'private',
      })
      .returning();
    testSkillId = sk.id;

    const [tc] = await db
      .insert(technologies)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Note Tech',
        slug: `note-tech-${Date.now()}`,
        category: 'database',
        visibility: 'private',
      })
      .returning();
    testTechId = tc.id;
  });

  afterAll(async () => {
    if (createdNoteId) {
      await db.delete(noteTags).where(eq(noteTags.noteId, createdNoteId));
      await db.delete(noteProjects).where(eq(noteProjects.noteId, createdNoteId));
      await db.delete(notes).where(eq(notes.id, createdNoteId));
    }
    if (testProjectId) await db.delete(projects).where(eq(projects.id, testProjectId));
    if (testDomainId) await db.delete(domains).where(eq(domains.id, testDomainId));
    if (testSkillId) await db.delete(skills).where(eq(skills.id, testSkillId));
    if (testTechId) await db.delete(technologies).where(eq(technologies.id, testTechId));
  });

  it('creates a tech note with technical quality dimensions and junction synchronizations', async () => {
    const noteDTO = await TechNoteService.createTechNote(TEST_OWNER_ID, {
      title: 'PostgreSQL Advisory Locks Pattern',
      slug: `pg-advisory-locks-${Date.now()}`,
      summary: 'Safe distributed application-level locking in PostgreSQL.',
      content: '```sql\nSELECT pg_advisory_xact_lock(42);\n```\n\nGuarantees transaction-level serialization.',
      difficulty: 'advanced',
      verificationStatus: 'verified',
      lastVerifiedAt: '2026-08-29T00:00:00.000Z',
      testedVersions: { postgresql: '16.2', node: '20.11.0' },
      isFeatured: true,
      visibility: 'private',
      domainIds: [testDomainId],
      skillIds: [testSkillId],
      technologyIds: [testTechId],
      tagNames: ['postgresql', 'locking', 'concurrency'],
      projectIds: [testProjectId],
    });

    createdNoteId = noteDTO.id;

    expect(noteDTO.id).toBeDefined();
    expect(noteDTO.title).toBe('PostgreSQL Advisory Locks Pattern');
    expect(noteDTO.verificationStatus).toBe('verified');
    expect(noteDTO.difficulty).toBe('advanced');
    expect(noteDTO.publicationStatus).toBe('draft');
    expect(noteDTO.visibility).toBe('private');
    expect(noteDTO.domains.length).toBe(1);
    expect(noteDTO.skills.length).toBe(1);
    expect(noteDTO.technologies.length).toBe(1);
    expect(noteDTO.tags.length).toBe(3);

    // Verify DTO boundary
    expect((noteDTO as any).ownerId).toBeUndefined();
  });

  it('updates a tech note and modifies verification status independently of publication status', async () => {
    const updatedDTO = await TechNoteService.updateTechNote(TEST_OWNER_ID, createdNoteId, {
      title: 'PostgreSQL Advisory Locks Pattern (Revised)',
      content: '```sql\nSELECT pg_try_advisory_xact_lock(42);\n```',
      verificationStatus: 'deprecated',
      difficulty: 'expert',
      visibility: 'public',
      tagNames: ['postgresql', 'locks'],
      projectIds: [],
    });

    expect(updatedDTO.title).toBe('PostgreSQL Advisory Locks Pattern (Revised)');
    expect(updatedDTO.verificationStatus).toBe('deprecated');
    expect(updatedDTO.difficulty).toBe('expert');
    expect(updatedDTO.visibility).toBe('public');
    expect(updatedDTO.publicationStatus).toBe('draft'); // Not modified
  });

  it('soft-archives a tech note', async () => {
    await TechNoteService.archiveTechNote(TEST_OWNER_ID, createdNoteId);

    const fetched = await TechNoteService.getTechNoteEditorById(TEST_OWNER_ID, createdNoteId);
    expect(fetched.archivedAt).not.toBeNull();
  });
});
