import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import { nowEntries, projects, learningPaths, domains, technologies } from '@/db/schema';
import { NowService } from '../now.service';
import { eq } from 'drizzle-orm';

describe('NowService Integration & Invariant Tests', () => {
  const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
  const OTHER_OWNER_ID = '00000000-0000-0000-0000-000000000002';

  let testProjectId: string;
  let testLearningPathId: string;
  let foreignProjectId: string;
  const createdNowIds: string[] = [];

  beforeAll(async () => {
    // 1. Create owner-scoped Project
    const [proj] = await db
      .insert(projects)
      .values({
        ownerId: TEST_OWNER_ID,
        title: 'Now Focus Project',
        slug: `now-proj-${Date.now()}`,
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    testProjectId = proj.id;

    // 2. Create owner-scoped LearningPath
    const [lp] = await db
      .insert(learningPaths)
      .values({
        ownerId: TEST_OWNER_ID,
        title: 'Now Focus Learning Path',
        slug: `now-lp-${Date.now()}`,
        status: 'active',
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    testLearningPathId = lp.id;

    // 3. Create foreign Project owned by OTHER_OWNER_ID
    const [foreignProj] = await db
      .insert(projects)
      .values({
        ownerId: OTHER_OWNER_ID,
        title: 'Foreign Project',
        slug: `foreign-proj-${Date.now()}`,
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    foreignProjectId = foreignProj.id;
  });

  afterAll(async () => {
    for (const id of createdNowIds) {
      await db.delete(nowEntries).where(eq(nowEntries.id, id));
    }
    if (testProjectId) await db.delete(projects).where(eq(projects.id, testProjectId));
    if (testLearningPathId) await db.delete(learningPaths).where(eq(learningPaths.id, testLearningPathId));
    if (foreignProjectId) await db.delete(projects).where(eq(projects.id, foreignProjectId));
  });

  it('creates an active NowEntry with PRIVATE + DRAFT safe defaults and structural relations', async () => {
    const entry = await NowService.createNowEntry(TEST_OWNER_ID, {
      entryType: 'building',
      title: 'Building Real-Time RLS Matrix',
      description: 'Designing fine-grained owner isolation.',
      status: 'active',
      isCurrent: true,
      startedAt: '2026-08-29',
      projectIds: [testProjectId],
      learningPathIds: [testLearningPathId],
    });

    createdNowIds.push(entry.id);

    expect(entry.id).toBeDefined();
    expect(entry.title).toBe('Building Real-Time RLS Matrix');
    expect(entry.entryType).toBe('building');
    expect(entry.status).toBe('active');
    expect(entry.isCurrent).toBe(true);
    expect(entry.visibility).toBe('private');
    expect(entry.publicationStatus).toBe('draft');
    expect(entry.projectIds).toContain(testProjectId);
    expect(entry.learningPathIds).toContain(testLearningPathId);

    // Verify DTO boundary (no ownerId leak)
    expect((entry as any).ownerId).toBeUndefined();
  });

  it('rejects creation linking foreign-owner project (Amendment 13)', async () => {
    await expect(
      NowService.createNowEntry(TEST_OWNER_ID, {
        entryType: 'building',
        title: 'Unauthorized Linking Attempt',
        projectIds: [foreignProjectId], // Belongs to OTHER_OWNER_ID
      })
    ).rejects.toThrow(/belong to another owner/i);
  });

  it('enforces invariant: completed or archived entries cannot have isCurrent = true (Amendment 3)', async () => {
    const completedEntry = await NowService.createNowEntry(TEST_OWNER_ID, {
      entryType: 'learning',
      title: 'Completed Linear Algebra Review',
      status: 'completed',
      isCurrent: true, // Should be normalized to false by invariant
      startedAt: '2026-08-01',
      endedAt: '2026-08-15',
    });
    createdNowIds.push(completedEntry.id);

    expect(completedEntry.status).toBe('completed');
    expect(completedEntry.isCurrent).toBe(false);
  });

  it('supports frictionless Quick Add with safe defaults (Amendment 16)', async () => {
    const quickEntry = await NowService.quickAddNow(TEST_OWNER_ID, {
      entryType: 'reading',
      title: 'Reading "Designing Data-Intensive Applications" Chapter 5',
    });
    createdNowIds.push(quickEntry.id);

    expect(quickEntry.entryType).toBe('reading');
    expect(quickEntry.title).toBe('Reading "Designing Data-Intensive Applications" Chapter 5');
    expect(quickEntry.isCurrent).toBe(true);
    expect(quickEntry.status).toBe('active');
    expect(quickEntry.visibility).toBe('private');
    expect(quickEntry.publicationStatus).toBe('draft');
  });

  it('completes a NowEntry and preserves existing valid completion timestamp (Amendment 4, 5)', async () => {
    const entryToComplete = await NowService.createNowEntry(TEST_OWNER_ID, {
      entryType: 'managing',
      title: 'Managing Migration 0006 Verification',
      status: 'active',
      isCurrent: true,
      startedAt: '2026-08-20',
      endedAt: '2026-08-28', // Pre-existing completion date
    });
    createdNowIds.push(entryToComplete.id);

    const completed = await NowService.completeNowEntry(TEST_OWNER_ID, entryToComplete.id);

    expect(completed.status).toBe('completed');
    expect(completed.isCurrent).toBe(false);
    expect(completed.endedAt).toBe('2026-08-28'); // Preserved
  });

  it('soft-archives a NowEntry without destroying historical completion dates (Amendment 5)', async () => {
    const entryToArchive = await NowService.createNowEntry(TEST_OWNER_ID, {
      entryType: 'researching',
      title: 'Researching Vector Embeddings In PostgreSQL',
      status: 'completed',
      isCurrent: false,
      startedAt: '2026-08-01',
      endedAt: '2026-08-10',
    });
    createdNowIds.push(entryToArchive.id);

    await NowService.archiveNowEntry(TEST_OWNER_ID, entryToArchive.id);

    const archived = await NowService.getNowEntryEditorById(TEST_OWNER_ID, entryToArchive.id);
    expect(archived.status).toBe('archived');
    expect(archived.isCurrent).toBe(false);
    expect(archived.archivedAt).toBeDefined();
    expect(archived.endedAt).toBe('2026-08-10'); // Preserved
  });
});
