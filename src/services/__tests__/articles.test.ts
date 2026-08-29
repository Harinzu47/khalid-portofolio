import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import { articles, articleTags, articleProjects, projects, domains, skills, technologies, tags } from '@/db/schema';
import { ArticlesService } from '../articles.service';
import { eq } from 'drizzle-orm';

describe('ArticlesService Integration Tests', () => {
  const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
  let createdArticleId: string;
  let testProjectId: string;
  let testDomainId: string;
  let testSkillId: string;
  let testTechId: string;

  beforeAll(async () => {
    // Setup prerequisite entities
    const [proj] = await db
      .insert(projects)
      .values({
        ownerId: TEST_OWNER_ID,
        title: 'Article Test Project',
        slug: `art-proj-${Date.now()}`,
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    testProjectId = proj.id;

    const [dom] = await db
      .insert(domains)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Article Domain',
        slug: `art-dom-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    testDomainId = dom.id;

    const [sk] = await db
      .insert(skills)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Article Skill',
        slug: `art-sk-${Date.now()}`,
        category: 'backend',
        visibility: 'private',
      })
      .returning();
    testSkillId = sk.id;

    const [tc] = await db
      .insert(technologies)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Article Tech',
        slug: `art-tech-${Date.now()}`,
        category: 'language',
        visibility: 'private',
      })
      .returning();
    testTechId = tc.id;
  });

  afterAll(async () => {
    // Clean up
    if (createdArticleId) {
      await db.delete(articleTags).where(eq(articleTags.articleId, createdArticleId));
      await db.delete(articleProjects).where(eq(articleProjects.articleId, createdArticleId));
      await db.delete(articles).where(eq(articles.id, createdArticleId));
    }
    if (testProjectId) await db.delete(projects).where(eq(projects.id, testProjectId));
    if (testDomainId) await db.delete(domains).where(eq(domains.id, testDomainId));
    if (testSkillId) await db.delete(skills).where(eq(skills.id, testSkillId));
    if (testTechId) await db.delete(technologies).where(eq(technologies.id, testTechId));
  });

  it('creates an article with strict PRIVATE + DRAFT defaults and transactional junctions', async () => {
    const editorDTO = await ArticlesService.createArticle(TEST_OWNER_ID, {
      title: 'High-Throughput Message Pipelines',
      slug: `high-throughput-pipelines-${Date.now()}`,
      subtitle: 'Designing with Kafka and Rust',
      excerpt: 'A comprehensive study on streaming architecture',
      content: '# Introduction\n\nDetailed technical analysis of throughput.',
      readingTimeMinutes: 8,
      featured: true,
      visibility: 'private',
      domainIds: [testDomainId],
      skillIds: [testSkillId],
      technologyIds: [testTechId],
      tagNames: ['streaming', 'kafka'],
      projectIds: [testProjectId],
    });

    createdArticleId = editorDTO.id;

    expect(editorDTO.id).toBeDefined();
    expect(editorDTO.title).toBe('High-Throughput Message Pipelines');
    expect(editorDTO.publicationStatus).toBe('draft');
    expect(editorDTO.visibility).toBe('private');
    expect(editorDTO.featured).toBe(true);
    expect(editorDTO.readingTimeMinutes).toBe(8);
    expect(editorDTO.domains.length).toBe(1);
    expect(editorDTO.domains[0].id).toBe(testDomainId);
    expect(editorDTO.skills.length).toBe(1);
    expect(editorDTO.skills[0].id).toBe(testSkillId);
    expect(editorDTO.technologies.length).toBe(1);
    expect(editorDTO.technologies[0].id).toBe(testTechId);
    expect(editorDTO.projectIds).toContain(testProjectId);
    expect(editorDTO.tags.length).toBe(2);

    // Verify DTO privacy boundary: owner_id should not be exposed
    expect((editorDTO as any).ownerId).toBeUndefined();
    expect((editorDTO as any).owner_id).toBeUndefined();
  });

  it('updates an article scalars and relation sets while preserving DRAFT publication status', async () => {
    const updatedDTO = await ArticlesService.updateArticle(TEST_OWNER_ID, createdArticleId, {
      title: 'High-Throughput Message Pipelines v2',
      content: '# Introduction\n\nUpdated content with benchmarks.',
      readingTimeMinutes: 10,
      featured: false,
      visibility: 'public',
      domainIds: [],
      skillIds: [testSkillId],
      technologyIds: [testTechId],
      tagIds: [],
      tagNames: ['updated-tag'],
      projectIds: [],
    });

    expect(updatedDTO.title).toBe('High-Throughput Message Pipelines v2');
    expect(updatedDTO.readingTimeMinutes).toBe(10);
    expect(updatedDTO.featured).toBe(false);
    expect(updatedDTO.visibility).toBe('public');
    // Publication status is not modified by CRUD
    expect(updatedDTO.publicationStatus).toBe('draft');
    expect(updatedDTO.domains.length).toBe(0);
    expect(updatedDTO.projectIds.length).toBe(0);
  });

  it('soft-archives an article without hard-deleting the row', async () => {
    await ArticlesService.archiveArticle(TEST_OWNER_ID, createdArticleId);

    const fetched = await ArticlesService.getArticleEditorById(TEST_OWNER_ID, createdArticleId);
    expect(fetched.archivedAt).not.toBeNull();
  });
});
