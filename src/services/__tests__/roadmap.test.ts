import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import { roadmapItems } from '@/db/schema';
import { RoadmapService } from '../roadmap.service';
import { eq } from 'drizzle-orm';

describe('RoadmapService Integration & Deterministic Reorder Tests', () => {
  const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
  const OTHER_OWNER_ID = '00000000-0000-0000-0000-000000000002';

  let item1Id: string;
  let item2Id: string;
  let item3Id: string;
  let foreignItemId: string;

  beforeAll(async () => {
    // 1. Create items owned by TEST_OWNER_ID
    const item1 = await RoadmapService.createRoadmapItem(TEST_OWNER_ID, {
      title: 'Milestone 1: Multi-Cluster Setup',
      status: 'planned',
      priority: 1,
      sortOrder: 1,
    });
    item1Id = item1.id;

    const item2 = await RoadmapService.createRoadmapItem(TEST_OWNER_ID, {
      title: 'Milestone 2: Service Mesh Ingress',
      status: 'backlog',
      priority: 2,
      sortOrder: 2,
    });
    item2Id = item2.id;

    const item3 = await RoadmapService.createRoadmapItem(TEST_OWNER_ID, {
      title: 'Milestone 3: Global Telemetry Mesh',
      status: 'backlog',
      priority: 3,
      sortOrder: 3,
    });
    item3Id = item3.id;

    // 2. Create foreign item owned by OTHER_OWNER_ID
    const [foreign] = await db
      .insert(roadmapItems)
      .values({
        ownerId: OTHER_OWNER_ID,
        title: 'Foreign Roadmap Item',
        slug: `foreign-roadmap-${Date.now()}`,
        status: 'backlog',
        visibility: 'private',
        publicationStatus: 'draft',
        sortOrder: 1,
      })
      .returning();
    foreignItemId = foreign.id;
  });

  afterAll(async () => {
    if (item1Id) await db.delete(roadmapItems).where(eq(roadmapItems.id, item1Id));
    if (item2Id) await db.delete(roadmapItems).where(eq(roadmapItems.id, item2Id));
    if (item3Id) await db.delete(roadmapItems).where(eq(roadmapItems.id, item3Id));
    if (foreignItemId) await db.delete(roadmapItems).where(eq(roadmapItems.id, foreignItemId));
  });

  it('creates Roadmap items with PRIVATE + DRAFT safe defaults', async () => {
    const item = await RoadmapService.getRoadmapEditorById(TEST_OWNER_ID, item1Id);

    expect(item.id).toBe(item1Id);
    expect(item.title).toBe('Milestone 1: Multi-Cluster Setup');
    expect(item.visibility).toBe('private');
    expect(item.publicationStatus).toBe('draft');
    expect(item.sortOrder).toBe(1);

    // Verify DTO boundary
    expect((item as any).ownerId).toBeUndefined();
  });

  it('performs deterministic transactional reordering across roadmap items (Amendment 12)', async () => {
    // Reorder: 3 -> sortOrder 1, 1 -> sortOrder 2, 2 -> sortOrder 3
    await RoadmapService.reorderRoadmapItems(TEST_OWNER_ID, [
      { id: item3Id, sortOrder: 1 },
      { id: item1Id, sortOrder: 2 },
      { id: item2Id, sortOrder: 3 },
    ]);

    const updated3 = await RoadmapService.getRoadmapEditorById(TEST_OWNER_ID, item3Id);
    const updated1 = await RoadmapService.getRoadmapEditorById(TEST_OWNER_ID, item1Id);
    const updated2 = await RoadmapService.getRoadmapEditorById(TEST_OWNER_ID, item2Id);

    expect(updated3.sortOrder).toBe(1);
    expect(updated1.sortOrder).toBe(2);
    expect(updated2.sortOrder).toBe(3);
  });

  it('rejects reorder payload with duplicate entity IDs (Amendment 12)', async () => {
    await expect(
      RoadmapService.reorderRoadmapItems(TEST_OWNER_ID, [
        { id: item1Id, sortOrder: 1 },
        { id: item1Id, sortOrder: 2 }, // Duplicate ID
      ])
    ).rejects.toThrow(/Duplicate roadmap item IDs/i);
  });

  it('rejects reorder payload with duplicate sortOrder values (Amendment 12)', async () => {
    await expect(
      RoadmapService.reorderRoadmapItems(TEST_OWNER_ID, [
        { id: item1Id, sortOrder: 1 },
        { id: item2Id, sortOrder: 1 }, // Duplicate sortOrder
      ])
    ).rejects.toThrow(/Duplicate sortOrder values/i);
  });

  it('rejects reorder payload containing a foreign-owner item and rolls back transaction (Amendment 12)', async () => {
    await expect(
      RoadmapService.reorderRoadmapItems(TEST_OWNER_ID, [
        { id: item1Id, sortOrder: 10 },
        { id: foreignItemId, sortOrder: 20 }, // Foreign owner
      ])
    ).rejects.toThrow(/belong to another owner/i);

    // Verify sortOrder of item1 was rolled back and not modified
    const current1 = await RoadmapService.getRoadmapEditorById(TEST_OWNER_ID, item1Id);
    expect(current1.sortOrder).toBe(2); // Retained previous value
  });

  it('soft-archives a RoadmapItem', async () => {
    await RoadmapService.archiveRoadmapItem(TEST_OWNER_ID, item3Id);

    const archived = await RoadmapService.getRoadmapEditorById(TEST_OWNER_ID, item3Id);
    expect(archived.archivedAt).toBeDefined();
  });
});
