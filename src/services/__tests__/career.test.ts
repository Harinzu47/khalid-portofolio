import { describe, it, expect, afterAll } from 'vitest';
import { CareerService } from '../career.service';
import { db } from '@/db/client';
import { careerExperiences, organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';

const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';

describe('CareerService Vertical Slice Suite', () => {
  const createdOrgIds: string[] = [];
  const createdExpIds: string[] = [];

  afterAll(async () => {
    for (const id of createdExpIds) {
      await db.delete(careerExperiences).where(eq(careerExperiences.id, id));
    }
    for (const id of createdOrgIds) {
      await db.delete(organizations).where(eq(organizations.id, id));
    }
  });

  it('creates organization and career experience with full DTO verification', async () => {
    // 1. Create Organization
    const org = await CareerService.createOrganization(TEST_OWNER_ID, {
      name: `Test Cloud Corp ${Date.now()}`,
      organizationType: 'Enterprise',
      location: 'Jakarta, Indonesia',
      description: 'Cloud infrastructure provider',
      websiteUrl: 'https://testcorp.com',
      visibility: 'private',
    });
    createdOrgIds.push(org.id);

    expect(org.id).toBeDefined();
    expect(org.organizationType).toBe('Enterprise');

    // 2. Create Career Experience
    const exp = await CareerService.createCareerExperience(TEST_OWNER_ID, {
      organizationId: org.id,
      position: 'Principal Infrastructure Engineer',
      employmentType: 'Full-time',
      location: 'Jakarta (Hybrid)',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      isCurrent: false,
      description: 'Led cloud engineering team and infrastructure migration',
      responsibilities: [
        'Migrated 20+ services to Kubernetes cluster',
        'Implemented BGP multihop routing and stateful firewalls',
      ],
      sortOrder: 1,
      visibility: 'private',
      projectIds: [],
      skillIds: [],
      domainIds: [],
      technologyIds: [],
    });
    createdExpIds.push(exp.id);

    expect(exp.id).toBeDefined();
    expect(exp.publicationStatus).toBe('draft');
    expect(exp.position).toBe('Principal Infrastructure Engineer');
    expect(exp.organization.id).toBe(org.id);
    expect(exp.responsibilities).toHaveLength(2);

    // 3. Update Career Experience
    const updated = await CareerService.updateCareerExperience(TEST_OWNER_ID, exp.id, {
      organizationId: org.id,
      position: 'Staff Infrastructure Engineer',
      employmentType: 'Full-time',
      location: 'Remote',
      startDate: '2025-01-01',
      isCurrent: true,
      description: 'Updated description',
      responsibilities: ['Architected cloud infrastructure'],
      sortOrder: 2,
      visibility: 'private',
      projectIds: [],
      skillIds: [],
      domainIds: [],
      technologyIds: [],
    });

    expect(updated.position).toBe('Staff Infrastructure Engineer');
    expect(updated.isCurrent).toBe(true);

    // 4. Archive Career Experience
    await CareerService.archiveCareerExperience(TEST_OWNER_ID, exp.id);
    const archived = await CareerService.getAdminCareerExperienceById(TEST_OWNER_ID, exp.id);
    expect(archived.archivedAt).not.toBeNull();
  });
});
