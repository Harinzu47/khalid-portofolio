import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import { adrs, projects } from '@/db/schema';
import { ADRService } from '../adrs.service';
import { eq } from 'drizzle-orm';

describe('ADRService Integration Tests', () => {
  const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
  const OTHER_OWNER_ID = '00000000-0000-0000-0000-000000000002';
  let initialADRId: string;
  let supersedingADRId: string;
  let testProjectId: string;

  beforeAll(async () => {
    const [proj] = await db
      .insert(projects)
      .values({
        ownerId: TEST_OWNER_ID,
        title: 'ADR Architecture Project',
        slug: `adr-proj-${Date.now()}`,
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    testProjectId = proj.id;
  });

  afterAll(async () => {
    if (initialADRId) await db.delete(adrs).where(eq(adrs.id, initialADRId));
    if (supersedingADRId) await db.delete(adrs).where(eq(adrs.id, supersedingADRId));
    if (testProjectId) await db.delete(projects).where(eq(projects.id, testProjectId));
  });

  it('creates an ADR with decoupled domain lifecycle (status=proposed) and publication status (draft)', async () => {
    const adrDTO = await ADRService.createADR(TEST_OWNER_ID, {
      title: 'Adopt Monorepo Structure for Services',
      slug: `adopt-monorepo-services-${Date.now()}`,
      status: 'proposed',
      context: 'Multiple distinct packages exist across frontend, backend, and workers.',
      decision: 'Consolidate into Turborepo with shared configs.',
      alternatives: { multirepo: 'High sync overhead', polyrepo: 'Hard dependency management' },
      consequences: { positive: ['Atomic commits', 'Shared types'], negative: ['CI configuration overhead'] },
      projectId: testProjectId,
      visibility: 'private',
    });

    initialADRId = adrDTO.id;

    expect(adrDTO.id).toBeDefined();
    expect(adrDTO.number).toBeGreaterThan(0);
    expect(adrDTO.title).toBe('Adopt Monorepo Structure for Services');
    expect(adrDTO.status).toBe('proposed');
    expect(adrDTO.publicationStatus).toBe('draft');
    expect(adrDTO.visibility).toBe('private');
    expect(adrDTO.projectId).toBe(testProjectId);
    expect(adrDTO.project?.name).toBe('ADR Architecture Project');

    // Verify DTO boundary
    expect((adrDTO as any).ownerId).toBeUndefined();
  });

  it('updates an ADR and transitions domain status to accepted while keeping draft publication status', async () => {
    const updatedDTO = await ADRService.updateADR(TEST_OWNER_ID, initialADRId, {
      title: 'Adopt Monorepo Structure for Services',
      status: 'accepted',
      context: 'Context finalized after RFC review.',
      decision: 'Approved Turborepo adoption.',
      decidedAt: '2026-08-29T00:00:00.000Z',
    });

    expect(updatedDTO.status).toBe('accepted');
    expect(updatedDTO.publicationStatus).toBe('draft');
    expect(updatedDTO.decidedAt).toBeDefined();
  });

  it('rejects self-supersession attempts (Amendment 10)', async () => {
    await expect(
      ADRService.updateADR(TEST_OWNER_ID, initialADRId, {
        title: 'Adopt Monorepo Structure for Services',
        supersededById: initialADRId, // Self reference
      })
    ).rejects.toThrow(/cannot supersede itself/i);
  });

  it('rejects supersession target from a different owner (Amendment 10)', async () => {
    // Create an ADR owned by OTHER_OWNER_ID
    const [foreignADR] = await db
      .insert(adrs)
      .values({
        ownerId: OTHER_OWNER_ID,
        title: 'Foreign Architecture Decision',
        slug: `foreign-adr-${Date.now()}`,
        status: 'proposed',
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();

    await expect(
      ADRService.updateADR(TEST_OWNER_ID, initialADRId, {
        title: 'Adopt Monorepo Structure for Services',
        supersededById: foreignADR.id,
      })
    ).rejects.toThrow(/does not exist or does not belong to the current owner/i);

    // Clean up foreign ADR
    await db.delete(adrs).where(eq(adrs.id, foreignADR.id));
  });

  it('enforces supersession consistency: source becomes superseded and references target (Amendment 10)', async () => {
    // Create superseding ADR
    const newADRDTO = await ADRService.createADR(TEST_OWNER_ID, {
      title: 'Migrate from Turborepo to Isolated Polyrepo Packages',
      slug: `migrate-to-isolated-packages-${Date.now()}`,
      status: 'proposed',
      context: 'Build pipelines require distributed artifact caching.',
      decision: 'Migrate to polyrepo.',
    });
    supersedingADRId = newADRDTO.id;

    // Update initial ADR to be superseded by new ADR
    const supersededResult = await ADRService.updateADR(TEST_OWNER_ID, initialADRId, {
      title: 'Adopt Monorepo Structure for Services',
      supersededById: supersedingADRId,
    });

    expect(supersededResult.status).toBe('superseded');
    expect(supersededResult.supersededById).toBe(supersedingADRId);
    expect(supersededResult.supersededBy?.name).toBe('Migrate from Turborepo to Isolated Polyrepo Packages');

    // Verify target status is NOT automatically changed to accepted per Amendment 10
    const targetCheck = await ADRService.getADREditorById(TEST_OWNER_ID, supersedingADRId);
    expect(targetCheck.status).toBe('proposed');
  });

  it('soft-archives an ADR', async () => {
    await ADRService.archiveADR(TEST_OWNER_ID, initialADRId);

    const fetched = await ADRService.getADREditorById(TEST_OWNER_ID, initialADRId);
    expect(fetched.archivedAt).not.toBeNull();
  });
});
