import { describe, it, expect, beforeAll } from 'vitest';
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
  knowledgeRelationships,
  relationshipTypes,
} from '@/db/schema';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { sanitizePublicUrl } from '@/lib/security';
import { eq } from 'drizzle-orm';

describe('Phase 10: Canonical Public Frontend Read Models & Privacy Invariants', () => {
  const testOwnerId = '11111111-1111-4111-a111-111111111111';
  const testOrgId = '11111111-1111-4111-a111-111111111199';

  beforeAll(async () => {
    // Seed test profile if needed
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

    // Seed test organization
    await db.insert(organizations).values({
      id: testOrgId,
      ownerId: testOwnerId,
      name: 'Test Engineering Corp',
      slug: 'test-eng-corp',
      visibility: 'public',
    }).onConflictDoNothing();
  });

  // =========================================================================
  // 1. Safe URL Sanitization (Amendment 6)
  // =========================================================================
  describe('Safe URL Sanitization (Amendment 6)', () => {
    it('allows valid https, http, mailto, and relative URLs', () => {
      expect(sanitizePublicUrl('https://github.com/Harinzu47')).toBe('https://github.com/Harinzu47');
      expect(sanitizePublicUrl('http://example.com/demo')).toBe('http://example.com/demo');
      expect(sanitizePublicUrl('mailto:harinzu47@gmail.com')).toBe('mailto:harinzu47@gmail.com');
      expect(sanitizePublicUrl('/work/my-project')).toBe('/work/my-project');
    });

    it('rejects unsafe schemes like javascript:, data:, vbscript:', () => {
      expect(sanitizePublicUrl('javascript:alert("XSS")')).toBeNull();
      expect(sanitizePublicUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBeNull();
      expect(sanitizePublicUrl('vbscript:msgbox("hello")')).toBeNull();
      expect(sanitizePublicUrl('//malicious-domain.com')).toBeNull();
      expect(sanitizePublicUrl('')).toBeNull();
      expect(sanitizePublicUrl(null)).toBeNull();
    });
  });

  // =========================================================================
  // 2. Work Read Model (/work and /work/[slug])
  // =========================================================================
  describe('Work Read Models & Privacy (Amendments 4, 5, 16, 25, 34)', () => {
    it('excludes PRIVATE, DRAFT, and UNLISTED projects from /work archive', async () => {
      const pubId = '22222222-2222-4222-a222-222222222201';
      const unlistedId = '22222222-2222-4222-a222-222222222202';
      const draftId = '22222222-2222-4222-a222-222222222203';
      const privateId = '22222222-2222-4222-a222-222222222204';

      await db.insert(projects).values([
        {
          id: pubId,
          ownerId: testOwnerId,
          title: 'Public Infrastructure Cluster',
          slug: 'test-public-cluster',
          visibility: 'public',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 10000),
          status: 'completed',
        },
        {
          id: unlistedId,
          ownerId: testOwnerId,
          title: 'Unlisted Tool',
          slug: 'test-unlisted-tool',
          visibility: 'unlisted',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 10000),
          status: 'completed',
        },
        {
          id: draftId,
          ownerId: testOwnerId,
          title: 'Draft Project',
          slug: 'test-draft-project',
          visibility: 'public',
          publicationStatus: 'draft',
          status: 'active',
        },
        {
          id: privateId,
          ownerId: testOwnerId,
          title: 'Private System',
          slug: 'test-private-system',
          visibility: 'private',
          publicationStatus: 'published',
          status: 'completed',
        },
      ]).onConflictDoNothing();

      const workIndex = await PublicReadModelsService.getWorkIndex();
      const slugs = workIndex.map((w) => w.slug);

      expect(slugs).toContain('test-public-cluster');
      expect(slugs).not.toContain('test-unlisted-tool');
      expect(slugs).not.toContain('test-draft-project');
      expect(slugs).not.toContain('test-private-system');

      // Cleanup
      await db.delete(projects).where(eq(projects.ownerId, testOwnerId));
    });

    it('resolves UNLISTED project on direct slug route but returns notFound (null) for PRIVATE or DRAFT', async () => {
      const unlistedId = '33333333-3333-4333-a333-333333333301';
      const draftId = '33333333-3333-4333-a333-333333333302';

      await db.insert(projects).values([
        {
          id: unlistedId,
          ownerId: testOwnerId,
          title: 'Direct Access Project',
          slug: 'direct-access-project',
          visibility: 'unlisted',
          publicationStatus: 'published',
          publishedAt: new Date(Date.now() - 10000),
          status: 'completed',
        },
        {
          id: draftId,
          ownerId: testOwnerId,
          title: 'Unpublished Draft',
          slug: 'unpublished-draft',
          visibility: 'unlisted',
          publicationStatus: 'draft',
          status: 'active',
        },
      ]).onConflictDoNothing();

      const unlistedDetail = await PublicReadModelsService.getProjectDetailBySlug('direct-access-project');
      expect(unlistedDetail).not.toBeNull();
      expect(unlistedDetail?.slug).toBe('direct-access-project');
      expect(unlistedDetail?.isUnlisted).toBe(true);

      const draftDetail = await PublicReadModelsService.getProjectDetailBySlug('unpublished-draft');
      expect(draftDetail).toBeNull();

      const nonexistentDetail = await PublicReadModelsService.getProjectDetailBySlug('non-existent-slug');
      expect(nonexistentDetail).toBeNull();

      // Cleanup
      await db.delete(projects).where(eq(projects.ownerId, testOwnerId));
    });

    it('omits ProjectCaseStudy if parent Project is PRIVATE (Parent Dependency Invariant)', async () => {
      const privProjectId = '44444444-4444-4444-a444-444444444401';
      const caseStudyId = '44444444-4444-4444-a444-444444444402';

      await db.insert(projects).values({
        id: privProjectId,
        ownerId: testOwnerId,
        title: 'Secret Internal Core',
        slug: 'secret-internal-core',
        visibility: 'private',
        publicationStatus: 'published',
        status: 'completed',
      }).onConflictDoNothing();

      await db.insert(projectCaseStudies).values({
        id: caseStudyId,
        ownerId: testOwnerId,
        projectId: privProjectId,
        title: 'Published Narrative for Secret Project',
        visibility: 'public',
        publicationStatus: 'published',
      }).onConflictDoNothing();

      // Querying private project slug should return null
      const detail = await PublicReadModelsService.getProjectDetailBySlug('secret-internal-core');
      expect(detail).toBeNull();

      // Cleanup
      await db.delete(projectCaseStudies).where(eq(projectCaseStudies.id, caseStudyId));
      await db.delete(projects).where(eq(projects.id, privProjectId));
    });
  });

  // =========================================================================
  // 3. Experience Read Model (/experience)
  // =========================================================================
  describe('Experience Read Model (Amendments 10, 12)', () => {
    it('returns public experiences in deterministic chronological order', async () => {
      const exp1Id = '55555555-5555-4555-a555-555555555501';
      const exp2Id = '55555555-5555-4555-a555-555555555502';

      await db.insert(careerExperiences).values([
        {
          id: exp1Id,
          ownerId: testOwnerId,
          organizationId: testOrgId,
          position: 'Infrastructure Engineer',
          startDate: '2022-01-01',
          endDate: '2023-12-31',
          isCurrent: false,
          visibility: 'public',
          publicationStatus: 'published',
        },
        {
          id: exp2Id,
          ownerId: testOwnerId,
          organizationId: testOrgId,
          position: 'Lead Systems Architect',
          startDate: '2024-01-01',
          isCurrent: true,
          visibility: 'public',
          publicationStatus: 'published',
        },
      ]).onConflictDoNothing();

      const timeline = await PublicReadModelsService.getExperienceTimeline();
      expect(timeline.experiences.length).toBeGreaterThanOrEqual(2);

      // Lead Systems Architect (2024) should come before Infrastructure Engineer (2022)
      const leadIdx = timeline.experiences.findIndex((e) => e.role === 'Lead Systems Architect');
      const infraIdx = timeline.experiences.findIndex((e) => e.role === 'Infrastructure Engineer');
      expect(leadIdx).toBeLessThan(infraIdx);

      // Cleanup
      await db.delete(careerExperiences).where(eq(careerExperiences.ownerId, testOwnerId));
    });
  });

  // =========================================================================
  // 4. Expertise Evidence Engine (Amendments 7, 8, 9)
  // =========================================================================
  describe('Expertise Evidence Engine (Amendments 7, 8, 9)', () => {
    it('includes a skill ONLY when it has qualifying public evidence; certificate alone does not qualify', async () => {
      const skillWithProject = '66666666-6666-4666-a666-666666666601';
      const skillWithCertOnly = '66666666-6666-4666-a666-666666666602';
      const testProjId = '66666666-6666-4666-a666-666666666603';
      const testCertId = '66666666-6666-4666-a666-666666666604';

      await db.insert(skills).values([
        {
          id: skillWithProject,
          ownerId: testOwnerId,
          name: 'Kubernetes Cluster Administration',
          slug: 'k8s-admin',
          visibility: 'public',
        },
        {
          id: skillWithCertOnly,
          ownerId: testOwnerId,
          name: 'Theoretical Quantum Computing',
          slug: 'theoretical-qc',
          visibility: 'public',
        },
      ]).onConflictDoNothing();

      // Link skill 1 to a public published project
      await db.insert(projects).values({
        id: testProjId,
        ownerId: testOwnerId,
        title: 'Kubernetes Edge Grid',
        slug: 'k8s-edge-grid',
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(Date.now() - 10000),
        status: 'completed',
      }).onConflictDoNothing();

      await db.insert(projectSkills).values({
        projectId: testProjId,
        skillId: skillWithProject,
      }).onConflictDoNothing();

      // Link skill 2 ONLY to a certificate (no projects, no experience, no knowledge)
      await db.insert(certificates).values({
        id: testCertId,
        ownerId: testOwnerId,
        name: 'Quantum Foundations Cert',
        issuer: 'IBM',
        issuedAt: '2024-01-01',
        visibility: 'public',
        publicationStatus: 'published',
      }).onConflictDoNothing();

      await db.insert(certificateSkills).values({
        certificateId: testCertId,
        skillId: skillWithCertOnly,
      }).onConflictDoNothing();

      const expertise = await PublicReadModelsService.getExpertiseReadModel();
      const skillSlugs = expertise.skills.map((s) => s.slug);

      // Skill with project evidence appears
      expect(skillSlugs).toContain('k8s-admin');
      const k8sSkill = expertise.skills.find((s) => s.slug === 'k8s-admin');
      expect(k8sSkill?.evidenceCount.projects).toBeGreaterThanOrEqual(1);

      // Skill with certificate alone MUST NOT establish expertise (Amendment 8)
      expect(skillSlugs).not.toContain('theoretical-qc');

      // Cleanup
      await db.delete(projectSkills).where(eq(projectSkills.projectId, testProjId));
      await db.delete(certificateSkills).where(eq(certificateSkills.certificateId, testCertId));
      await db.delete(certificates).where(eq(certificates.id, testCertId));
      await db.delete(projects).where(eq(projects.id, testProjId));
      await db.delete(skills).where(eq(skills.ownerId, testOwnerId));
    });
  });

  // =========================================================================
  // 5. Zero-Leak Negative Tests (Amendment 5, 22)
  // =========================================================================
  describe('Zero-Leak Negative DTO Tests (Amendment 5, 22)', () => {
    it('verifies that no internal database columns leak to public DTOs', async () => {
      const projId = '77777777-7777-4777-a777-777777777701';

      await db.insert(projects).values({
        id: projId,
        ownerId: testOwnerId,
        title: 'Zero Leak Check System',
        slug: 'zero-leak-check',
        visibility: 'public',
        publicationStatus: 'published',
        publishedAt: new Date(Date.now() - 10000),
        status: 'completed',
        shortDescription: 'Verifying zero leaks.',
      }).onConflictDoNothing();

      const workItems = await PublicReadModelsService.getWorkIndex({ search: 'Zero Leak Check' });
      const item = workItems.find((w) => w.slug === 'zero-leak-check');

      expect(item).toBeDefined();
      // Verify forbidden keys do not exist
      expect((item as any).id).toBeUndefined();
      expect((item as any).ownerId).toBeUndefined();
      expect((item as any).owner_id).toBeUndefined();
      expect((item as any).searchVector).toBeUndefined();
      expect((item as any).search_vector).toBeUndefined();
      expect((item as any).createdAt).toBeUndefined();
      expect((item as any).updatedAt).toBeUndefined();

      const detail = await PublicReadModelsService.getProjectDetailBySlug('zero-leak-check');
      expect(detail).toBeDefined();
      expect((detail as any).id).toBeUndefined();
      expect((detail as any).ownerId).toBeUndefined();
      expect((detail as any).owner_id).toBeUndefined();
      expect((detail as any).searchVector).toBeUndefined();

      // Cleanup
      await db.delete(projects).where(eq(projects.id, projId));
    });
  });
});
