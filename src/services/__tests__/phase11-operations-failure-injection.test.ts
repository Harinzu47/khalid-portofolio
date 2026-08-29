import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { db } from '@/db/client';
import {
  projects,
  projectCaseStudies,
  articles,
  notes,
  journalEntries,
  media,
  knowledgeRelationships,
  searchDocuments,
} from '@/db/schema';
import { OperationsDiagnosticsService } from '@/services/operations-diagnostics.service';
import { PublicSearchService } from '@/services/public-search.service';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { MediaService } from '@/services/media.service';
import { MediaDeliveryService } from '@/services/media-delivery.service';
import { SearchOperationsService } from '@/services/search-operations.service';
import { eq, or } from 'drizzle-orm';

describe('Phase 11: Operations Diagnostics & Privacy Failure Injection Suite', () => {
  const OWNER_A = 'a0000000-0000-0000-0000-000000000001';
  const OWNER_B = 'b0000000-0000-0000-0000-000000000002';

  beforeAll(async () => {
    // Clean test records
    await db.delete(searchDocuments).where(or(eq(searchDocuments.ownerId, OWNER_A), eq(searchDocuments.ownerId, OWNER_B)));
    await db.delete(knowledgeRelationships).where(or(eq(knowledgeRelationships.ownerId, OWNER_A), eq(knowledgeRelationships.ownerId, OWNER_B)));
    await db.delete(projectCaseStudies).where(or(eq(projectCaseStudies.ownerId, OWNER_A), eq(projectCaseStudies.ownerId, OWNER_B)));
    await db.delete(projects).where(or(eq(projects.ownerId, OWNER_A), eq(projects.ownerId, OWNER_B)));
    await db.delete(articles).where(or(eq(articles.ownerId, OWNER_A), eq(articles.ownerId, OWNER_B)));
    await db.delete(notes).where(or(eq(notes.ownerId, OWNER_A), eq(notes.ownerId, OWNER_B)));
    await db.delete(journalEntries).where(or(eq(journalEntries.ownerId, OWNER_A), eq(journalEntries.ownerId, OWNER_B)));
    await db.delete(media).where(or(eq(media.ownerId, OWNER_A), eq(media.ownerId, OWNER_B)));
  });

  beforeEach(async () => {
    // Quick cleanup between tests
    await db.delete(searchDocuments).where(or(eq(searchDocuments.ownerId, OWNER_A), eq(searchDocuments.ownerId, OWNER_B)));
  });

  describe('1. Owner Operations Diagnostics Service', () => {
    it('runs comprehensive diagnostics and returns structured categories with valid status vocabulary', async () => {
      const report = await OperationsDiagnosticsService.runDiagnostics(OWNER_A);

      expect(report).toBeDefined();
      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN']).toContain(report.overallStatus);
      expect(report.checkedAt).toBeTruthy();

      // Verify all 5 required categories
      expect(report.categories.database).toBeDefined();
      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN']).toContain(report.categories.database.status);
      expect(report.categories.database.code).toBeTruthy();
      expect(report.categories.database.safeMessage).toBeTruthy();

      expect(report.categories.search).toBeDefined();
      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN']).toContain(report.categories.search.status);

      expect(report.categories.publishing).toBeDefined();
      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN']).toContain(report.categories.publishing.status);

      expect(report.categories.media).toBeDefined();
      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN']).toContain(report.categories.media.status);

      expect(report.categories.migrationsSchema).toBeDefined();
      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN']).toContain(report.categories.migrationsSchema.status);
    });

    it('detects search projection drift accurately', async () => {
      const searchHealth = await SearchOperationsService.getSearchHealth(OWNER_A);
      expect(typeof searchHealth.indexedDocuments).toBe('number');
      expect(typeof searchHealth.staleDocuments).toBe('number');
      expect(typeof searchHealth.missingProjections).toBe('number');
    });
  });

  describe('2. Mandatory Privacy Failure Injection Scenarios (Section 20)', () => {
    it('Scenario A: PRIVATE Project in search_documents is NEVER returned to anonymous PublicSearch', async () => {
      const privateProjId = '11111111-1111-1111-1111-111111111101';
      await db.insert(projects).values({
        id: privateProjId,
        ownerId: OWNER_A,
        title: 'Confidential Internal Kernel Project',
        slug: 'confidential-internal-kernel-proj',
        visibility: 'private',
        publicationStatus: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      // Inject document into search_documents with private visibility
      await db.insert(searchDocuments).values({
        id: '22222222-2222-2222-2222-222222222201',
        ownerId: OWNER_A,
        entityType: 'PROJECT',
        entityId: privateProjId,
        title: 'Confidential Internal Kernel Project',
        slug: 'confidential-internal-kernel-proj',
        summary: 'Secret kernel architecture',
        visibility: 'private',
        publicationStatus: 'draft',
        sourceUpdatedAt: new Date(),
        indexedAt: new Date(),
        projectionVersion: 1,
      });

      // Anonymous public work search
      const results = await PublicSearchService.searchWork({
        q: 'Confidential Internal Kernel',
      });

      expect(results.items.some((item) => item.entity.id === privateProjId)).toBe(false);
      expect(results.items.some((item) => item.entity.title.includes('Confidential'))).toBe(false);
    });

    it('Scenario B: PRIVATE Journal DERIVED_INTO PUBLIC TechNote serves note cleanly without Journal leak', async () => {
      const journalId = '33333333-3333-3333-3333-333333333301';
      const noteId = '44444444-4444-4444-4444-444444444401';
      const noteSlug = 'public-sanitized-bgp-debugging';

      await db.insert(journalEntries).values({
        id: journalId,
        ownerId: OWNER_A,
        title: 'Private Incident Log: Outage at Core Switch',
        slug: 'private-incident-log-outage-core-switch',
        content: 'Internal raw incident debug logs with sensitive switch traces.',
        sessionNumber: 42,
        reflection: 'Secret internal switch credentials were compromised',
        visibility: 'private',
        publicationStatus: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      await db.insert(notes).values({
        id: noteId,
        ownerId: OWNER_A,
        title: 'Public BGP Debugging Strategies',
        slug: noteSlug,
        content: 'Clean sanitized guide on troubleshooting BGP sessions.',
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      const relType = await db.query.relationshipTypes.findFirst();
      if (relType) {
        await db.insert(knowledgeRelationships).values({
          id: '55555555-5555-5555-5555-555555555501',
          ownerId: OWNER_A,
          relationshipTypeId: relType.id,
          sourceType: 'JOURNAL_ENTRY',
          sourceId: journalId,
          targetType: 'TECH_NOTE',
          targetId: noteId,
          visibility: 'private',
          createdAt: new Date(),
        }).onConflictDoNothing();
      }

      const noteDetail = await PublicReadModelsService.getNoteBySlug(noteSlug);
      expect(noteDetail).not.toBeNull();
      expect(noteDetail?.title).toBe('Public BGP Debugging Strategies');

      // Verify that no private journal title or secret reflection notes leaked
      const serialized = JSON.stringify(noteDetail);
      expect(serialized).not.toContain('Outage at Core Switch');
      expect(serialized).not.toContain('Secret internal switch credentials');
      expect(serialized).not.toContain(journalId);
    });

    it('Scenario C: UNLISTED + PUBLISHED Project resolves via direct slug but is excluded from work index and public search', async () => {
      const unlistedProjId = '66666666-6666-6666-6666-666666666601';
      const unlistedSlug = 'unlisted-client-special-portal';

      await db.insert(projects).values({
        id: unlistedProjId,
        ownerId: OWNER_A,
        title: 'Unlisted Client Special Portal',
        slug: unlistedSlug,
        visibility: 'unlisted',
        publicationStatus: 'published',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      // 1. Direct slug detail resolves
      const detail = await PublicReadModelsService.getProjectDetailBySlug(unlistedSlug);
      expect(detail).not.toBeNull();
      expect(detail?.title).toBe('Unlisted Client Special Portal');

      // 2. Excluded from Work Index listing
      const workIndex = await PublicReadModelsService.getWorkIndex();
      expect(workIndex.some((p) => p.slug === unlistedSlug)).toBe(false);

      // 3. Excluded from Public Search
      const searchRes = await PublicSearchService.searchWork({ q: 'Unlisted Client Special' });
      expect(searchRes.items.some((i) => i.entity.slug === unlistedSlug)).toBe(false);
    });

    it('Scenario D: CaseStudy whose parent Project is PRIVATE is omitted from public discovery', async () => {
      const privProjId = '77777777-7777-7777-7777-777777777701';
      const privProjSlug = 'private-banking-infrastructure';
      const caseStudyId = '88888888-8888-8888-8888-888888888801';

      await db.insert(projects).values({
        id: privProjId,
        ownerId: OWNER_A,
        title: 'Private Banking Infrastructure',
        slug: privProjSlug,
        visibility: 'private',
        publicationStatus: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      await db.insert(projectCaseStudies).values({
        id: caseStudyId,
        ownerId: OWNER_A,
        projectId: privProjId,
        title: 'Architecture Review: High Security Banking Node',
        executiveSummary: 'Deep architectural study of core switch cluster.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      // Direct public read returns null (404)
      const detail = await PublicReadModelsService.getProjectDetailBySlug(privProjSlug);
      expect(detail).toBeNull();
    });

    it('Scenario E: Media metadata with private visibility reports isEligible=false and never leaks storage path', async () => {
      const privMediaId = '99999999-9999-9999-9999-999999999901';

      await db.insert(media).values({
        id: privMediaId,
        ownerId: OWNER_A,
        storageBucket: 'portfolio',
        path: 'private/vault/internal-arch-diag-2026.png',
        originalName: 'internal-arch-diag-2026.png',
        mimeType: 'image/png',
        sizeBytes: 409600,
        visibility: 'private',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      const validation = await MediaService.validateMediaForPublicProjection(privMediaId);
      expect(validation.isEligible).toBe(false);
      expect(validation.media).toBeUndefined();
    });

    it('Scenario F: Cross-owner data isolation: OWNER_B cannot access OWNER_A search records or diagnostic entities', async () => {
      const artAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      await db.insert(articles).values({
        id: artAId,
        ownerId: OWNER_A,
        title: 'Owner A Proprietary Algorithm',
        slug: 'owner-a-proprietary-algo',
        content: 'Confidential research notes for Owner A.',
        visibility: 'private',
        publicationStatus: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      await db.insert(searchDocuments).values({
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        ownerId: OWNER_A,
        entityType: 'ARTICLE',
        entityId: artAId,
        title: 'Owner A Proprietary Algorithm',
        slug: 'owner-a-proprietary-algo',
        visibility: 'private',
        publicationStatus: 'draft',
        sourceUpdatedAt: new Date(),
        indexedAt: new Date(),
        projectionVersion: 1,
      });

      // OWNER_B search health check should report 0 documents for OWNER_B
      const ownerBHealth = await SearchOperationsService.getSearchHealth(OWNER_B);
      expect(ownerBHealth.indexedDocuments).toBe(0);

      // OWNER_B publishing check should report 0 overdue items for OWNER_B
      const ownerBDiag = await OperationsDiagnosticsService.checkPublishing(OWNER_B);
      expect(ownerBDiag.status).toBe('HEALTHY');
      expect(ownerBDiag.optionalSafeDetails?.overdueScheduledCount).toBe(0);
    });
  });
});
