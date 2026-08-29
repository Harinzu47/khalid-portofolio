import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import { learningPaths, skills, domains, technologies } from '@/db/schema';
import { LearningPathService } from '../learning-path.service';
import { eq } from 'drizzle-orm';

describe('LearningPathService Integration & Lifecycle Invariant Tests', () => {
  const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
  const OTHER_OWNER_ID = '00000000-0000-0000-0000-000000000002';

  let testSkillId: string;
  let testDomainId: string;
  let testTechId: string;
  let foreignSkillId: string;
  const createdPathIds: string[] = [];

  beforeAll(async () => {
    // 1. Create owner taxonomy items
    const [sk] = await db
      .insert(skills)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Distributed Algorithms',
        slug: `dist-algo-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    testSkillId = sk.id;

    const [dm] = await db
      .insert(domains)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Distributed Systems',
        slug: `dist-sys-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    testDomainId = dm.id;

    const [tc] = await db
      .insert(technologies)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Raft Consensus',
        slug: `raft-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    testTechId = tc.id;

    // 2. Create foreign skill owned by OTHER_OWNER_ID
    const [foreignSk] = await db
      .insert(skills)
      .values({
        ownerId: OTHER_OWNER_ID,
        name: 'Foreign Skill',
        slug: `foreign-sk-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    foreignSkillId = foreignSk.id;
  });

  afterAll(async () => {
    for (const id of createdPathIds) {
      await db.delete(learningPaths).where(eq(learningPaths.id, id));
    }
    if (testSkillId) await db.delete(skills).where(eq(skills.id, testSkillId));
    if (testDomainId) await db.delete(domains).where(eq(domains.id, testDomainId));
    if (testTechId) await db.delete(technologies).where(eq(technologies.id, testTechId));
    if (foreignSkillId) await db.delete(skills).where(eq(skills.id, foreignSkillId));
  });

  it('creates a LearningPath with safe defaults (planned, private, draft) and explicit progress (Amendment 7)', async () => {
    const lp = await LearningPathService.createLearningPath(TEST_OWNER_ID, {
      title: 'Distributed Consensus & Replication',
      slug: `dist-consensus-${Date.now()}`,
      summary: 'Mastering Paxos, Raft, and Multi-Paxos replication models.',
      status: 'active',
      startedAt: '2026-08-01',
      progressMode: 'manual',
      progressValue: 45,
      currentFocus: 'Raft Log Compaction and Snapshotting',
      skillIds: [testSkillId],
      domainIds: [testDomainId],
      technologyIds: [testTechId],
    });
    createdPathIds.push(lp.id);

    expect(lp.id).toBeDefined();
    expect(lp.title).toBe('Distributed Consensus & Replication');
    expect(lp.status).toBe('active');
    expect(lp.progressMode).toBe('manual');
    expect(lp.progressValue).toBe(45);
    expect(lp.currentFocus).toBe('Raft Log Compaction and Snapshotting');
    expect(lp.visibility).toBe('private');
    expect(lp.publicationStatus).toBe('draft');
    expect(lp.skillIds).toContain(testSkillId);
    expect(lp.domainIds).toContain(testDomainId);
    expect(lp.technologyIds).toContain(testTechId);

    // Verify DTO boundary
    expect((lp as any).ownerId).toBeUndefined();
  });

  it('rejects creation linking foreign-owner taxonomy items (Amendment 13)', async () => {
    await expect(
      LearningPathService.createLearningPath(TEST_OWNER_ID, {
        title: 'Unauthorized Taxonomy Link Attempt',
        skillIds: [foreignSkillId], // Belongs to OTHER_OWNER_ID
      })
    ).rejects.toThrow(/belong to another owner/i);
  });

  it('enforces lifecycle invariant: completed requires completedAt and clears currentFocus (Amendment 6)', async () => {
    // 1. Rejects completed status without completedAt
    await expect(
      LearningPathService.createLearningPath(TEST_OWNER_ID, {
        title: 'Premature Completion Attempt',
        status: 'completed',
        // completedAt is missing
      })
    ).rejects.toThrow(/require a completion date/i);

    // 2. Creation with valid completed status clears currentFocus
    const completedPath = await LearningPathService.createLearningPath(TEST_OWNER_ID, {
      title: 'Finished Consensus Study',
      status: 'completed',
      startedAt: '2026-07-01',
      completedAt: '2026-08-20',
      currentFocus: 'Should be cleared',
    });
    createdPathIds.push(completedPath.id);

    expect(completedPath.status).toBe('completed');
    expect(completedPath.completedAt).toBe('2026-08-20');
    expect(completedPath.currentFocus).toBeNull();
  });

  it('transitions status and automatically maintains invariants on status change (Amendment 6)', async () => {
    const activePath = await LearningPathService.createLearningPath(TEST_OWNER_ID, {
      title: 'Active Path Transition Test',
      status: 'active',
      startedAt: '2026-08-01',
      currentFocus: 'Active Module',
    });
    createdPathIds.push(activePath.id);

    const completed = await LearningPathService.setLearningPathStatus(
      TEST_OWNER_ID,
      activePath.id,
      'completed'
    );

    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBeDefined();
    expect(completed.currentFocus).toBeNull();
  });

  it('soft-archives a LearningPath and clears active current focus (Amendment 6, 44)', async () => {
    const path = await LearningPathService.createLearningPath(TEST_OWNER_ID, {
      title: 'Archived Path Test',
      status: 'active',
      currentFocus: 'Old Focus',
    });
    createdPathIds.push(path.id);

    await LearningPathService.archiveLearningPath(TEST_OWNER_ID, path.id);

    const archived = await LearningPathService.getLearningPathEditorById(TEST_OWNER_ID, path.id);
    expect(archived.status).toBe('archived');
    expect(archived.currentFocus).toBeNull();
    expect(archived.archivedAt).toBeDefined();
  });
});
