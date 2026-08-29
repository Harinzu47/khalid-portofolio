import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/client';
import * as schema from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { RelationshipService } from '@/services/relationship.service';
import { EntityResolverService } from '@/services/entity-resolver.service';
import {
  NotFoundError,
  RelationshipInvalidError,
  RelationshipDuplicateError,
  RelationshipIncompatibleError,
} from '@/lib/errors';

const OWNER_A_ID = '00000000-0000-0000-0000-000000000001';
const OWNER_B_ID = '00000000-0000-0000-0000-000000000002';

describe('RelationshipService Integration Suite', () => {
  let explainsType: typeof schema.relationshipTypes.$inferSelect;
  let buildsOnType: typeof schema.relationshipTypes.$inferSelect;
  let derivedIntoType: typeof schema.relationshipTypes.$inferSelect;
  let referencesType: typeof schema.relationshipTypes.$inferSelect;
  let appliesToType: typeof schema.relationshipTypes.$inferSelect;

  let ownerAArticle1: typeof schema.articles.$inferSelect;
  let ownerAArticle2: typeof schema.articles.$inferSelect;
  let ownerAProject1: typeof schema.projects.$inferSelect;
  let ownerANote1: typeof schema.notes.$inferSelect;
  let ownerAADR1: typeof schema.adrs.$inferSelect;
  let ownerAJournal1: typeof schema.journalEntries.$inferSelect;
  let ownerATech1: typeof schema.technologies.$inferSelect;

  let ownerBArticle: typeof schema.articles.$inferSelect;
  let ownerBProject: typeof schema.projects.$inferSelect;

  beforeEach(async () => {
    // 1. Fetch canonical relationship types
    const [explains] = await db
      .select()
      .from(schema.relationshipTypes)
      .where(eq(schema.relationshipTypes.code, 'EXPLAINS'));
    const [buildsOn] = await db
      .select()
      .from(schema.relationshipTypes)
      .where(eq(schema.relationshipTypes.code, 'BUILDS_ON'));
    const [derivedInto] = await db
      .select()
      .from(schema.relationshipTypes)
      .where(eq(schema.relationshipTypes.code, 'DERIVED_INTO'));
    const [references] = await db
      .select()
      .from(schema.relationshipTypes)
      .where(eq(schema.relationshipTypes.code, 'REFERENCES'));
    const [appliesTo] = await db
      .select()
      .from(schema.relationshipTypes)
      .where(eq(schema.relationshipTypes.code, 'APPLIES_TO'));

    explainsType = explains;
    buildsOnType = buildsOn;
    derivedIntoType = derivedInto;
    referencesType = references;
    appliesToType = appliesTo;

    // 2. Clean up test relationships & fixtures
    await db.delete(schema.knowledgeRelationships);
    await db.delete(schema.articles).where(inArray(schema.articles.ownerId, [OWNER_A_ID, OWNER_B_ID]));
    await db.delete(schema.projects).where(inArray(schema.projects.ownerId, [OWNER_A_ID, OWNER_B_ID]));
    await db.delete(schema.notes).where(inArray(schema.notes.ownerId, [OWNER_A_ID, OWNER_B_ID]));
    await db.delete(schema.adrs).where(inArray(schema.adrs.ownerId, [OWNER_A_ID, OWNER_B_ID]));
    await db.delete(schema.journalEntries).where(inArray(schema.journalEntries.ownerId, [OWNER_A_ID, OWNER_B_ID]));
    await db.delete(schema.technologies).where(inArray(schema.technologies.ownerId, [OWNER_A_ID, OWNER_B_ID]));

    // 3. Create fixtures for OWNER A
    const [art1] = await db
      .insert(schema.articles)
      .values({
        ownerId: OWNER_A_ID,
        title: 'Owner A Article Alpha',
        slug: `art-alpha-${Date.now()}`,
        content: 'Article Alpha content',
        visibility: 'public',
        publicationStatus: 'published',
      })
      .returning();
    ownerAArticle1 = art1;

    const [art2] = await db
      .insert(schema.articles)
      .values({
        ownerId: OWNER_A_ID,
        title: 'Owner A Article Beta',
        slug: `art-beta-${Date.now()}`,
        content: 'Article Beta content',
        visibility: 'public',
        publicationStatus: 'published',
      })
      .returning();
    ownerAArticle2 = art2;

    const [proj1] = await db
      .insert(schema.projects)
      .values({
        ownerId: OWNER_A_ID,
        title: 'Owner A Project Gamma',
        slug: `proj-gamma-${Date.now()}`,
        description: 'Project Gamma description',
        visibility: 'public',
        publicationStatus: 'published',
      })
      .returning();
    ownerAProject1 = proj1;

    const [note1] = await db
      .insert(schema.notes)
      .values({
        ownerId: OWNER_A_ID,
        title: 'Owner A TechNote Delta',
        slug: `note-delta-${Date.now()}`,
        content: 'TechNote Delta content',
        visibility: 'public',
        publicationStatus: 'published',
      })
      .returning();
    ownerANote1 = note1;

    const [adr1] = await db
      .insert(schema.adrs)
      .values({
        ownerId: OWNER_A_ID,
        title: 'Owner A ADR Epsilon',
        slug: `adr-epsilon-${Date.now()}`,
        decision: 'ADR Epsilon decision',
        status: 'accepted',
        visibility: 'public',
        publicationStatus: 'published',
      })
      .returning();
    ownerAADR1 = adr1;

    const [journal1] = await db
      .insert(schema.journalEntries)
      .values({
        ownerId: OWNER_A_ID,
        title: 'Owner A Journal Zeta',
        slug: `journal-zeta-${Date.now()}`,
        content: 'Journal Zeta content',
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    ownerAJournal1 = journal1;

    const [tech1] = await db
      .insert(schema.technologies)
      .values({
        ownerId: OWNER_A_ID,
        name: 'Rust Lang',
        slug: `rust-${Date.now()}`,
        category: 'Languages',
        visibility: 'public',
      })
      .returning();
    ownerATech1 = tech1;

    // 4. Create fixtures for OWNER B
    const [bArt] = await db
      .insert(schema.articles)
      .values({
        ownerId: OWNER_B_ID,
        title: 'Owner B Article Theta',
        slug: `art-theta-${Date.now()}`,
        content: 'Article Theta content',
        visibility: 'public',
        publicationStatus: 'published',
      })
      .returning();
    ownerBArticle = bArt;

    const [bProj] = await db
      .insert(schema.projects)
      .values({
        ownerId: OWNER_B_ID,
        title: 'Owner B Project Iota',
        slug: `proj-iota-${Date.now()}`,
        description: 'Project Iota description',
        visibility: 'public',
        publicationStatus: 'published',
      })
      .returning();
    ownerBProject = bProj;
  });

  // --------------------------------------------------------------------------
  // 1. Basic Creation & Default Invariants
  // --------------------------------------------------------------------------
  it('creates a valid semantic relationship with visibility=private and status=active (Amendment 1)', async () => {
    const created = await RelationshipService.createRelationship(OWNER_A_ID, {
      relationshipTypeId: explainsType.id,
      sourceType: 'ARTICLE',
      sourceId: ownerAArticle1.id,
      targetType: 'PROJECT',
      targetId: ownerAProject1.id,
      description: 'Article explains architecture of Project Gamma',
    });

    expect(created.id).toBeDefined();
    expect(created.relationshipTypeCode).toBe('EXPLAINS');
    expect(created.visibility).toBe('private'); // Amendment 1: default private
    expect(created.status).toBe('active');
    expect(created.archivedAt).toBeNull();
    expect(created.source.label).toBe('Owner A Article Alpha');
    expect(created.target.label).toBe('Owner A Project Gamma');
  });

  // --------------------------------------------------------------------------
  // 2. Compatibility Validation
  // --------------------------------------------------------------------------
  it('rejects incompatible source/target combinations (Amendment 10)', async () => {
    // DERIVED_INTO from PROJECT -> ARTICLE is not canonical
    await expect(
      RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: derivedIntoType.id,
        sourceType: 'PROJECT',
        sourceId: ownerAProject1.id,
        targetType: 'ARTICLE',
        targetId: ownerAArticle1.id,
      })
    ).rejects.toThrow(RelationshipIncompatibleError);
  });

  // --------------------------------------------------------------------------
  // 3. Structural vs. Semantic Non-Duplication Guard
  // --------------------------------------------------------------------------
  it('rejects prohibited semantic edges that duplicate canonical structural junctions (Amendment 11)', async () => {
    // Project -> Technology APPLIES_TO is prohibited (structural project_technologies)
    await expect(
      RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: appliesToType.id,
        sourceType: 'PROJECT',
        sourceId: ownerAProject1.id,
        targetType: 'TECHNOLOGY',
        targetId: ownerATech1.id,
      })
    ).rejects.toThrow(RelationshipInvalidError);
  });

  // --------------------------------------------------------------------------
  // 4. Self-Edge Rejection
  // --------------------------------------------------------------------------
  it('rejects self-referencing relationships (source == target)', async () => {
    await expect(
      RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: referencesType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle1.id,
        targetType: 'ARTICLE',
        targetId: ownerAArticle1.id,
      })
    ).rejects.toThrow(RelationshipInvalidError);
  });

  // --------------------------------------------------------------------------
  // 5. Duplicate Active Edge Rejection
  // --------------------------------------------------------------------------
  it('rejects exact duplicate active relationships (Amendment 20)', async () => {
    await RelationshipService.createRelationship(OWNER_A_ID, {
      relationshipTypeId: explainsType.id,
      sourceType: 'ARTICLE',
      sourceId: ownerAArticle1.id,
      targetType: 'PROJECT',
      targetId: ownerAProject1.id,
    });

    await expect(
      RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: explainsType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle1.id,
        targetType: 'PROJECT',
        targetId: ownerAProject1.id,
      })
    ).rejects.toThrow(RelationshipDuplicateError);
  });

  // --------------------------------------------------------------------------
  // 6. Cross-Owner Boundary Security
  // --------------------------------------------------------------------------
  it('rejects cross-owner endpoints (OWNER_A source -> OWNER_B target) (Amendment 12, 13)', async () => {
    await expect(
      RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: explainsType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle1.id,
        targetType: 'PROJECT',
        targetId: ownerBProject.id, // Belong to OWNER_B
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('prevents OWNER_B from reading or mutating OWNER_A relationship edges', async () => {
    const created = await RelationshipService.createRelationship(OWNER_A_ID, {
      relationshipTypeId: explainsType.id,
      sourceType: 'ARTICLE',
      sourceId: ownerAArticle1.id,
      targetType: 'PROJECT',
      targetId: ownerAProject1.id,
    });

    // OWNER_B tries to read by ID
    await expect(
      RelationshipService.getRelationshipById(OWNER_B_ID, created.id)
    ).rejects.toThrow(NotFoundError);

    // OWNER_B tries to update metadata
    await expect(
      RelationshipService.updateRelationshipMetadata(OWNER_B_ID, created.id, {
        description: 'Tampered by B',
      })
    ).rejects.toThrow(NotFoundError);

    // OWNER_B tries to archive
    await expect(
      RelationshipService.archiveRelationship(OWNER_B_ID, created.id)
    ).rejects.toThrow(NotFoundError);
  });

  // --------------------------------------------------------------------------
  // 7. Bounded Cycle Detection for BUILDS_ON
  // --------------------------------------------------------------------------
  it('detects and rejects cycles for BUILDS_ON relationships (Amendment 4)', async () => {
    // Article 1 BUILDS_ON Article 2
    await RelationshipService.createRelationship(OWNER_A_ID, {
      relationshipTypeId: buildsOnType.id,
      sourceType: 'ARTICLE',
      sourceId: ownerAArticle1.id,
      targetType: 'ARTICLE',
      targetId: ownerAArticle2.id,
    });

    // Attempting Article 2 BUILDS_ON Article 1 must be rejected as cycle
    await expect(
      RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: buildsOnType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle2.id,
        targetType: 'ARTICLE',
        targetId: ownerAArticle1.id,
      })
    ).rejects.toThrow(RelationshipInvalidError);
  });

  // --------------------------------------------------------------------------
  // 8. Idempotent Archive Lifecycle
  // --------------------------------------------------------------------------
  it('archives relationships idempotently without error (Amendment 2)', async () => {
    const created = await RelationshipService.createRelationship(OWNER_A_ID, {
      relationshipTypeId: explainsType.id,
      sourceType: 'ARTICLE',
      sourceId: ownerAArticle1.id,
      targetType: 'PROJECT',
      targetId: ownerAProject1.id,
    });

    await RelationshipService.archiveRelationship(OWNER_A_ID, created.id);
    const archived = await RelationshipService.getRelationshipById(OWNER_A_ID, created.id);
    expect(archived.status).toBe('archived');
    expect(archived.archivedAt).not.toBeNull();

    // Re-archiving is a safe no-op
    await expect(
      RelationshipService.archiveRelationship(OWNER_A_ID, created.id)
    ).resolves.toBeUndefined();
  });

  // --------------------------------------------------------------------------
  // 9. Candidate Search Isolation
  // --------------------------------------------------------------------------
  it('prevents cross-owner candidate leakage during entity picker search (Amendment 35)', async () => {
    const candidatesA = await RelationshipService.searchCandidates(OWNER_A_ID, {
      sourceType: 'ARTICLE',
      sourceId: ownerAArticle1.id,
      relationshipTypeId: explainsType.id,
      targetType: 'PROJECT',
      query: 'Project',
      limit: 20,
    });

    // Should include Owner A's Project Gamma, but NOT Owner B's Project Iota
    expect(candidatesA.some((c) => c.id === ownerAProject1.id)).toBe(true);
    expect(candidatesA.some((c) => c.id === ownerBProject.id)).toBe(false);
  });

  // --------------------------------------------------------------------------
  // 10. Public Graph Traversal Privacy Matrix (6 Dimensions - Amendment 33)
  // --------------------------------------------------------------------------
  describe('Public Graph Traversal Privacy Matrix (Amendment 33)', () => {
    it('1. source draft + target published + edge public -> HIDDEN', async () => {
      // Draft Article -> Published Project
      const [draftArt] = await db
        .insert(schema.articles)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Draft Article 1',
          slug: `draft-art-${Date.now()}`,
          content: 'draft',
          visibility: 'public',
          publicationStatus: 'draft', // DRAFT
        })
        .returning();

      const created = await RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: explainsType.id,
        sourceType: 'ARTICLE',
        sourceId: draftArt.id,
        targetType: 'PROJECT',
        targetId: ownerAProject1.id,
        visibility: 'public',
      });

      const results = await RelationshipService.getPublicRelationshipsForEntity('PROJECT', ownerAProject1.id);
      expect(results.some((r) => r.id === created.id)).toBe(false);
    });

    it('2. source published + target draft + edge public -> HIDDEN', async () => {
      const [draftProj] = await db
        .insert(schema.projects)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Draft Project 2',
          slug: `draft-proj-${Date.now()}`,
          description: 'draft',
          visibility: 'public',
          publicationStatus: 'draft', // DRAFT
        })
        .returning();

      const created = await RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: explainsType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle1.id,
        targetType: 'PROJECT',
        targetId: draftProj.id,
        visibility: 'public',
      });

      const results = await RelationshipService.getPublicRelationshipsForEntity('ARTICLE', ownerAArticle1.id);
      expect(results.some((r) => r.id === created.id)).toBe(false);
    });

    it('3. source published + target published + edge private -> HIDDEN', async () => {
      const created = await RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: explainsType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle1.id,
        targetType: 'PROJECT',
        targetId: ownerAProject1.id,
        visibility: 'private', // PRIVATE EDGE
      });

      const results = await RelationshipService.getPublicRelationshipsForEntity('ARTICLE', ownerAArticle1.id);
      expect(results.some((r) => r.id === created.id)).toBe(false);
    });

    it('4. source published + target published + edge archived -> HIDDEN', async () => {
      const created = await RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: explainsType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle1.id,
        targetType: 'PROJECT',
        targetId: ownerAProject1.id,
        visibility: 'public',
      });

      await RelationshipService.archiveRelationship(OWNER_A_ID, created.id);

      const results = await RelationshipService.getPublicRelationshipsForEntity('ARTICLE', ownerAArticle1.id);
      expect(results.some((r) => r.id === created.id)).toBe(false);
    });

    it('5. source published + target unlisted + edge public -> HIDDEN (Amendment 26)', async () => {
      const [unlistedProj] = await db
        .insert(schema.projects)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Unlisted Project 5',
          slug: `unlisted-proj-${Date.now()}`,
          description: 'unlisted',
          visibility: 'unlisted', // UNLISTED
          publicationStatus: 'published',
        })
        .returning();

      const created = await RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: explainsType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle1.id,
        targetType: 'PROJECT',
        targetId: unlistedProj.id,
        visibility: 'public',
      });

      const results = await RelationshipService.getPublicRelationshipsForEntity('ARTICLE', ownerAArticle1.id);
      expect(results.some((r) => r.id === created.id)).toBe(false);
    });

    it('6. source published + target published + edge public active -> VISIBLE', async () => {
      const created = await RelationshipService.createRelationship(OWNER_A_ID, {
        relationshipTypeId: explainsType.id,
        sourceType: 'ARTICLE',
        sourceId: ownerAArticle1.id,
        targetType: 'PROJECT',
        targetId: ownerAProject1.id,
        visibility: 'public', // PUBLIC EDGE
      });

      const results = await RelationshipService.getPublicRelationshipsForEntity('ARTICLE', ownerAArticle1.id);
      expect(results.some((r) => r.id === created.id)).toBe(true);
      const match = results.find((r) => r.id === created.id);
      expect(match?.source.label).toBe('Owner A Article Alpha');
      expect(match?.target.label).toBe('Owner A Project Gamma');
    });
  });

  // --------------------------------------------------------------------------
  // 11. Health Diagnostics
  // --------------------------------------------------------------------------
  it('correctly diagnoses archived endpoints and privacy mismatches without mutating data (Amendment 24)', async () => {
    // 1. Create a public edge pointing to an archived article
    const [archivedArt] = await db
      .insert(schema.articles)
      .values({
        ownerId: OWNER_A_ID,
        title: 'Archived Article X',
        slug: `archived-art-${Date.now()}`,
        content: 'archived',
        visibility: 'public',
        publicationStatus: 'published',
        archivedAt: new Date(),
      })
      .returning();

    await RelationshipService.createRelationship(OWNER_A_ID, {
      relationshipTypeId: explainsType.id,
      sourceType: 'ARTICLE',
      sourceId: archivedArt.id,
      targetType: 'PROJECT',
      targetId: ownerAProject1.id,
      visibility: 'public',
    });

    const health = await RelationshipService.getRelationshipHealth(OWNER_A_ID);
    expect(health.totalActive).toBeGreaterThanOrEqual(1);
    expect(health.totalIssues).toBeGreaterThanOrEqual(1);

    const archivedIssue = health.issues.find((i) => i.issueCode === 'ARCHIVED_ENDPOINT');
    expect(archivedIssue).toBeDefined();
    expect(archivedIssue?.message).toContain('Archived Article X');
  });
});
