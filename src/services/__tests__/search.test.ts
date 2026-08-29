import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/client';
import {
  articles,
  notes,
  projects,
  projectCaseStudies,
  skills,
  technologies,
  searchDocuments,
} from '@/db/schema';
import { SearchService } from '../search.service';
import { SearchSyncService } from '../search-sync.service';
import { SearchOperationsService } from '../search-operations.service';
import { PublicSearchService } from '../public-search.service';
import { OwnerSearchService } from '../owner-search.service';
import { extractExactTerms, isKnownTechnicalToken } from '@/domain/search/query-normalizer';
import { eq, and } from 'drizzle-orm';

const OWNER_A_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const OWNER_B_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';

describe('Phase 9 — Canonical Search Engine & Discovery Pipeline', () => {
  beforeEach(async () => {
    // Clean up test search documents
    await db.delete(searchDocuments);
  });

  // 1. Technical Tokens & Exact Terms (Amendments 13, 14)
  describe('1. Technical Token Extraction & Exact Terms', () => {
    it('recognizes canonical technical tokens', () => {
      expect(isKnownTechnicalToken('c++')).toBe(true);
      expect(isKnownTechnicalToken('next.js')).toBe(true);
      expect(isKnownTechnicalToken('ci/cd')).toBe(true);
      expect(isKnownTechnicalToken('postgresql')).toBe(true);
      expect(isKnownTechnicalToken('.net')).toBe(true);
      expect(isKnownTechnicalToken('random_word')).toBe(false);
    });

    it('extracts technical terms from title, summary, and linked taxonomy', () => {
      const terms = extractExactTerms(
        'Building High-Performance Services with C++ and Next.js',
        'Deep-dive into CI/CD pipelines and PostgreSQL RLS policies.',
        {
          technologies: ['PostgreSQL', 'Docker'],
          skills: ['Database Architecture'],
          domains: ['Backend Systems'],
          tags: ['performance'],
        }
      );

      expect(terms).toContain('c++');
      expect(terms).toContain('next.js');
      expect(terms).toContain('ci/cd');
      expect(terms).toContain('postgresql');
      expect(terms).toContain('rls');
      expect(terms).toContain('docker');
      expect(terms).toContain('database architecture');
    });
  });

  // 2. Retrieval, Ranking & Technical Token Channel (Amendments 13, 14, 15, 16)
  describe('2. Multi-Channel Retrieval & Deterministic Ranking', () => {
    it('boosts exact technical token matches in search results', async () => {
      // Create test document with C++ in exact_terms
      await SearchService.upsertDocument({
        ownerId: OWNER_A_ID,
        entityType: 'TECH_NOTE',
        entityId: '11111111-1111-4111-8111-111111111111',
        title: 'Memory Management in C++',
        slug: 'memory-management-cpp',
        summary: 'Low-level memory pointers and allocators in C++',
        bodyText: 'Details about RAII and smart pointers',
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(Date.now() - 10000),
        archivedAt: null,
        sourceUpdatedAt: new Date(),
        projectionVersion: 1,
        taxonomy: { domains: [], technologies: ['C++'], skills: [], tags: [] },
        exactTerms: ['c++', 'raii'],
      });

      // Search for "c++"
      const result = await OwnerSearchService.global(OWNER_A_ID, { query: 'c++' });
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].entity.title).toBe('Memory Management in C++');
    });

    it('ranks Knowledge content higher in KNOWLEDGE mode and Work content in WORK mode', async () => {
      // 1. Create a Tech Note about PostgreSQL
      await SearchService.upsertDocument({
        ownerId: OWNER_A_ID,
        entityType: 'TECH_NOTE',
        entityId: '22222222-2222-4222-8222-222222222222',
        title: 'PostgreSQL Connection Pooling Guide',
        slug: 'pg-pooling',
        summary: 'Optimizing PgBouncer for high concurrency in PostgreSQL',
        bodyText: 'Transaction pooling vs session pooling',
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(Date.now() - 20000),
        archivedAt: null,
        sourceUpdatedAt: new Date(),
        projectionVersion: 1,
        taxonomy: { domains: [], technologies: ['PostgreSQL'], skills: [], tags: [] },
        exactTerms: ['postgresql'],
      });

      // 2. Create a Project about PostgreSQL
      await SearchService.upsertDocument({
        ownerId: OWNER_A_ID,
        entityType: 'PROJECT',
        entityId: '33333333-3333-4333-8333-333333333333',
        title: 'PostgreSQL Metrics Dashboard',
        slug: 'pg-dashboard',
        summary: 'Real-time telemetry dashboard for PostgreSQL databases',
        bodyText: 'Observability agent and charting engine',
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(Date.now() - 10000),
        archivedAt: null,
        sourceUpdatedAt: new Date(),
        projectionVersion: 1,
        taxonomy: { domains: [], technologies: ['PostgreSQL'], skills: [], tags: [] },
        exactTerms: ['postgresql'],
      });

      // Test Knowledge Mode (Should return Tech Note)
      const rawCandidatesKnowledge = await SearchService.searchCandidates({
        query: 'postgresql',
        scope: 'OWNER',
        ownerId: OWNER_A_ID,
        allowedEntityTypes: ['TECH_NOTE', 'ARTICLE', 'ADR', 'JOURNAL_ENTRY'],
      });
      expect(rawCandidatesKnowledge.length).toBe(1);
      expect(rawCandidatesKnowledge[0].entityType).toBe('TECH_NOTE');

      // Test Work Mode (Should return Project)
      const rawCandidatesWork = await SearchService.searchCandidates({
        query: 'postgresql',
        scope: 'OWNER',
        ownerId: OWNER_A_ID,
        allowedEntityTypes: ['PROJECT', 'PROJECT_CASE_STUDY', 'EXPERIENCE'],
      });
      expect(rawCandidatesWork.length).toBe(1);
      expect(rawCandidatesWork[0].entityType).toBe('PROJECT');
    });
  });

  // 3. FAIL-CLOSED Public Revalidation & Stale-Index Adversarial Test (Amendments 5, 6, 7, 39)
  describe('3. Privacy Boundary & Stale-Index Fail-Closed Security', () => {
    it('discards stale public projection when canonical database entity is PRIVATE (Amendment 39)', async () => {
      // 1. Create a canonical article in database with visibility = 'private'
      const [article] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Secret Internal Architectural Flaws',
          slug: `secret-flaws-${Date.now()}`,
          excerpt: 'Unpublished confidential technical review.',
          content: 'Confidential vulnerability details.',
          visibility: 'private', // PRIVATE in source of truth!
          status: 'published',
          publishedAt: new Date(Date.now() - 50000),
        })
        .returning();

      // 2. Adversarial scenario: Stale search projection says it is 'public'
      await SearchService.upsertDocument({
        ownerId: OWNER_A_ID,
        entityType: 'ARTICLE',
        entityId: article.id,
        title: 'Secret Internal Architectural Flaws',
        slug: article.slug,
        summary: article.excerpt,
        bodyText: article.content,
        visibility: 'public', // Stale projection claims public!
        publicationStatus: 'published',
        publishedAt: article.publishedAt,
        archivedAt: null,
        sourceUpdatedAt: new Date(),
        projectionVersion: 1,
        taxonomy: null,
        exactTerms: ['secret'],
      });

      // 3. Public search executes
      const publicResult = await PublicSearchService.searchKnowledge({
        q: 'Secret Internal Architectural Flaws',
      });

      // 4. Expected: ZERO results due to Fail-Closed Canonical Revalidation!
      expect(publicResult.items.length).toBe(0);

      // Cleanup
      await db.delete(articles).where(eq(articles.id, article.id));
    });

    it('discards Project Case Study if parent Project is PRIVATE (Amendment 5, 40)', async () => {
      // 1. Create a PRIVATE project
      const [project] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Classified Defense System',
          slug: `defense-sys-${Date.now()}`,
          shortDescription: 'Internal classified system',
          description: 'Classified details',
          visibility: 'private', // Parent is private!
          status: 'completed',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 50000),
        })
        .returning();

      // 2. Create a Case Study for this project
      const [caseStudy] = await db
        .insert(projectCaseStudies)
        .values({
          projectId: project.id,
          ownerId: OWNER_A_ID,
          title: 'Case Study: Scalability in Classified Defense System',
          executiveSummary: 'Scaling to 10M events per second',
          publicationStatus: 'published',
        })
        .returning();

      // 3. Search projection exists for Case Study
      await SearchService.upsertDocument({
        ownerId: OWNER_A_ID,
        entityType: 'PROJECT_CASE_STUDY',
        entityId: caseStudy.id,
        title: caseStudy.title || 'Case Study',
        slug: project.slug,
        summary: caseStudy.executiveSummary,
        bodyText: 'High throughput architecture',
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(Date.now() - 50000),
        archivedAt: null,
        sourceUpdatedAt: new Date(),
        projectionVersion: 1,
        taxonomy: null,
        exactTerms: ['classified'],
      });

      // 4. Public search executes
      const publicResult = await PublicSearchService.searchWork({
        q: 'Classified Defense System',
      });

      // 5. Expected: ZERO results because parent Project is private!
      expect(publicResult.items.length).toBe(0);

      // Cleanup
      await db.delete(projectCaseStudies).where(eq(projectCaseStudies.id, caseStudy.id));
      await db.delete(projects).where(eq(projects.id, project.id));
    });

    it('excludes UNLISTED entities from public search discovery (Amendment 38)', async () => {
      // 1. Create an UNLISTED article in database
      const [article] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Direct Link Only Security Guide',
          slug: `direct-only-${Date.now()}`,
          excerpt: 'This guide is only accessible via direct link.',
          content: 'Unlisted direct guide content.',
          visibility: 'unlisted', // UNLISTED!
          status: 'published',
          publishedAt: new Date(Date.now() - 50000),
        })
        .returning();

      // Sync projection
      await SearchSyncService.syncArticle(article.id);

      // 2. Public search executes
      const publicResult = await PublicSearchService.searchKnowledge({
        q: 'Direct Link Only Security Guide',
      });

      // 3. Expected: Excluded from public discovery!
      expect(publicResult.items.length).toBe(0);

      // 4. Owner global search CAN find it
      const ownerResult = await OwnerSearchService.global(OWNER_A_ID, {
        query: 'Direct Link Only Security Guide',
      });
      expect(ownerResult.items.length).toBe(1);
      expect(ownerResult.items[0].entity.id).toBe(article.id);

      // Cleanup
      await db.delete(articles).where(eq(articles.id, article.id));
    });
  });

  // 4. Owner Isolation & Entity Pickers (Amendments 26, 27, 28)
  describe('4. Owner Isolation & Entity Pickers', () => {
    it('prevents OWNER_B from discovering OWNER_A entities in picker (Amendment 28)', async () => {
      // 1. Create a technology belonging to OWNER_A
      await SearchService.upsertDocument({
        ownerId: OWNER_A_ID,
        entityType: 'TECHNOLOGY',
        entityId: '44444444-4444-4444-8444-444444444444',
        title: 'Proprietary Core Protocol',
        slug: 'proprietary-proto',
        summary: 'Proprietary network protocol',
        bodyText: null,
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(),
        archivedAt: null,
        sourceUpdatedAt: new Date(),
        projectionVersion: 1,
        taxonomy: null,
        exactTerms: ['protocol'],
      });

      // 2. OWNER_B searches in Entity Picker
      const pickerResultsB = await OwnerSearchService.entityPicker(OWNER_B_ID, {
        entityTypes: ['TECHNOLOGY'],
        query: 'Proprietary Core Protocol',
      });

      // 3. Expected: OWNER_B gets 0 results (strict owner workspace isolation!)
      expect(pickerResultsB.length).toBe(0);

      // 4. OWNER_A searches in Entity Picker
      const pickerResultsA = await OwnerSearchService.entityPicker(OWNER_A_ID, {
        entityTypes: ['TECHNOLOGY'],
        query: 'Proprietary Core Protocol',
      });
      expect(pickerResultsA.length).toBe(1);
      expect(pickerResultsA[0].entity.id).toBe('44444444-4444-4444-8444-444444444444');
    });

    it('enforces Phase 6 relationship compatibility in relationship target search (Amendment 27)', async () => {
      // PROJECT --USES--> TECHNOLOGY is compatible, but PROJECT --USES--> ARTICLE is prohibited
      await SearchService.upsertDocument({
        ownerId: OWNER_A_ID,
        entityType: 'ARTICLE',
        entityId: '55555555-5555-4555-8555-555555555555',
        title: 'Article About Distributed Databases',
        slug: 'dist-db',
        summary: 'Database design overview',
        bodyText: null,
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(),
        archivedAt: null,
        sourceUpdatedAt: new Date(),
        projectionVersion: 1,
        taxonomy: null,
        exactTerms: ['database'],
      });

      // Query relationship targets for PROJECT --ORIGINATED_FROM--> targets
      // ORIGINATED_FROM from PROJECT allows [EXPERIENCE, JOURNAL_ENTRY] but not ARTICLE
      const targets = await OwnerSearchService.relationshipTargets(OWNER_A_ID, {
        sourceType: 'PROJECT',
        sourceId: '66666666-6666-4666-8666-666666666666',
        relationshipTypeCode: 'ORIGINATED_FROM',
        query: 'Distributed Databases',
      });

      // Expected: ARTICLE is rejected because it is incompatible with ORIGINATED_FROM on PROJECT
      expect(targets.length).toBe(0);
    });
  });

  // 5. Sanitized Public DTO Leak Prevention (Amendment 41)
  describe('5. Sanitized DTO Negative Security Testing', () => {
    it('ensures zero internal fields leak in Public Search Result DTO (Amendment 41)', async () => {
      // Create public article in DB
      const [article] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Public Architecture Review',
          slug: `pub-arch-${Date.now()}`,
          excerpt: 'Open source architecture notes.',
          content: 'Full deep dive text with internal keywords.',
          visibility: 'public',
          status: 'published',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 50000),
        })
        .returning();

      await SearchSyncService.syncArticle(article.id);

      const publicResult = await PublicSearchService.searchKnowledge({
        q: 'Public Architecture Review',
      });

      expect(publicResult.items.length).toBe(1);
      const item = publicResult.items[0] as any;

      // Assert internal fields are undefined
      expect(item.ownerId).toBeUndefined();
      expect(item.bodyText).toBeUndefined();
      expect(item.body_text).toBeUndefined();
      expect(item.searchVector).toBeUndefined();
      expect(item.search_vector).toBeUndefined();
      expect(item.storagePath).toBeUndefined();
      expect(item.qualitySignals).toBeUndefined();

      // Assert safe public fields exist
      expect(item.entity.id).toBe(article.id);
      expect(item.entity.title).toBe('Public Architecture Review');
      expect(item.url).toBe(`/articles/${article.slug}`);

      // Cleanup
      await db.delete(articles).where(eq(articles.id, article.id));
    });
  });

  // 6. Idempotent Reindexing & Diagnostics (Amendments 22, 23, 24, 25)
  describe('6. Idempotent Corpus Reindexing & Diagnostics', () => {
    it('reindexes owner corpus and purges orphaned projections', async () => {
      // Create orphan search document (no matching entity)
      await SearchService.upsertDocument({
        ownerId: OWNER_A_ID,
        entityType: 'ARTICLE',
        entityId: '99999999-9999-4999-8999-999999999999', // Non-existent!
        title: 'Orphan Article Document',
        slug: 'orphan-article',
        summary: 'This has no canonical DB row',
        bodyText: null,
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(),
        archivedAt: null,
        sourceUpdatedAt: new Date(),
        projectionVersion: 1,
        taxonomy: null,
        exactTerms: ['orphan'],
      });

      // Run corpus reindex
      const reindexResult = await SearchOperationsService.reindexCorpus(OWNER_A_ID);
      expect(reindexResult.removed).toBeGreaterThanOrEqual(1);

      // Verify health diagnostics
      const health = await SearchOperationsService.getSearchHealth(OWNER_A_ID);
      expect(health.staleDocuments).toBe(0);
      expect(health.lastReindexAt).toBeDefined();
    });
  });
});
