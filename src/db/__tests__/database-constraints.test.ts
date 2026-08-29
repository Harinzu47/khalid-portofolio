import { describe, it, expect, beforeAll } from 'vitest';
import { isSupabaseReachable } from './rls-helpers';
import { db } from '../client';
import * as schema from '../schema';
import { sql } from 'drizzle-orm';

const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';

describe('Database Domain Constraints & Integrity Suite', () => {
  let isReachable = false;

  beforeAll(async () => {
    isReachable = await isSupabaseReachable();
  });

  describe('Uniqueness & Cardinality Invariants', () => {
    it('enforces 1-to-0..1 ProjectCaseStudy cardinality (unique project_id)', async () => {
      if (!isReachable) return;

      // Select existing project
      const [proj] = await db.select().from(schema.projects).limit(1);
      if (!proj) return;

      // Ensure first case study exists or insert
      const [existing] = await db
        .select()
        .from(schema.projectCaseStudies)
        .where(sql`${schema.projectCaseStudies.projectId} = ${proj.id}`)
        .limit(1);

      if (!existing) {
        await db.insert(schema.projectCaseStudies).values({
          ownerId: TEST_OWNER_ID,
          projectId: proj.id,
          title: 'Initial Case Study',
        });
      }

      // Attempting to insert a duplicate case study for the same project must fail
      await expect(
        db.insert(schema.projectCaseStudies).values({
          ownerId: TEST_OWNER_ID,
          projectId: proj.id,
          title: 'Duplicate Collision Case Study',
        })
      ).rejects.toThrow();
    });

    it('enforces slug uniqueness on domains table', async () => {
      if (!isReachable) return;

      const testSlug = `test-domain-${Date.now()}`;
      await db.insert(schema.domains).values({
        ownerId: TEST_OWNER_ID,
        name: 'Test Domain 1',
        slug: testSlug,
      });

      await expect(
        db.insert(schema.domains).values({
          ownerId: TEST_OWNER_ID,
          name: 'Test Domain 2',
          slug: testSlug,
        })
      ).rejects.toThrow();

      // Cleanup
      await db.delete(schema.domains).where(sql`${schema.domains.slug} = ${testSlug}`);
    });

    it('enforces slug uniqueness on ADRs table', async () => {
      if (!isReachable) return;

      const testSlug = `adr-test-${Date.now()}`;
      await db.insert(schema.adrs).values({
        ownerId: TEST_OWNER_ID,
        title: 'Test Decision',
        slug: testSlug,
      });

      await expect(
        db.insert(schema.adrs).values({
          ownerId: TEST_OWNER_ID,
          title: 'Test Decision Collision',
          slug: testSlug,
        })
      ).rejects.toThrow();

      // Cleanup
      await db.delete(schema.adrs).where(sql`${schema.adrs.slug} = ${testSlug}`);
    });
  });

  describe('Semantic Graph Integrity Constraints', () => {
    it('blocks self-edges in knowledge_relationships (source == target)', async () => {
      if (!isReachable) return;

      const [relType] = await db.select().from(schema.relationshipTypes).limit(1);
      if (!relType) return;

      const dummyId = '00000000-0000-0000-0000-000000000001';

      // Self-edge: same entity type AND same ID must violate chk_no_self_edge
      await expect(
        db.insert(schema.knowledgeRelationships).values({
          ownerId: TEST_OWNER_ID,
          relationshipTypeId: relType.id,
          sourceType: 'PROJECT',
          sourceId: dummyId,
          targetType: 'PROJECT',
          targetId: dummyId,
        })
      ).rejects.toThrow();
    });

    it('enforces unique semantic edges across relationship_type and node pairs', async () => {
      if (!isReachable) return;

      const [relType] = await db.select().from(schema.relationshipTypes).limit(1);
      if (!relType) return;

      const sourceId = '00000000-0000-0000-0000-000000000002';
      const targetId = '00000000-0000-0000-0000-000000000003';

      await db.insert(schema.knowledgeRelationships).values({
        ownerId: TEST_OWNER_ID,
        relationshipTypeId: relType.id,
        sourceType: 'ARTICLE',
        sourceId,
        targetType: 'TECH_NOTE',
        targetId,
      });

      // Duplicate exact edge must fail
      await expect(
        db.insert(schema.knowledgeRelationships).values({
          ownerId: TEST_OWNER_ID,
          relationshipTypeId: relType.id,
          sourceType: 'ARTICLE',
          sourceId,
          targetType: 'TECH_NOTE',
          targetId,
        })
      ).rejects.toThrow();

      // Cleanup
      await db.delete(schema.knowledgeRelationships).where(
        sql`${schema.knowledgeRelationships.sourceId} = ${sourceId} AND ${schema.knowledgeRelationships.targetId} = ${targetId}`
      );
    });
  });

  describe('Date Integrity Checks', () => {
    it('rejects career experiences with end_date prior to start_date', async () => {
      if (!isReachable) return;

      const [org] = await db.select().from(schema.organizations).limit(1);
      if (!org) return;

      await expect(
        db.insert(schema.careerExperiences).values({
          ownerId: TEST_OWNER_ID,
          organizationId: org.id,
          position: 'Time Traveler Engineer',
          startDate: '2026-06-01',
          endDate: '2026-01-01', // Invalid: before start date
        })
      ).rejects.toThrow();
    });

    it('rejects now_entries with ended_at prior to started_at', async () => {
      if (!isReachable) return;

      await expect(
        db.insert(schema.nowEntries).values({
          ownerId: TEST_OWNER_ID,
          entryType: 'building',
          title: 'Invalid Timeline Activity',
          startedAt: '2026-08-10',
          endedAt: '2026-08-01', // Invalid
        })
      ).rejects.toThrow();
    });
  });

  describe('Canonical Defaults & State Machine Values', () => {
    it('sets default visibility to private and publication_status to draft on newly created entities', async () => {
      if (!isReachable) return;

      const testSlug = `default-test-${Date.now()}`;
      const [created] = await db
        .insert(schema.learningPaths)
        .values({
          ownerId: TEST_OWNER_ID,
          title: 'Default State Path',
          slug: testSlug,
        })
        .returning();

      expect(created.visibility).toBe('private');
      expect(created.publicationStatus).toBe('draft');
      expect(created.status).toBe('planned');

      // Cleanup
      await db.delete(schema.learningPaths).where(sql`${schema.learningPaths.id} = ${created.id}`);
    });
  });
});
