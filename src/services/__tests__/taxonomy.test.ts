import { describe, it, expect, afterAll } from 'vitest';
import { TaxonomyService } from '../taxonomy.service';
import { db } from '@/db/client';
import { skills, domains, technologies, tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';

describe('TaxonomyService Vertical Slice Suite', () => {
  const createdSkillIds: string[] = [];
  const createdDomainIds: string[] = [];
  const createdTechIds: string[] = [];
  const createdTagIds: string[] = [];

  afterAll(async () => {
    for (const id of createdSkillIds) {
      await db.delete(skills).where(eq(skills.id, id));
    }
    for (const id of createdDomainIds) {
      await db.delete(domains).where(eq(domains.id, id));
    }
    for (const id of createdTechIds) {
      await db.delete(technologies).where(eq(technologies.id, id));
    }
    for (const id of createdTagIds) {
      await db.delete(tags).where(eq(tags.id, id));
    }
  });

  it('creates, retrieves, updates, and archives a Skill', async () => {
    const skill = await TaxonomyService.createSkill(TEST_OWNER_ID, {
      name: `Automated Test Skill ${Date.now()}`,
      category: 'Cloud Infrastructure',
      proficiencyLevel: 5,
      isFeatured: true,
      visibility: 'private',
      domainIds: [],
    });
    createdSkillIds.push(skill.id);

    expect(skill.id).toBeDefined();
    expect(skill.category).toBe('Cloud Infrastructure');
    expect(skill.proficiencyLevel).toBe(5);

    const fetched = await TaxonomyService.getSkillById(skill.id, TEST_OWNER_ID);
    expect(fetched.name).toBe(skill.name);

    const updated = await TaxonomyService.updateSkill(TEST_OWNER_ID, skill.id, {
      name: `${skill.name} (Updated)`,
      category: 'Cloud Infrastructure',
      proficiencyLevel: 4,
      isFeatured: false,
      visibility: 'private',
      domainIds: [],
    });
    expect(updated.proficiencyLevel).toBe(4);
    expect(updated.name).toContain('(Updated)');

    await TaxonomyService.archiveSkill(TEST_OWNER_ID, skill.id);
  });

  it('creates, retrieves, updates, and archives a Domain', async () => {
    const domain = await TaxonomyService.createDomain(TEST_OWNER_ID, {
      name: `Automated Test Domain ${Date.now()}`,
      description: 'Domain test suite validation',
      sortOrder: 10,
      visibility: 'private',
      skillIds: [],
    });
    createdDomainIds.push(domain.id);

    expect(domain.id).toBeDefined();
    expect(domain.sortOrder).toBe(10);

    const fetched = await TaxonomyService.getDomainById(domain.id, TEST_OWNER_ID);
    expect(fetched.name).toBe(domain.name);

    const updated = await TaxonomyService.updateDomain(TEST_OWNER_ID, domain.id, {
      name: `${domain.name} (Updated)`,
      sortOrder: 20,
      visibility: 'private',
      skillIds: [],
    });
    expect(updated.sortOrder).toBe(20);

    await TaxonomyService.archiveDomain(TEST_OWNER_ID, domain.id);
  });

  it('creates, retrieves, and updates a Technology', async () => {
    const tech = await TaxonomyService.createTechnology(TEST_OWNER_ID, {
      name: `Automated Test Tech ${Date.now()}`,
      category: 'Database',
      technologyType: 'RDBMS',
      description: 'Test database description',
      websiteUrl: 'https://example.com/tech',
      iconName: 'database',
      visibility: 'private',
    });
    createdTechIds.push(tech.id);

    expect(tech.id).toBeDefined();
    expect(tech.technologyType).toBe('RDBMS');

    const fetched = await TaxonomyService.getTechnologyById(tech.id, TEST_OWNER_ID);
    expect(fetched.name).toBe(tech.name);

    const updated = await TaxonomyService.updateTechnology(TEST_OWNER_ID, tech.id, {
      name: `${tech.name} (Updated)`,
      category: 'Database',
      technologyType: 'NoSQL',
      description: 'Updated description',
      websiteUrl: 'https://example.com/tech2',
      iconName: 'database2',
      visibility: 'private',
    });
    expect(updated.technologyType).toBe('NoSQL');

    await TaxonomyService.archiveTechnology(TEST_OWNER_ID, tech.id);
  });

  it('creates, retrieves, and updates a Tag', async () => {
    const tag = await TaxonomyService.createTag(TEST_OWNER_ID, {
      name: `test-tag-${Date.now()}`,
      description: 'Test tag description',
      visibility: 'private',
    });
    createdTagIds.push(tag.id);

    expect(tag.id).toBeDefined();

    const fetched = await TaxonomyService.getTagById(tag.id, TEST_OWNER_ID);
    expect(fetched.name).toBe(tag.name);

    const updated = await TaxonomyService.updateTag(TEST_OWNER_ID, tag.id, {
      name: `${tag.name}-updated`,
      description: 'Updated tag description',
      visibility: 'private',
    });
    expect(updated.name).toContain('-updated');

    await TaxonomyService.archiveTag(TEST_OWNER_ID, tag.id);
  });
});
