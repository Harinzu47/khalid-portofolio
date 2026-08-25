import { db } from '@/db/client';
import { organizations, careerExperiences } from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { CareerExperienceFormInput, OrganizationFormInput } from '@/validations/career';

export class CareerService {
  /**
   * Fetches public career experiences ordered chronologically for timeline display.
   */
  static async getPublicCareerTimeline() {
    return await db.query.careerExperiences.findMany({
      where: isNull(careerExperiences.deletedAt),
      orderBy: [
        desc(careerExperiences.isCurrent),
        desc(careerExperiences.startDate),
        careerExperiences.sortOrder,
      ],
      with: {
        organization: true,
      },
    });
  }

  /**
   * Fetches all career experiences for the admin workspace list.
   */
  static async getAdminCareerExperiences(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = isNull(careerExperiences.deletedAt);

    const [data, countResult] = await Promise.all([
      db.query.careerExperiences.findMany({
        where: conditions,
        orderBy: [
          desc(careerExperiences.isCurrent),
          desc(careerExperiences.startDate),
        ],
        limit,
        offset,
        with: {
          organization: true,
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(careerExperiences)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Fetches a single career experience by ID for editing.
   */
  static async getAdminCareerExperienceById(id: string) {
    const exp = await db.query.careerExperiences.findFirst({
      where: and(eq(careerExperiences.id, id), isNull(careerExperiences.deletedAt)),
      with: {
        organization: true,
      },
    });

    if (!exp) {
      throw new NotFoundError('Career Experience', id);
    }

    return exp;
  }

  /**
   * Fetches all organizations for selectors.
   */
  static async getOrganizations() {
    return await db.select().from(organizations).orderBy(organizations.name);
  }

  /**
   * Creates a new organization entity.
   */
  static async createOrganization(input: OrganizationFormInput, actorId?: string) {
    const finalSlug = input.slug?.trim() || slugify(input.name);

    const existing = await db.query.organizations.findFirst({
      where: eq(organizations.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`An organization with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const [newOrg] = await tx
        .insert(organizations)
        .values({
          name: input.name,
          slug: finalSlug,
          description: input.description || null,
          websiteUrl: input.websiteUrl || null,
          logoPath: input.logoPath || null,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'ORGANIZATION_CREATE',
        entityType: 'organization',
        entityId: newOrg.id,
        newValues: newOrg,
      });

      return newOrg;
    });
  }

  /**
   * Creates a new career experience entry, creating organization inline if needed.
   */
  static async createCareerExperience(input: CareerExperienceFormInput, actorId?: string) {
    return await db.transaction(async (tx) => {
      let organizationId = input.organizationId;

      // Handle inline organization creation
      if (!organizationId && input.newOrganizationName) {
        const orgSlug = slugify(input.newOrganizationName);
        let org = await tx.query.organizations.findFirst({
          where: eq(organizations.slug, orgSlug),
        });

        if (!org) {
          const [createdOrg] = await tx
            .insert(organizations)
            .values({
              name: input.newOrganizationName.trim(),
              slug: orgSlug,
            })
            .returning();
          org = createdOrg;
        }
        organizationId = org.id;
      }

      if (!organizationId) {
        throw new ConflictError('A valid organization is required.');
      }

      const endDate = input.isCurrent ? null : input.endDate || null;

      const [newExp] = await tx
        .insert(careerExperiences)
        .values({
          organizationId,
          position: input.position,
          employmentType: input.employmentType || 'Full-time',
          location: input.location || null,
          startDate: input.startDate,
          endDate,
          isCurrent: input.isCurrent,
          description: input.description || null,
          sortOrder: input.sortOrder || 0,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'CAREER_EXPERIENCE_CREATE',
        entityType: 'career_experience',
        entityId: newExp.id,
        newValues: newExp,
      });

      return newExp;
    });
  }

  /**
   * Updates an existing career experience entry.
   */
  static async updateCareerExperience(id: string, input: CareerExperienceFormInput, actorId?: string) {
    const existing = await db.query.careerExperiences.findFirst({
      where: and(eq(careerExperiences.id, id), isNull(careerExperiences.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundError('Career Experience', id);
    }

    return await db.transaction(async (tx) => {
      let organizationId = input.organizationId;

      if (!organizationId && input.newOrganizationName) {
        const orgSlug = slugify(input.newOrganizationName);
        let org = await tx.query.organizations.findFirst({
          where: eq(organizations.slug, orgSlug),
        });

        if (!org) {
          const [createdOrg] = await tx
            .insert(organizations)
            .values({
              name: input.newOrganizationName.trim(),
              slug: orgSlug,
            })
            .returning();
          org = createdOrg;
        }
        organizationId = org.id;
      }

      if (!organizationId) {
        organizationId = existing.organizationId;
      }

      const endDate = input.isCurrent ? null : input.endDate || null;

      const [updatedExp] = await tx
        .update(careerExperiences)
        .set({
          organizationId,
          position: input.position,
          employmentType: input.employmentType || 'Full-time',
          location: input.location || null,
          startDate: input.startDate,
          endDate,
          isCurrent: input.isCurrent,
          description: input.description || null,
          sortOrder: input.sortOrder || 0,
          updatedAt: new Date(),
        })
        .where(eq(careerExperiences.id, id))
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'CAREER_EXPERIENCE_UPDATE',
        entityType: 'career_experience',
        entityId: id,
        oldValues: existing,
        newValues: updatedExp,
      });

      return updatedExp;
    });
  }

  /**
   * Soft deletes or permanently deletes a career experience entry.
   */
  static async deleteCareerExperience(id: string, actorId?: string, permanent = false) {
    const existing = await db.query.careerExperiences.findFirst({
      where: eq(careerExperiences.id, id),
    });

    if (!existing) {
      throw new NotFoundError('Career Experience', id);
    }

    return await db.transaction(async (tx) => {
      if (permanent) {
        await tx.delete(careerExperiences).where(eq(careerExperiences.id, id));
      } else {
        await tx
          .update(careerExperiences)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(careerExperiences.id, id));
      }

      await AuditService.record(tx, {
        actorId,
        action: permanent ? 'CAREER_PERMANENT_DELETE' : 'CAREER_SOFT_DELETE',
        entityType: 'career_experience',
        entityId: id,
        oldValues: existing,
      });
    });
  }
}
