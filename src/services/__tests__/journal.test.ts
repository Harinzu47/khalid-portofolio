import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import { journalEntries, journalTags, journalProjects, projects } from '@/db/schema';
import { JournalService } from '../journal.service';
import { eq } from 'drizzle-orm';

describe('JournalService Integration Tests', () => {
  const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
  let createdJournalId: string;
  let quickCapturedId: string;
  let testProjectId: string;

  beforeAll(async () => {
    const [proj] = await db
      .insert(projects)
      .values({
        ownerId: TEST_OWNER_ID,
        title: 'Journal Test Project',
        slug: `journal-proj-${Date.now()}`,
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    testProjectId = proj.id;
  });

  afterAll(async () => {
    if (createdJournalId) {
      await db.delete(journalTags).where(eq(journalTags.journalId, createdJournalId));
      await db.delete(journalProjects).where(eq(journalProjects.journalId, createdJournalId));
      await db.delete(journalEntries).where(eq(journalEntries.id, createdJournalId));
    }
    if (quickCapturedId) {
      await db.delete(journalTags).where(eq(journalTags.journalId, quickCapturedId));
      await db.delete(journalEntries).where(eq(journalEntries.id, quickCapturedId));
    }
    if (testProjectId) await db.delete(projects).where(eq(projects.id, testProjectId));
  });

  it('performs frictionless Quick Capture with auto-generated title and PRIVATE + DRAFT defaults', async () => {
    const quickDTO = await JournalService.quickCapture(TEST_OWNER_ID, {
      content: 'Refactored connection pooling configuration to prevent starvation.',
      workState: 'Completed Spike',
      tagNames: ['postgres', 'connection-pool'],
    });

    quickCapturedId = quickDTO.id;

    expect(quickDTO.id).toBeDefined();
    expect(quickDTO.title).toContain('Engineering Log');
    expect(quickDTO.publicationStatus).toBe('draft');
    expect(quickDTO.visibility).toBe('private');
    expect(quickDTO.workState).toBe('Completed Spike');
    expect(quickDTO.tags.length).toBe(2);

    // Verify DTO boundary
    expect((quickDTO as any).ownerId).toBeUndefined();
  });

  it('creates structured journal entry with session numbers, reflections, and junctions', async () => {
    const entryDTO = await JournalService.createJournalEntry(TEST_OWNER_ID, {
      title: 'Architecting Semantic Knowledge Graph',
      slug: `semantic-knowledge-graph-${Date.now()}`,
      entryDate: '2026-08-29',
      content: 'Designed the relationship_type_compatibility matrix and edge store.',
      summary: 'Completed edge compatibility model',
      sessionNumber: 104,
      workState: 'Architecture Session',
      isFeatured: true,
      reflection: 'Strict validation prevents circular edges.',
      visibility: 'private',
      projectIds: [testProjectId],
      tagNames: ['graph', 'architecture'],
    });

    createdJournalId = entryDTO.id;

    expect(entryDTO.id).toBeDefined();
    expect(entryDTO.title).toBe('Architecting Semantic Knowledge Graph');
    expect(entryDTO.sessionNumber).toBe(104);
    expect(entryDTO.isFeatured).toBe(true);
    expect(entryDTO.projectIds).toContain(testProjectId);
    expect(entryDTO.publicationStatus).toBe('draft');
  });

  it('updates structured journal entry and preserves DRAFT publication status', async () => {
    const updatedDTO = await JournalService.updateJournalEntry(TEST_OWNER_ID, createdJournalId, {
      title: 'Architecting Semantic Knowledge Graph (Revised)',
      entryDate: '2026-08-29',
      content: 'Revised edge compatibility model with transaction rollback tests.',
      sessionNumber: 105,
      isFeatured: false,
      visibility: 'public',
      tagNames: ['graph', 'vitest'],
      projectIds: [],
    });

    expect(updatedDTO.title).toBe('Architecting Semantic Knowledge Graph (Revised)');
    expect(updatedDTO.sessionNumber).toBe(105);
    expect(updatedDTO.visibility).toBe('public');
    expect(updatedDTO.publicationStatus).toBe('draft'); // Not modified
    expect(updatedDTO.projectIds.length).toBe(0);
  });

  it('soft-archives a journal entry', async () => {
    await JournalService.archiveJournalEntry(TEST_OWNER_ID, createdJournalId);

    const fetched = await JournalService.getJournalEditorById(TEST_OWNER_ID, createdJournalId);
    expect(fetched.archivedAt).not.toBeNull();
  });
});
