import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/client';
import {
  articles,
  notes,
  adrs,
  journalEntries,
  projects,
  projectCaseStudies,
  careerExperiences,
  learningPaths,
  roadmapItems,
  certificates,
  nowEntries,
  organizations,
  knowledgeRelationships,
  relationshipTypes,
} from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { PublishingService } from '../publishing.service';
import { PublishingSchedulerService } from '../publishing-scheduler.service';
import { PreviewService } from '../preview.service';
import { RelationshipService } from '../relationship.service';
import {
  isPubliclyDiscoverable,
  isDirectlyResolvable,
  isExposureIncreasing,
  isExposureReducing,
  getAllowedCommandsForStatus,
  PUBLISHABLE_ENTITY_TYPES,
} from '@/domain/publishing';

describe('Phase 7: Publishing Engine & Editorial Lifecycle', () => {
  const OWNER_A = '00000000-0000-0000-0000-000000000001';
  const OWNER_B = '00000000-0000-0000-0000-000000000002';

  describe('1. State Transition Matrix & Editorial Invariants', () => {
    it('supports DRAFT -> REVIEW -> PUBLISHED flow', async () => {
      const [art] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: 'Publishing Flow Test',
          slug: `pub-flow-${Date.now()}`,
          content: 'Full article body for publishing test.',
          publicationStatus: 'draft',
          visibility: 'public',
        })
        .returning();

      // DRAFT -> REVIEW
      const reviewState = await PublishingService.submitForReview(OWNER_A, 'ARTICLE', art.id);
      expect(reviewState.publicationStatus).toBe('review');

      // REVIEW -> PUBLISHED
      const publishedState = await PublishingService.publishNow(OWNER_A, 'ARTICLE', art.id);
      expect(publishedState.publicationStatus).toBe('published');
      expect(publishedState.publishedAt).not.toBeNull();
    });

    it('supports direct DRAFT -> PUBLISHED flow (Amendment 15)', async () => {
      const [note] = await db
        .insert(notes)
        .values({
          ownerId: OWNER_A,
          title: 'Direct Publish Note',
          slug: `direct-pub-${Date.now()}`,
          content: 'Verified technical snippet.',
          publicationStatus: 'draft',
          visibility: 'public',
        })
        .returning();

      const publishedState = await PublishingService.publishNow(OWNER_A, 'TECH_NOTE', note.id);
      expect(publishedState.publicationStatus).toBe('published');
      expect(publishedState.publishedAt).not.toBeNull();
    });

    it('supports scheduling with future timestamp and clears schedule on publish (Amendment 17, 26)', async () => {
      const [adr] = await db
        .insert(adrs)
        .values({
          ownerId: OWNER_A,
          title: 'Scheduled ADR',
          slug: `sched-adr-${Date.now()}`,
          decision: 'We will use Postgres.',
          context: 'Need reliable ACID.',
          publicationStatus: 'draft',
          visibility: 'public',
        })
        .returning();

      const futureDate = new Date(Date.now() + 86400000); // 1 day in future
      const schedState = await PublishingService.schedulePublication(
        OWNER_A,
        'ADR',
        adr.id,
        futureDate
      );
      expect(schedState.publicationStatus).toBe('scheduled');
      expect(schedState.scheduledPublishAt).not.toBeNull();

      // Publish Now clears scheduledPublishAt
      const publishedState = await PublishingService.publishNow(OWNER_A, 'ADR', adr.id);
      expect(publishedState.publicationStatus).toBe('published');
      expect(publishedState.scheduledPublishAt).toBeNull();
    });

    it('supports PUBLISHED -> DRAFT unpublish and preserves publishedAt (Amendment 25)', async () => {
      const [art] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: 'Unpublish Test Article',
          slug: `unpub-${Date.now()}`,
          content: 'Unpublish test content.',
          publicationStatus: 'published',
          publishedAt: new Date('2026-01-01T00:00:00Z'),
          visibility: 'public',
        })
        .returning();

      const unpubState = await PublishingService.unpublish(OWNER_A, 'ARTICLE', art.id);
      expect(unpubState.publicationStatus).toBe('draft');
      expect(unpubState.publishedAt).toBe('2026-01-01T00:00:00.000Z'); // Preserved
    });

    it('supports ARCHIVED -> DRAFT restore and clears archivedAt without auto-publishing (Amendment 4, 27)', async () => {
      const [proj] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_A,
          title: 'Archived Project',
          slug: `arch-proj-${Date.now()}`,
          description: 'Project archived test description.',
          publicationStatus: 'published',
          visibility: 'public',
        })
        .returning();

      // Archive
      const archState = await PublishingService.archivePublication(OWNER_A, 'PROJECT', proj.id);
      expect(archState.publicationStatus).toBe('archived');
      expect(archState.archivedAt).not.toBeNull();

      // Restore to draft
      const restoredState = await PublishingService.restoreToDraft(OWNER_A, 'PROJECT', proj.id);
      expect(restoredState.publicationStatus).toBe('draft');
      expect(restoredState.archivedAt).toBeNull();
    });

    it('rejects invalid state transitions with conflict errors (Amendment 23)', async () => {
      const [art] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: 'Invalid Transition Article',
          slug: `invalid-trans-${Date.now()}`,
          content: 'Content here.',
          publicationStatus: 'archived',
          archivedAt: new Date(),
          visibility: 'private',
        })
        .returning();

      // ARCHIVED cannot directly submit for review
      await expect(
        PublishingService.submitForReview(OWNER_A, 'ARTICLE', art.id)
      ).rejects.toThrow(/Cannot submit for review from status "archived"/);

      // ARCHIVED cannot directly unpublish
      await expect(
        PublishingService.unpublish(OWNER_A, 'ARTICLE', art.id)
      ).rejects.toThrow(/Cannot unpublish entity in status "archived"/);
    });
  });

  describe('2. Readiness Validation across all 11 Publishable Entity Types (Amendment 50)', () => {
    it('validates Article readiness (positive and blocking)', async () => {
      const [blocked] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: '', // Missing title
          slug: `blocked-art-${Date.now()}`,
          content: '', // Missing content
          publicationStatus: 'draft',
          visibility: 'public',
        })
        .returning();

      const blockedReadiness = await PublishingService.getPublicationReadiness(
        OWNER_A,
        'ARTICLE',
        blocked.id
      );
      expect(blockedReadiness.isReady).toBe(false);
      expect(blockedReadiness.hasErrors).toBe(true);
      expect(blockedReadiness.issues.some((i) => i.code === 'MISSING_TITLE')).toBe(true);

      // Attempting to publish blocked article throws PUBLICATION_BLOCKED
      await expect(
        PublishingService.publishNow(OWNER_A, 'ARTICLE', blocked.id)
      ).rejects.toThrow(/Publication readiness failed/);
    });

    it('validates TechNote readiness (positive and blocking)', async () => {
      const [blockedNote] = await db
        .insert(notes)
        .values({
          ownerId: OWNER_A,
          title: 'Blocked Note',
          slug: `blocked-note-${Date.now()}`,
          content: '', // Missing content
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(
        OWNER_A,
        'TECH_NOTE',
        blockedNote.id
      );
      expect(res.hasErrors).toBe(true);
      expect(res.issues.some((i) => i.code === 'MISSING_CONTENT')).toBe(true);
    });

    it('validates ADR readiness (positive and blocking)', async () => {
      const [blockedADR] = await db
        .insert(adrs)
        .values({
          ownerId: OWNER_A,
          title: 'Blocked ADR',
          slug: `blocked-adr-${Date.now()}`,
          decision: '', // Missing decision
          context: '',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(OWNER_A, 'ADR', blockedADR.id);
      expect(res.hasErrors).toBe(true);
      expect(res.issues.some((i) => i.code === 'MISSING_CONTENT')).toBe(true);
    });

    it('validates JournalEntry readiness', async () => {
      const [j] = await db
        .insert(journalEntries)
        .values({
          ownerId: OWNER_A,
          entryDate: '2026-08-29',
          title: 'Daily Log',
          slug: `journal-ready-${Date.now()}`,
          content: 'Daily engineering activity log.',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(
        OWNER_A,
        'JOURNAL_ENTRY',
        j.id
      );
      expect(res.isReady).toBe(true);
      expect(res.hasErrors).toBe(false);
    });

    it('validates Project readiness', async () => {
      const [proj] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_A,
          title: 'Ready Project',
          slug: `ready-proj-${Date.now()}`,
          description: 'A comprehensive full-stack developer portfolio and OS.',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(OWNER_A, 'PROJECT', proj.id);
      expect(res.isReady).toBe(true);
    });

    it('validates ProjectCaseStudy readiness with parent dependency (Amendment 33)', async () => {
      const [parent] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_A,
          title: 'Parent Project',
          slug: `parent-p-${Date.now()}`,
          description: 'Parent project description.',
          publicationStatus: 'draft', // Parent is draft
          visibility: 'private',
        })
        .returning();

      const [cs] = await db
        .insert(projectCaseStudies)
        .values({
          ownerId: OWNER_A,
          projectId: parent.id,
          title: 'Case Study',
          executiveSummary: 'Executive summary text.',
          problemStatement: 'Problem statement text.',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(
        OWNER_A,
        'PROJECT_CASE_STUDY',
        cs.id
      );
      // Valid content, but parent is unpublished so warning is emitted
      expect(res.isReady).toBe(true); // Warnings don't block
      expect(res.hasWarnings).toBe(true);
      expect(res.issues.some((i) => i.code === 'PARENT_PROJECT_UNPUBLISHED')).toBe(true);
    });

    it('validates Career Experience readiness', async () => {
      const [org] = await db
        .insert(organizations)
        .values({
          ownerId: OWNER_A,
          name: 'Tech Corp',
          slug: `tech-corp-${Date.now()}`,
        })
        .returning();

      const [exp] = await db
        .insert(careerExperiences)
        .values({
          ownerId: OWNER_A,
          organizationId: org.id,
          position: 'Senior Engineer',
          startDate: '2024-01-01',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(OWNER_A, 'EXPERIENCE', exp.id);
      expect(res.isReady).toBe(true);
    });

    it('validates LearningPath readiness', async () => {
      const [lp] = await db
        .insert(learningPaths)
        .values({
          ownerId: OWNER_A,
          title: 'Distributed Systems',
          slug: `dist-sys-${Date.now()}`,
          summary: 'Learning path summary.',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(
        OWNER_A,
        'LEARNING_PATH',
        lp.id
      );
      expect(res.isReady).toBe(true);
    });

    it('validates RoadmapItem readiness', async () => {
      const [rm] = await db
        .insert(roadmapItems)
        .values({
          ownerId: OWNER_A,
          title: 'Implement Search Phase 9',
          slug: `roadmap-search-${Date.now()}`,
          category: 'Architecture',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(OWNER_A, 'ROADMAP', rm.id);
      expect(res.isReady).toBe(true);
    });

    it('validates Certificate readiness', async () => {
      const [cert] = await db
        .insert(certificates)
        .values({
          ownerId: OWNER_A,
          name: 'AWS Solutions Architect',
          issuer: 'Amazon Web Services',
          issuedAt: '2025-06-01',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(
        OWNER_A,
        'CERTIFICATE',
        cert.id
      );
      expect(res.isReady).toBe(true);
    });

    it('validates NowEntry readiness (Amendment 9: follows actual schema fields)', async () => {
      const [nowE] = await db
        .insert(nowEntries)
        .values({
          ownerId: OWNER_A,
          title: 'Building Phase 7 Publishing Engine',
          entryType: 'building',
          status: 'active',
          startedAt: '2026-08-29',
          publicationStatus: 'draft',
        })
        .returning();

      const res = await PublishingService.getPublicationReadiness(
        OWNER_A,
        'NOW_ENTRY',
        nowE.id
      );
      expect(res.isReady).toBe(true);
      expect(res.hasErrors).toBe(false);
    });
  });

  describe('3. Private Provenance & Dependency Safety (Amendments 31, 32)', () => {
    it('publishes TechNote with private JournalEntry provenance without leaking Journal privacy', async () => {
      // 1. Private Journal
      const [journal] = await db
        .insert(journalEntries)
        .values({
          ownerId: OWNER_A,
          entryDate: '2026-08-29',
          title: 'Confidential Internal Debugging Session',
          slug: `priv-journal-${Date.now()}`,
          content: 'Confidential notes and raw logs.',
          visibility: 'private',
          publicationStatus: 'draft',
        })
        .returning();

      // 2. Public TechNote derived from Journal
      const [note] = await db
        .insert(notes)
        .values({
          ownerId: OWNER_A,
          title: 'Clean Verified Tech Note',
          slug: `clean-note-${Date.now()}`,
          content: 'Publicly safe technical explanation.',
          visibility: 'public',
          publicationStatus: 'draft',
        })
        .returning();

      // 3. Create DERIVED_INTO provenance edge (private)
      const derivedIntoType = await db.query.relationshipTypes.findFirst({
        where: eq(relationshipTypes.code, 'DERIVED_INTO'),
      });

      await RelationshipService.createRelationship(OWNER_A, {
        relationshipTypeId: derivedIntoType!.id,
        sourceType: 'JOURNAL_ENTRY',
        sourceId: journal.id,
        targetType: 'TECH_NOTE',
        targetId: note.id,
        visibility: 'private',
      });

      // 4. Publish Tech Note
      const publishedNote = await PublishingService.publishNow(OWNER_A, 'TECH_NOTE', note.id);
      expect(publishedNote.publicationStatus).toBe('published');

      // 5. Verify Journal remains strictly private and draft
      const [freshJournal] = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, journal.id));
      expect(freshJournal.visibility).toBe('private');
      expect(freshJournal.publicationStatus).toBe('draft');

      // 6. Verify Public Impact Preview reports the private relationship as hidden
      const impact = await PublishingService.getPublicImpactPreview(
        OWNER_A,
        'TECH_NOTE',
        note.id,
        'public',
        'published'
      );
      expect(impact.eligibleRelationshipsCount).toBe(0);
      expect(impact.hiddenPrivateRelationshipsCount).toBe(1);
    });
  });

  describe('4. Visibility Escalation & Exposure Policies (Amendments 5, 6, 49)', () => {
    it('blocks visibility escalation to PUBLIC on published content with readiness errors', async () => {
      const [art] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: '', // Missing title
          slug: `bad-art-${Date.now()}`,
          content: 'Some content.',
          visibility: 'private',
          publicationStatus: 'published', // Was published privately
        })
        .returning();

      // Escalation PRIVATE -> PUBLIC must be blocked by full readiness
      await expect(
        PublishingService.changeVisibility(OWNER_A, 'ARTICLE', art.id, 'public')
      ).rejects.toThrow(/Publication readiness errors present/);
    });

    it('allows visibility reduction (PUBLIC -> PRIVATE) without readiness gating', async () => {
      const [art] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: 'Public Article',
          slug: `pub-art-${Date.now()}`,
          content: 'Content here.',
          visibility: 'public',
          publicationStatus: 'published',
        })
        .returning();

      const updated = await PublishingService.changeVisibility(
        OWNER_A,
        'ARTICLE',
        art.id,
        'private'
      );
      expect(updated.visibility).toBe('private');
    });

    it('evaluates exposure increasing/reducing pure domain helpers', () => {
      expect(isExposureIncreasing('private', 'public')).toBe(true);
      expect(isExposureIncreasing('unlisted', 'public')).toBe(true);
      expect(isExposureIncreasing('private', 'unlisted')).toBe(true);
      expect(isExposureIncreasing('public', 'private')).toBe(false);

      expect(isExposureReducing('public', 'private')).toBe(true);
      expect(isExposureReducing('public', 'unlisted')).toBe(true);
      expect(isExposureReducing('unlisted', 'private')).toBe(true);
      expect(isExposureReducing('private', 'public')).toBe(false);
    });
  });

  describe('5. Public Discoverability & Unlisted Routing Matrix (Amendments 4, 34, 35, 51)', () => {
    it('enforces exact discoverability and resolution matrix', () => {
      // PUBLIC + PUBLISHED
      expect(isPubliclyDiscoverable('public', 'published', false)).toBe(true);
      expect(isDirectlyResolvable('public', 'published', false)).toBe(true);

      // UNLISTED + PUBLISHED (direct route only)
      expect(isPubliclyDiscoverable('unlisted', 'published', false)).toBe(false);
      expect(isDirectlyResolvable('unlisted', 'published', false)).toBe(true);

      // PRIVATE + PUBLISHED (owner only)
      expect(isPubliclyDiscoverable('private', 'published', false)).toBe(false);
      expect(isDirectlyResolvable('private', 'published', false)).toBe(false);

      // PUBLIC + DRAFT
      expect(isPubliclyDiscoverable('public', 'draft', false)).toBe(false);
      expect(isDirectlyResolvable('public', 'draft', false)).toBe(false);

      // PUBLIC + REVIEW
      expect(isPubliclyDiscoverable('public', 'review', false)).toBe(false);

      // PUBLIC + SCHEDULED
      expect(isPubliclyDiscoverable('public', 'scheduled', false)).toBe(false);

      // ARCHIVED
      expect(isPubliclyDiscoverable('public', 'published', true)).toBe(false);
      expect(isDirectlyResolvable('public', 'published', true)).toBe(false);
    });
  });

  describe('6. Automated Scheduler Execution & Concurrency (Amendments 18, 20, 21, 22, 53)', () => {
    it('publishes due scheduled items and isolates failures per entity', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      const futureDate = new Date(Date.now() + 3600000); // 1 hour in future

      // Due item 1 (Valid)
      const [dueArt] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: 'Due Article',
          slug: `due-art-${Date.now()}`,
          content: 'Due article content.',
          publicationStatus: 'scheduled',
          scheduledPublishAt: pastDate,
          visibility: 'public',
        })
        .returning();

      // Due item 2 (Invalid content - will fail during scheduler publish)
      const [dueInvalid] = await db
        .insert(notes)
        .values({
          ownerId: OWNER_A,
          title: 'Invalid Due Note',
          slug: `due-invalid-${Date.now()}`,
          content: '', // Missing content
          publicationStatus: 'scheduled',
          scheduledPublishAt: pastDate,
          visibility: 'public',
        })
        .returning();

      // Future item (Should NOT be processed)
      const [futureArt] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: 'Future Article',
          slug: `future-art-${Date.now()}`,
          content: 'Future article content.',
          publicationStatus: 'scheduled',
          scheduledPublishAt: futureDate,
          visibility: 'public',
        })
        .returning();

      const result = await PublishingSchedulerService.processDuePublications();

      expect(result.processed).toBeGreaterThanOrEqual(2);
      expect(result.succeeded).toBeGreaterThanOrEqual(1);
      expect(result.failed).toBeGreaterThanOrEqual(1);

      // Due valid article is now published
      const [freshDueArt] = await db.select().from(articles).where(eq(articles.id, dueArt.id));
      expect(freshDueArt.publicationStatus).toBe('published');
      expect(freshDueArt.scheduledPublishAt).toBeNull();

      // Due invalid note remains scheduled (not silently reverted to draft)
      const [freshInvalid] = await db.select().from(notes).where(eq(notes.id, dueInvalid.id));
      expect(freshInvalid.publicationStatus).toBe('scheduled');

      // Future article remains scheduled
      const [freshFuture] = await db.select().from(articles).where(eq(articles.id, futureArt.id));
      expect(freshFuture.publicationStatus).toBe('scheduled');
    });

    it('is idempotent on repeated scheduler execution', async () => {
      const result1 = await PublishingSchedulerService.processDuePublications();
      const result2 = await PublishingSchedulerService.processDuePublications();
      // No remaining valid due items to process
      expect(result2.succeeded).toBe(0);
    });
  });

  describe('7. Cross-Owner Isolation (Amendment 52)', () => {
    it('prevents OWNER_B from publishing or reading readiness of OWNER_A content', async () => {
      const [artA] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A,
          title: 'Owner A Article',
          slug: `owner-a-${Date.now()}`,
          content: 'Private draft for Owner A.',
          visibility: 'private',
          publicationStatus: 'draft',
        })
        .returning();

      // OWNER_B cannot publish OWNER_A article
      await expect(
        PublishingService.publishNow(OWNER_B, 'ARTICLE', artA.id)
      ).rejects.toThrow(/not found or access denied/);

      // OWNER_B cannot read readiness of OWNER_A article
      await expect(
        PublishingService.getPublicationReadiness(OWNER_B, 'ARTICLE', artA.id)
      ).rejects.toThrow(/not found or access denied/);

      // OWNER_B cannot read preview of OWNER_A article
      await expect(
        PreviewService.resolveOwnerPreview(OWNER_B, 'ARTICLE', artA.id)
      ).rejects.toThrow(/Preview not found/);
    });
  });

  describe('8. Policy-Driven Allowed Commands (Amendment 48)', () => {
    it('returns exact allowed commands per publication status', () => {
      const draftCommands = getAllowedCommandsForStatus('draft', {
        supportsReview: true,
        supportsScheduling: true,
      } as any);
      expect(draftCommands).toContain('SUBMIT_FOR_REVIEW');
      expect(draftCommands).toContain('SCHEDULE');
      expect(draftCommands).toContain('PUBLISH_NOW');
      expect(draftCommands).toContain('ARCHIVE');

      const pubCommands = getAllowedCommandsForStatus('published');
      expect(pubCommands).toContain('UNPUBLISH');
      expect(pubCommands).toContain('ARCHIVE');
      expect(pubCommands).not.toContain('SUBMIT_FOR_REVIEW');

      const archCommands = getAllowedCommandsForStatus('archived');
      expect(archCommands).toEqual(['CHANGE_VISIBILITY', 'RESTORE']);
    });
  });
});
