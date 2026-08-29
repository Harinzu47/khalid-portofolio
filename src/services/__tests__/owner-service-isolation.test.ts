import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import {
  projects,
  skills,
  domains,
  organizations,
  careerExperiences,
  articles,
  journalEntries,
  notes,
  adrs,
  nowEntries,
  learningPaths,
  roadmapItems,
  certificates,
  relationshipTypes,
} from '@/db/schema';
import { ProjectsService } from '../projects.service';
import { TaxonomyService } from '../taxonomy.service';
import { CareerService } from '../career.service';
import { ArticlesService } from '../articles.service';
import { JournalService } from '../journal.service';
import { TechNoteService } from '../notes.service';
import { ADRService } from '../adrs.service';
import { NowService } from '../now.service';
import { LearningPathService } from '../learning-path.service';
import { RoadmapService } from '../roadmap.service';
import { CertificatesService } from '../certificates.service';
import { RelationshipService } from '../relationship.service';
import { NotFoundError } from '@/lib/errors';
import { eq } from 'drizzle-orm';

const OWNER_A = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
const OWNER_B = 'a0000000-0000-0000-0000-00000000000b';

describe('Service Layer Cross-Owner Isolation Suite', () => {
  let projectAId: string;
  let skillAId: string;
  let domainAId: string;
  let orgAId: string;
  let experienceAId: string;
  let articleAId: string;
  let journalAId: string;
  let noteAId: string;
  let adrAId: string;

  beforeAll(async () => {
    // 1. Create fixtures belonging to OWNER_A
    const [projA] = await db
      .insert(projects)
      .values({
        ownerId: OWNER_A,
        title: 'Project A Owner Isolation Test',
        slug: `proj-a-iso-${Date.now()}`,
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    projectAId = projA.id;

    const [skillA] = await db
      .insert(skills)
      .values({
        ownerId: OWNER_A,
        name: 'Skill A Owner Isolation',
        slug: `skill-a-iso-${Date.now()}`,
        category: 'Testing',
        visibility: 'private',
      })
      .returning();
    skillAId = skillA.id;

    const [domainA] = await db
      .insert(domains)
      .values({
        ownerId: OWNER_A,
        name: 'Domain A Owner Isolation',
        slug: `domain-a-iso-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    domainAId = domainA.id;

    const [orgA] = await db
      .insert(organizations)
      .values({
        ownerId: OWNER_A,
        name: 'Org A Owner Isolation',
        slug: `org-a-iso-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    orgAId = orgA.id;

    const [expA] = await db
      .insert(careerExperiences)
      .values({
        ownerId: OWNER_A,
        organizationId: orgA.id,
        position: 'Staff Engineer A',
        startDate: '2025-01-01',
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    experienceAId = expA.id;

    const [artA] = await db
      .insert(articles)
      .values({
        ownerId: OWNER_A,
        title: 'Article A Owner Isolation',
        slug: `article-a-iso-${Date.now()}`,
        content: '# Private Content A',
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    articleAId = artA.id;

    const [jrnA] = await db
      .insert(journalEntries)
      .values({
        ownerId: OWNER_A,
        title: 'Journal A Owner Isolation',
        slug: `journal-a-iso-${Date.now()}`,
        entryDate: '2026-08-29',
        content: 'Private log entry A',
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    journalAId = jrnA.id;

    const [notA] = await db
      .insert(notes)
      .values({
        ownerId: OWNER_A,
        title: 'Note A Owner Isolation',
        slug: `note-a-iso-${Date.now()}`,
        content: 'Private note snippet A',
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    noteAId = notA.id;

    const [adrA] = await db
      .insert(adrs)
      .values({
        ownerId: OWNER_A,
        title: 'ADR A Owner Isolation',
        slug: `adr-a-iso-${Date.now()}`,
        status: 'proposed',
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    adrAId = adrA.id;
  });

  afterAll(async () => {
    // Cleanup fixtures
    if (adrAId) await db.delete(adrs).where(eq(adrs.id, adrAId));
    if (noteAId) await db.delete(notes).where(eq(notes.id, noteAId));
    if (journalAId) await db.delete(journalEntries).where(eq(journalEntries.id, journalAId));
    if (articleAId) await db.delete(articles).where(eq(articles.id, articleAId));
    if (experienceAId) await db.delete(careerExperiences).where(eq(careerExperiences.id, experienceAId));
    if (orgAId) await db.delete(organizations).where(eq(organizations.id, orgAId));
    if (projectAId) await db.delete(projects).where(eq(projects.id, projectAId));
    if (skillAId) await db.delete(skills).where(eq(skills.id, skillAId));
    if (domainAId) await db.delete(domains).where(eq(domains.id, domainAId));
  });

  describe('ProjectsService Isolation', () => {
    it('allows OWNER_A to retrieve their own project editor DTO', async () => {
      const proj = await ProjectsService.getProjectEditorById(OWNER_A, projectAId);
      expect(proj.id).toBe(projectAId);
      expect(proj.title).toBe('Project A Owner Isolation Test');
    });

    it('rejects OWNER_B retrieving OWNER_A project with NotFoundError', async () => {
      await expect(
        ProjectsService.getProjectEditorById(OWNER_B, projectAId)
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects OWNER_B updating OWNER_A project with NotFoundError', async () => {
      await expect(
        ProjectsService.updateProject(OWNER_B, projectAId, {
          title: 'Malicious Update by Owner B',
          status: 'active',
          featured: false,
          sortOrder: 0,
          visibility: 'private',
          domainIds: [],
          skillIds: [],
          technologyIds: [],
          tagIds: [],
          links: [],
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('TaxonomyService Isolation', () => {
    it('allows OWNER_A to retrieve their own skill', async () => {
      const skill = await TaxonomyService.getSkillById(skillAId, OWNER_A);
      expect(skill.id).toBe(skillAId);
    });

    it('rejects OWNER_B retrieving OWNER_A skill with NotFoundError', async () => {
      await expect(
        TaxonomyService.getSkillById(skillAId, OWNER_B)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('CareerService Isolation', () => {
    it('allows OWNER_A to retrieve their own career experience editor DTO', async () => {
      const exp = await CareerService.getAdminCareerExperienceById(OWNER_A, experienceAId);
      expect(exp.id).toBe(experienceAId);
    });

    it('rejects OWNER_B retrieving OWNER_A career experience with NotFoundError', async () => {
      await expect(
        CareerService.getAdminCareerExperienceById(OWNER_B, experienceAId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Knowledge Core Isolation (Articles, Journal, Notes, ADRs)', () => {
    it('allows OWNER_A to retrieve Article A, and rejects OWNER_B', async () => {
      const art = await ArticlesService.getArticleEditorById(OWNER_A, articleAId);
      expect(art.id).toBe(articleAId);

      await expect(
        ArticlesService.getArticleEditorById(OWNER_B, articleAId)
      ).rejects.toThrow(NotFoundError);
    });

    it('allows OWNER_A to retrieve Journal A, and rejects OWNER_B', async () => {
      const jrn = await JournalService.getJournalEditorById(OWNER_A, journalAId);
      expect(jrn.id).toBe(journalAId);

      await expect(
        JournalService.getJournalEditorById(OWNER_B, journalAId)
      ).rejects.toThrow(NotFoundError);
    });

    it('allows OWNER_A to retrieve Note A, and rejects OWNER_B', async () => {
      const not = await TechNoteService.getTechNoteEditorById(OWNER_A, noteAId);
      expect(not.id).toBe(noteAId);

      await expect(
        TechNoteService.getTechNoteEditorById(OWNER_B, noteAId)
      ).rejects.toThrow(NotFoundError);
    });

    it('allows OWNER_A to retrieve ADR A, and rejects OWNER_B', async () => {
      const adr = await ADRService.getADREditorById(OWNER_A, adrAId);
      expect(adr.id).toBe(adrAId);

      await expect(
        ADRService.getADREditorById(OWNER_B, adrAId)
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects OWNER_B updating or archiving OWNER_A knowledge records', async () => {
      await expect(
        ArticlesService.updateArticle(OWNER_B, articleAId, {
          title: 'Hacked Article',
          content: 'Hacked content',
        })
      ).rejects.toThrow(NotFoundError);

      await expect(
        JournalService.updateJournalEntry(OWNER_B, journalAId, {
          title: 'Hacked Journal',
          entryDate: '2026-08-29',
          content: 'Hacked content',
        })
      ).rejects.toThrow(NotFoundError);

      await expect(
        TechNoteService.updateTechNote(OWNER_B, noteAId, {
          title: 'Hacked Note',
          content: 'Hacked content',
        })
      ).rejects.toThrow(NotFoundError);

      await expect(
        ADRService.updateADR(OWNER_B, adrAId, {
          title: 'Hacked ADR',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('5. Personal Development & Current State Isolation (Phase 5)', () => {
    let nowAId: string;
    let learningPathAId: string;
    let roadmapAId: string;
    let certificateAId: string;

    beforeAll(async () => {
      const now = await NowService.createNowEntry(OWNER_A, {
        entryType: 'building',
        title: 'Now A Isolation Test',
        status: 'active',
        isCurrent: true,
      });
      nowAId = now.id;

      const lp = await LearningPathService.createLearningPath(OWNER_A, {
        title: 'Learning Path A Isolation Test',
        slug: `lp-a-iso-${Date.now()}`,
        status: 'active',
      });
      learningPathAId = lp.id;

      const roadmap = await RoadmapService.createRoadmapItem(OWNER_A, {
        title: 'Roadmap A Isolation Test',
        status: 'planned',
      });
      roadmapAId = roadmap.id;

      const cert = await CertificatesService.createCertificate(OWNER_A, {
        name: 'Certificate A Isolation Test',
        issuer: 'Isolation Issuer',
        issuedAt: '2026-08-01',
      });
      certificateAId = cert.id;
    });

    afterAll(async () => {
      if (nowAId) await db.delete(nowEntries).where(eq(nowEntries.id, nowAId));
      if (learningPathAId) await db.delete(learningPaths).where(eq(learningPaths.id, learningPathAId));
      if (roadmapAId) await db.delete(roadmapItems).where(eq(roadmapItems.id, roadmapAId));
      if (certificateAId) await db.delete(certificates).where(eq(certificates.id, certificateAId));
    });

    it('allows OWNER_A to read Phase 5 entities, and rejects OWNER_B with NotFoundError', async () => {
      expect((await NowService.getNowEntryEditorById(OWNER_A, nowAId)).id).toBe(nowAId);
      await expect(NowService.getNowEntryEditorById(OWNER_B, nowAId)).rejects.toThrow(NotFoundError);

      expect((await LearningPathService.getLearningPathEditorById(OWNER_A, learningPathAId)).id).toBe(
        learningPathAId
      );
      await expect(
        LearningPathService.getLearningPathEditorById(OWNER_B, learningPathAId)
      ).rejects.toThrow(NotFoundError);

      expect((await RoadmapService.getRoadmapEditorById(OWNER_A, roadmapAId)).id).toBe(roadmapAId);
      await expect(RoadmapService.getRoadmapEditorById(OWNER_B, roadmapAId)).rejects.toThrow(
        NotFoundError
      );

      expect((await CertificatesService.getCertificateEditorById(OWNER_A, certificateAId)).id).toBe(
        certificateAId
      );
      await expect(
        CertificatesService.getCertificateEditorById(OWNER_B, certificateAId)
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects OWNER_B mutating or completing Phase 5 entities belonging to OWNER_A', async () => {
      await expect(
        NowService.completeNowEntry(OWNER_B, nowAId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        NowService.archiveNowEntry(OWNER_B, nowAId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        LearningPathService.updateLearningPath(OWNER_B, learningPathAId, { title: 'Hacked LP' })
      ).rejects.toThrow(NotFoundError);

      await expect(
        RoadmapService.updateRoadmapItem(OWNER_B, roadmapAId, { title: 'Hacked Roadmap' })
      ).rejects.toThrow(NotFoundError);

      await expect(
        CertificatesService.updateCertificate(OWNER_B, certificateAId, { name: 'Hacked Cert' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Phase 6 — Semantic Knowledge Relationships Cross-Owner Isolation', () => {
    let relTypeExplains: any;
    let relationshipAId: string;

    beforeAll(async () => {
      const [explains] = await db
        .select()
        .from(relationshipTypes)
        .where(eq(relationshipTypes.code, 'EXPLAINS'));
      relTypeExplains = explains;

      // Create a relationship owned by OWNER_A
      const relA = await RelationshipService.createRelationship(OWNER_A, {
        relationshipTypeId: relTypeExplains.id,
        sourceType: 'ARTICLE',
        sourceId: articleAId,
        targetType: 'PROJECT',
        targetId: projectAId,
        description: 'Owner A Article explains Project A',
      });
      relationshipAId = relA.id;
    });

    it('allows OWNER_A to read relationship, and rejects OWNER_B with NotFoundError', async () => {
      expect((await RelationshipService.getRelationshipById(OWNER_A, relationshipAId)).id).toBe(
        relationshipAId
      );
      await expect(
        RelationshipService.getRelationshipById(OWNER_B, relationshipAId)
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects OWNER_B mutating metadata or archiving OWNER_A relationship', async () => {
      await expect(
        RelationshipService.updateRelationshipMetadata(OWNER_B, relationshipAId, {
          description: 'Hacked description',
        })
      ).rejects.toThrow(NotFoundError);

      await expect(
        RelationshipService.archiveRelationship(OWNER_B, relationshipAId)
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects creating cross-owner edges (OWNER_A source -> OWNER_B target)', async () => {
      // Create a project for OWNER_B
      const [projB] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_B,
          title: 'Project B Isolated',
          slug: `proj-b-iso-${Date.now()}`,
          visibility: 'private',
          publicationStatus: 'draft',
        })
        .returning();

      await expect(
        RelationshipService.createRelationship(OWNER_A, {
          relationshipTypeId: relTypeExplains.id,
          sourceType: 'ARTICLE',
          sourceId: articleAId,
          targetType: 'PROJECT',
          targetId: projB.id,
        })
      ).rejects.toThrow(NotFoundError);
    });
  });
});


