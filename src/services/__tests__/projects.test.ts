import { describe, it, expect, afterAll } from 'vitest';
import { ProjectsService } from '../projects.service';
import { TaxonomyService } from '../taxonomy.service';
import { db } from '@/db/client';
import { projects, skills, technologies, domains } from '@/db/schema';
import { eq } from 'drizzle-orm';

const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';

describe('ProjectsService Vertical Slice Suite', () => {
  const createdProjectIds: string[] = [];
  const createdSkillIds: string[] = [];
  const createdTechIds: string[] = [];
  const createdDomainIds: string[] = [];

  afterAll(async () => {
    for (const id of createdProjectIds) {
      await db.delete(projects).where(eq(projects.id, id));
    }
    for (const id of createdSkillIds) {
      await db.delete(skills).where(eq(skills.id, id));
    }
    for (const id of createdTechIds) {
      await db.delete(technologies).where(eq(technologies.id, id));
    }
    for (const id of createdDomainIds) {
      await db.delete(domains).where(eq(domains.id, id));
    }
  });

  it('creates project with junction synchronizations and verifies DTO output', async () => {
    // 1. Setup taxonomy dependencies
    const skill = await TaxonomyService.createSkill(TEST_OWNER_ID, {
      name: `ProjSkill ${Date.now()}`,
      category: 'Software Engineering',
      isFeatured: false,
      visibility: 'private',
      domainIds: [],
    });
    createdSkillIds.push(skill.id);

    const tech = await TaxonomyService.createTechnology(TEST_OWNER_ID, {
      name: `ProjTech ${Date.now()}`,
      category: 'Cloud',
      visibility: 'private',
    });
    createdTechIds.push(tech.id);

    const domain = await TaxonomyService.createDomain(TEST_OWNER_ID, {
      name: `ProjDomain ${Date.now()}`,
      sortOrder: 1,
      visibility: 'private',
      skillIds: [],
    });
    createdDomainIds.push(domain.id);

    // 2. Create Project
    const project = await ProjectsService.createProject(TEST_OWNER_ID, {
      title: `E2E Architecture Slice ${Date.now()}`,
      shortDescription: 'Short overview of the architecture slice',
      description: 'Full description of the distributed slice',
      projectType: 'Production Service',
      problemStatement: 'High latency and unindexed operations',
      solution: 'Composite B-tree indexing with connection pooling',
      architecture: 'Distributed microservices with Next.js 16 App Router',
      role: 'Staff Infrastructure Architect',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      repositoryUrl: 'https://github.com/test/repo',
      liveUrl: 'https://test.example.com',
      featured: true,
      sortOrder: 5,
      visibility: 'private',
      domainIds: [domain.id],
      skillIds: [skill.id],
      technologyIds: [tech.id],
      tagIds: [],
      links: [
        { label: 'Documentation', url: 'https://docs.example.com', linkType: 'docs' },
      ],
    });
    createdProjectIds.push(project.id);

    expect(project.id).toBeDefined();
    expect(project.publicationStatus).toBe('draft'); // Invariant: Default draft
    expect(project.skills).toHaveLength(1);
    expect(project.skills[0].id).toBe(skill.id);
    expect(project.technologies).toHaveLength(1);
    expect(project.technologies[0].id).toBe(tech.id);
    expect(project.domains).toHaveLength(1);
    expect(project.domains[0].id).toBe(domain.id);

    // 3. Update Project
    const updated = await ProjectsService.updateProject(TEST_OWNER_ID, project.id, {
      title: `${project.title} (Updated)`,
      status: 'completed',
      featured: false,
      sortOrder: 10,
      visibility: 'private',
      domainIds: [domain.id],
      skillIds: [], // Remove skill junction
      technologyIds: [tech.id],
      tagIds: [],
      links: [],
    });

    expect(updated.title).toContain('(Updated)');
    expect(updated.status).toBe('completed');
    expect(updated.skills).toHaveLength(0);
    expect(updated.technologies).toHaveLength(1);

    // 4. Archive Project
    await ProjectsService.archiveProject(TEST_OWNER_ID, project.id);
    const archived = await ProjectsService.getProjectEditorById(TEST_OWNER_ID, project.id);
    expect(archived.archivedAt).not.toBeNull();
  });
});
