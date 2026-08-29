import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { db } from '@/db/client';
import {
  projects,
  projectCaseStudies,
  articles,
  notes,
  adrs,
  journalEntries,
  organizations,
  careerExperiences,
  skills,
  domains,
  technologies,
  certificates,
  certificateSkills,
  projectSkills,
  nowEntries,
  profiles,
} from '@/db/schema';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { sanitizePublicUrl } from '@/lib/security';
import { getPublicRouteForEntity } from '@/domain/publishing/public-routes';
import { eq } from 'drizzle-orm';
import nextConfig from '../../../next.config.mjs';

describe('Phase 10: Route & E2E Verification & Privacy Matrix', () => {
  const testOwnerId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  const testOrgId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaa99';

  async function cleanTestData() {
    await db.delete(projects).where(eq(projects.ownerId, testOwnerId));
    await db.delete(articles).where(eq(articles.ownerId, testOwnerId));
    await db.delete(notes).where(eq(notes.ownerId, testOwnerId));
    await db.delete(adrs).where(eq(adrs.ownerId, testOwnerId));
    await db.delete(journalEntries).where(eq(journalEntries.ownerId, testOwnerId));
  }

  beforeAll(async () => {
    // 1. Ensure Profile
    const existingProfile = await db.query.profiles.findFirst();
    if (!existingProfile) {
      await db.insert(profiles).values({
        id: '99999999-9999-4999-a999-999999999999',
        ownerId: testOwnerId,
        fullName: 'Khalid Jundullah',
        username: 'harinzu47',
        headline: 'Network & Systems Engineer',
        bio: 'Designing high-reliability distributed systems.',
        location: 'Jakarta, Indonesia',
        emailPublic: 'harinzu47@gmail.com',
      }).onConflictDoNothing();
    }

    // 2. Ensure Organization
    await db.insert(organizations).values({
      id: testOrgId,
      ownerId: testOwnerId,
      name: 'E2E Test Corp',
      slug: 'e2e-test-corp',
      visibility: 'public',
    }).onConflictDoNothing();

    await cleanTestData();
  });

  beforeEach(async () => {
    await cleanTestData();
  });

  // =========================================================================
  // 1. Primary Canonical Routes Resolution
  // =========================================================================
  describe('Canonical Routes Resolution', () => {
    it('resolves Home (/) composed read model with expected data structures', async () => {
      const home = await PublicReadModelsService.getHomePublic();
      expect(home).toBeDefined();
      expect(home.hero.fullName).toBe('Khalid Jundullah');
      expect(Array.isArray(home.featuredProjects)).toBe(true);
      expect(Array.isArray(home.currentNow)).toBe(true);
      expect(Array.isArray(home.selectedKnowledge)).toBe(true);
      expect(Array.isArray(home.topCapabilities)).toBe(true);
    });

    it('resolves Work (/work) index with public projects', async () => {
      const work = await PublicReadModelsService.getWorkIndex();
      expect(Array.isArray(work)).toBe(true);
      for (const item of work) {
        expect(item.slug).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.status).toBeDefined();
      }
    });

    it('resolves Experience (/experience) timeline in deterministic order', async () => {
      const exp = await PublicReadModelsService.getExperienceTimeline();
      expect(Array.isArray(exp.experiences)).toBe(true);
      expect(exp.totalPositions).toBe(exp.experiences.length);
    });

    it('resolves Expertise (/expertise) capability matrix', async () => {
      const expertise = await PublicReadModelsService.getExpertiseReadModel();
      expect(Array.isArray(expertise.domains)).toBe(true);
      expect(Array.isArray(expertise.technologies)).toBe(true);
      expect(Array.isArray(expertise.skills)).toBe(true);
    });

    it('resolves Knowledge Hub (/system) with filtered and unfiltered queries', async () => {
      const allKnowledge = await PublicReadModelsService.getKnowledgeHub();
      expect(Array.isArray(allKnowledge)).toBe(true);

      const articlesOnly = await PublicReadModelsService.getKnowledgeHub({ type: 'ARTICLE' });
      expect(articlesOnly.every((i) => i.entityType === 'ARTICLE')).toBe(true);

      const notesOnly = await PublicReadModelsService.getKnowledgeHub({ type: 'TECH_NOTE' });
      expect(notesOnly.every((i) => i.entityType === 'TECH_NOTE')).toBe(true);

      const adrsOnly = await PublicReadModelsService.getKnowledgeHub({ type: 'ADR' });
      expect(adrsOnly.every((i) => i.entityType === 'ADR')).toBe(true);

      const journalOnly = await PublicReadModelsService.getKnowledgeHub({ type: 'JOURNAL_ENTRY' });
      expect(journalOnly.every((i) => i.entityType === 'JOURNAL_ENTRY')).toBe(true);
    });

    it('resolves Now (/now) active attention and bounded recent context', async () => {
      const now = await PublicReadModelsService.getNowPublic();
      expect(Array.isArray(now.activeEntries)).toBe(true);
      expect(Array.isArray(now.recentCompletedEntries)).toBe(true);
      expect(now.recentCompletedEntries.length).toBeLessThanOrEqual(5);
    });

    it('resolves About (/about) profile projection', async () => {
      const about = await PublicReadModelsService.getAboutPublic();
      expect(about.profile.fullName).toBe('Khalid Jundullah');
      expect(about.principles.length).toBeGreaterThan(0);
      expect(about.workingStyle.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 2. Legacy Route Redirects (1-Hop Validation)
  // =========================================================================
  describe('Legacy Route Redirects Audit (Amendment 1, 2, 26, 35)', () => {
    it('verifies next.config.mjs contains all 9 permanent one-hop redirects', async () => {
      const redirects = await (nextConfig as any).redirects();
      expect(Array.isArray(redirects)).toBe(true);

      const redirectMap = new Map<string, string>();
      for (const r of redirects) {
        redirectMap.set(r.source, r.destination);
        expect(r.permanent).toBe(true);
      }

      // 1. /projects -> /work
      expect(redirectMap.get('/projects')).toBe('/work');
      expect(redirectMap.get('/projects/:slug')).toBe('/work/:slug');

      // 2. /articles -> /system?type=ARTICLE
      expect(redirectMap.get('/articles')).toBe('/system?type=ARTICLE');

      // 3. /notes -> /system?type=TECH_NOTE
      expect(redirectMap.get('/notes')).toBe('/system?type=TECH_NOTE');

      // 4. /journal -> /system?type=JOURNAL_ENTRY
      expect(redirectMap.get('/journal')).toBe('/system?type=JOURNAL_ENTRY');

      // 5. /certificates -> /expertise
      expect(redirectMap.get('/certificates')).toBe('/expertise');

      // 6. /roadmap -> /now
      expect(redirectMap.get('/roadmap')).toBe('/now');

      // 7. /graph -> /system
      expect(redirectMap.get('/graph')).toBe('/system');

      // 8. /terminal -> /about
      expect(redirectMap.get('/terminal')).toBe('/about');

      // Confirm no redirect chain: destinations are canonical routes
      const validCanonicalRoots = ['/work', '/expertise', '/experience', '/system', '/now', '/about'];
      for (const dest of redirectMap.values()) {
        const destPath = dest.split('?')[0].replace('/:slug', '');
        expect(validCanonicalRoots).toContain(destPath);
      }
    });
  });

  // =========================================================================
  // 3. Direct Route vs Discovery Privacy Matrix (Amendments 16, 17, 27)
  // =========================================================================
  describe('Direct Route vs Discovery Privacy Matrix', () => {
    it('PROJECT: PRIVATE returns null, DRAFT returns null, UNLISTED returns detail with isUnlisted=true', async () => {
      const privSlug = 'e2e-priv-proj';
      const draftSlug = 'e2e-draft-proj';
      const unlistedSlug = 'e2e-unlisted-proj';

      await db.insert(projects).values([
        {
          ownerId: testOwnerId,
          title: 'Private Project',
          slug: privSlug,
          visibility: 'private',
          publicationStatus: 'published',
          status: 'completed',
        },
        {
          ownerId: testOwnerId,
          title: 'Draft Project',
          slug: draftSlug,
          visibility: 'public',
          publicationStatus: 'draft',
          status: 'active',
        },
        {
          ownerId: testOwnerId,
          title: 'Unlisted Project',
          slug: unlistedSlug,
          visibility: 'unlisted',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 5000),
          status: 'completed',
        },
      ]);

      // 1. Direct slug access
      expect(await PublicReadModelsService.getProjectDetailBySlug(privSlug)).toBeNull();
      expect(await PublicReadModelsService.getProjectDetailBySlug(draftSlug)).toBeNull();

      const unlisted = await PublicReadModelsService.getProjectDetailBySlug(unlistedSlug);
      expect(unlisted).not.toBeNull();
      expect(unlisted?.isUnlisted).toBe(true);

      // 2. Listing discovery check (/work)
      const workListing = await PublicReadModelsService.getWorkIndex();
      const listingSlugs = workListing.map((w) => w.slug);
      expect(listingSlugs).not.toContain(privSlug);
      expect(listingSlugs).not.toContain(draftSlug);
      expect(listingSlugs).not.toContain(unlistedSlug);
    });

    it('ARTICLE: PRIVATE returns null, DRAFT returns null, UNLISTED returns detail with isUnlisted=true', async () => {
      const privSlug = 'e2e-priv-art';
      const draftSlug = 'e2e-draft-art';
      const unlistedSlug = 'e2e-unlisted-art';

      await db.insert(articles).values([
        {
          ownerId: testOwnerId,
          title: 'Private Article',
          slug: privSlug,
          content: 'Secret content',
          visibility: 'private',
          publicationStatus: 'published',
        },
        {
          ownerId: testOwnerId,
          title: 'Draft Article',
          slug: draftSlug,
          content: 'Draft content',
          visibility: 'public',
          publicationStatus: 'draft',
        },
        {
          ownerId: testOwnerId,
          title: 'Unlisted Article',
          slug: unlistedSlug,
          content: 'Unlisted direct content',
          visibility: 'unlisted',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 5000),
        },
      ]);

      // Direct access
      expect(await PublicReadModelsService.getArticleBySlug(privSlug)).toBeNull();
      expect(await PublicReadModelsService.getArticleBySlug(draftSlug)).toBeNull();

      const unlisted = await PublicReadModelsService.getArticleBySlug(unlistedSlug);
      expect(unlisted).not.toBeNull();
      expect(unlisted?.isUnlisted).toBe(true);

      // Discovery check (/system)
      const hubItems = await PublicReadModelsService.getKnowledgeHub();
      const hubSlugs = hubItems.map((h) => h.slug);
      expect(hubSlugs).not.toContain(privSlug);
      expect(hubSlugs).not.toContain(draftSlug);
      expect(hubSlugs).not.toContain(unlistedSlug);
    });

    it('TECH_NOTE: PRIVATE returns null, DRAFT returns null, UNLISTED returns detail with isUnlisted=true', async () => {
      const privSlug = 'e2e-priv-note';
      const draftSlug = 'e2e-draft-note';
      const unlistedSlug = 'e2e-unlisted-note';

      await db.insert(notes).values([
        {
          ownerId: testOwnerId,
          title: 'Private Note',
          slug: privSlug,
          content: 'Secret note content',
          visibility: 'private',
          publicationStatus: 'published',
        },
        {
          ownerId: testOwnerId,
          title: 'Draft Note',
          slug: draftSlug,
          content: 'Draft note content',
          visibility: 'public',
          publicationStatus: 'draft',
        },
        {
          ownerId: testOwnerId,
          title: 'Unlisted Note',
          slug: unlistedSlug,
          content: 'Unlisted note content',
          visibility: 'unlisted',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 5000),
        },
      ]);

      expect(await PublicReadModelsService.getNoteBySlug(privSlug)).toBeNull();
      expect(await PublicReadModelsService.getNoteBySlug(draftSlug)).toBeNull();

      const unlisted = await PublicReadModelsService.getNoteBySlug(unlistedSlug);
      expect(unlisted).not.toBeNull();
      expect(unlisted?.isUnlisted).toBe(true);

      // Discovery check
      const hubItems = await PublicReadModelsService.getKnowledgeHub();
      const hubSlugs = hubItems.map((h) => h.slug);
      expect(hubSlugs).not.toContain(privSlug);
      expect(hubSlugs).not.toContain(draftSlug);
      expect(hubSlugs).not.toContain(unlistedSlug);
    });

    it('ADR: PRIVATE returns null, DRAFT returns null, UNLISTED returns detail with isUnlisted=true', async () => {
      const privSlug = 'e2e-priv-adr';
      const draftSlug = 'e2e-draft-adr';
      const unlistedSlug = 'e2e-unlisted-adr';

      await db.insert(adrs).values([
        {
          ownerId: testOwnerId,
          title: 'Private ADR',
          slug: privSlug,
          decision: 'Secret decision',
          visibility: 'private',
          publicationStatus: 'published',
        },
        {
          ownerId: testOwnerId,
          title: 'Draft ADR',
          slug: draftSlug,
          decision: 'Draft decision',
          visibility: 'public',
          publicationStatus: 'draft',
        },
        {
          ownerId: testOwnerId,
          title: 'Unlisted ADR',
          slug: unlistedSlug,
          decision: 'Unlisted decision',
          visibility: 'unlisted',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 5000),
        },
      ]);

      expect(await PublicReadModelsService.getAdrBySlug(privSlug)).toBeNull();
      expect(await PublicReadModelsService.getAdrBySlug(draftSlug)).toBeNull();

      const unlisted = await PublicReadModelsService.getAdrBySlug(unlistedSlug);
      expect(unlisted).not.toBeNull();
      expect(unlisted?.isUnlisted).toBe(true);

      // Discovery check
      const hubItems = await PublicReadModelsService.getKnowledgeHub();
      const hubSlugs = hubItems.map((h) => h.slug);
      expect(hubSlugs).not.toContain(privSlug);
      expect(hubSlugs).not.toContain(draftSlug);
      expect(hubSlugs).not.toContain(unlistedSlug);
    });

    it('JOURNAL: PRIVATE returns null, DRAFT returns null, UNLISTED returns detail with isUnlisted=true', async () => {
      const privSlug = 'e2e-priv-journal';
      const draftSlug = 'e2e-draft-journal';
      const unlistedSlug = 'e2e-unlisted-journal';

      await db.insert(journalEntries).values([
        {
          ownerId: testOwnerId,
          title: 'Private Log',
          slug: privSlug,
          content: 'Secret log content',
          visibility: 'private',
          publicationStatus: 'published',
        },
        {
          ownerId: testOwnerId,
          title: 'Draft Log',
          slug: draftSlug,
          content: 'Draft log content',
          visibility: 'public',
          publicationStatus: 'draft',
        },
        {
          ownerId: testOwnerId,
          title: 'Unlisted Log',
          slug: unlistedSlug,
          content: 'Unlisted log content',
          visibility: 'unlisted',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 5000),
        },
      ]);

      expect(await PublicReadModelsService.getJournalBySlug(privSlug)).toBeNull();
      expect(await PublicReadModelsService.getJournalBySlug(draftSlug)).toBeNull();

      const unlisted = await PublicReadModelsService.getJournalBySlug(unlistedSlug);
      expect(unlisted).not.toBeNull();
      expect(unlisted?.isUnlisted).toBe(true);

      // Discovery check
      const hubItems = await PublicReadModelsService.getKnowledgeHub();
      const hubSlugs = hubItems.map((h) => h.slug);
      expect(hubSlugs).not.toContain(privSlug);
      expect(hubSlugs).not.toContain(draftSlug);
      expect(hubSlugs).not.toContain(unlistedSlug);
    });
  });
});
