import { db } from '@/db/client';
import {
  organizations,
  careerExperiences,
  experienceProjects,
  experienceSkills,
  experienceDomains,
  experienceTechnologies,
  projects,
  skills,
  domains,
  technologies,
} from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { CareerExperienceFormInput, OrganizationFormInput } from '@/validations/career';
import type {
  OrganizationDTO,
  ExperienceListItemDTO,
  ExperienceEditorDTO,
  PaginatedResultDTO,
} from '@/types/dtos';

export class CareerService {
  /**
   * Fetches public career experiences ordered chronologically for timeline display.
   */
  static async getPublicCareerTimeline(): Promise<ExperienceListItemDTO[]> {
    const rows = await db.query.careerExperiences.findMany({
      where: and(
        eq(careerExperiences.visibility, 'public'),
        eq(careerExperiences.publicationStatus, 'published'),
        isNull(careerExperiences.deletedAt),
        isNull(careerExperiences.archivedAt)
      ),
      orderBy: [
        desc(careerExperiences.isCurrent),
        desc(careerExperiences.startDate),
        careerExperiences.sortOrder,
      ],
      with: {
        organization: true,
      },
    });

    return rows.map((e) => ({
      id: e.id,
      position: e.position,
      organizationId: e.organizationId,
      organization: {
        id: e.organization.id,
        name: e.organization.name,
        slug: e.organization.slug,
      },
      employmentType: e.employmentType,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
      description: e.description,
      visibility: e.visibility as any,
      publicationStatus: e.publicationStatus as any,
      sortOrder: e.sortOrder,
      updatedAt: e.updatedAt.toISOString(),
    }));
  }

  /**
   * Fetches all career experiences for the admin workspace list (Owner scoped).
   */
  static async getAdminCareerExperiences(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<ExperienceListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = and(
      eq(careerExperiences.ownerId, ownerId),
      isNull(careerExperiences.deletedAt)
    );

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
    const formattedData: ExperienceListItemDTO[] = data.map((e) => ({
      id: e.id,
      position: e.position,
      organizationId: e.organizationId,
      organization: {
        id: e.organization.id,
        name: e.organization.name,
        slug: e.organization.slug,
      },
      employmentType: e.employmentType,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
      visibility: e.visibility as any,
      publicationStatus: e.publicationStatus as any,
      sortOrder: e.sortOrder,
      updatedAt: e.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Fetches a single career experience by ID for editing (Owner scoped).
   */
  static async getAdminCareerExperienceById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<ExperienceEditorDTO> {
    const exp = await executor.query.careerExperiences.findFirst({
      where: and(
        eq(careerExperiences.id, id),
        eq(careerExperiences.ownerId, ownerId),
        isNull(careerExperiences.deletedAt)
      ),
      with: {
        organization: true,
        projects: {
          with: {
            project: true,
          },
        },
        skills: {
          with: {
            skill: true,
          },
        },
        domains: {
          with: {
            domain: true,
          },
        },
        technologies: {
          with: {
            technology: true,
          },
        },
      },
    });

    if (!exp) {
      throw new NotFoundError('Career Experience', id);
    }

    return {
      id: exp.id,
      position: exp.position,
      organizationId: exp.organizationId,
      organization: {
        id: exp.organization.id,
        name: exp.organization.name,
        slug: exp.organization.slug,
      },
      employmentType: exp.employmentType,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent,
      description: exp.description,
      responsibilities: Array.isArray(exp.responsibilities) ? (exp.responsibilities as string[]) : [],
      sortOrder: exp.sortOrder,
      visibility: exp.visibility as any,
      publicationStatus: exp.publicationStatus as any,
      projects: (exp.projects || []).map((p: any) => ({
        id: p.project.id,
        title: p.project.title,
        slug: p.project.slug,
      })),
      skills: (exp.skills || []).map((s: any) => ({
        id: s.skill.id,
        name: s.skill.name,
        slug: s.skill.slug,
      })),
      domains: (exp.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      technologies: (exp.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
        iconName: t.technology.iconName,
      })),
      publishedAt: exp.publishedAt ? exp.publishedAt.toISOString() : null,
      archivedAt: exp.archivedAt ? exp.archivedAt.toISOString() : null,
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString(),
    };
  }

  /**
   * Fetches all organizations for selectors.
   */
  static async getOrganizations(ownerId?: string): Promise<OrganizationDTO[]> {
    const conditions = [isNull(organizations.archivedAt)];
    if (ownerId) {
      conditions.push(eq(organizations.ownerId, ownerId));
    }

    const rows = await db.query.organizations.findMany({
      where: and(...conditions),
      orderBy: [organizations.name],
    });

    return rows.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      organizationType: o.organizationType,
      location: o.location,
      description: o.description,
      websiteUrl: o.websiteUrl,
      logoPath: o.logoPath,
      visibility: o.visibility as any,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  }

  /**
   * Creates a new organization entity (Owner scoped).
   */
  static async createOrganization(
    ownerId: string,
    input: OrganizationFormInput,
    actorId?: string
  ): Promise<OrganizationDTO> {
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
          ownerId,
          name: input.name.trim(),
          slug: finalSlug,
          organizationType: input.organizationType || null,
          location: input.location || null,
          description: input.description || null,
          websiteUrl: input.websiteUrl || null,
          logoPath: input.logoPath || null,
          visibility: input.visibility || 'private',
        })
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ORGANIZATION_CREATE',
        entityType: 'organization',
        entityId: newOrg.id,
        newValues: newOrg,
      });

      return {
        id: newOrg.id,
        name: newOrg.name,
        slug: newOrg.slug,
        organizationType: newOrg.organizationType,
        location: newOrg.location,
        description: newOrg.description,
        websiteUrl: newOrg.websiteUrl,
        logoPath: newOrg.logoPath,
        visibility: newOrg.visibility as any,
        createdAt: newOrg.createdAt.toISOString(),
        updatedAt: newOrg.updatedAt.toISOString(),
      };
    });
  }

  /**
   * Creates a new career experience entry with transactional junction sync.
   */
  static async createCareerExperience(
    ownerId: string,
    input: CareerExperienceFormInput,
    actorId?: string
  ): Promise<ExperienceEditorDTO> {
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
              ownerId,
              name: input.newOrganizationName.trim(),
              slug: orgSlug,
              visibility: 'private',
            })
            .returning();
          org = createdOrg;
        }
        organizationId = org.id;
      }

      if (!organizationId) {
        throw new ConflictError('A valid organization is required.');
      }

      const [newExp] = await tx
        .insert(careerExperiences)
        .values({
          ownerId,
          organizationId,
          position: input.position.trim(),
          employmentType: input.employmentType || 'Full-time',
          location: input.location || null,
          startDate: input.startDate,
          endDate: input.endDate || null,
          isCurrent: input.isCurrent || false,
          description: input.description || null,
          responsibilities: input.responsibilities || [],
          sortOrder: input.sortOrder || 0,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Enforce DRAFT default per Amendment 3
        })
        .returning();

      // Synchronize Junctions
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(experienceProjects).values(
          input.projectIds.map((projectId) => ({
            experienceId: newExp.id,
            projectId,
          }))
        );
      }

      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(experienceSkills).values(
          input.skillIds.map((skillId) => ({
            experienceId: newExp.id,
            skillId,
          }))
        );
      }

      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(experienceDomains).values(
          input.domainIds.map((domainId) => ({
            experienceId: newExp.id,
            domainId,
          }))
        );
      }

      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(experienceTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            experienceId: newExp.id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'CAREER_EXPERIENCE_CREATE',
        entityType: 'career_experience',
        entityId: newExp.id,
        newValues: newExp,
      });

      return await CareerService.getAdminCareerExperienceById(ownerId, newExp.id, tx);
    });
  }

  /**
   * Updates an existing career experience (Owner scoped).
   * Note: Does NOT modify publicationStatus (reserved for PublishingService per Amendment 3).
   */
  static async updateCareerExperience(
    ownerId: string,
    id: string,
    input: CareerExperienceFormInput,
    actorId?: string
  ): Promise<ExperienceEditorDTO> {
    const existing = await db.query.careerExperiences.findFirst({
      where: and(
        eq(careerExperiences.id, id),
        eq(careerExperiences.ownerId, ownerId),
        isNull(careerExperiences.deletedAt)
      ),
    });

    if (!existing) {
      throw new NotFoundError('Career Experience', id);
    }

    return await db.transaction(async (tx) => {
      let organizationId = input.organizationId || existing.organizationId;

      if (!input.organizationId && input.newOrganizationName) {
        const orgSlug = slugify(input.newOrganizationName);
        let org = await tx.query.organizations.findFirst({
          where: eq(organizations.slug, orgSlug),
        });

        if (!org) {
          const [createdOrg] = await tx
            .insert(organizations)
            .values({
              ownerId,
              name: input.newOrganizationName.trim(),
              slug: orgSlug,
              visibility: 'private',
            })
            .returning();
          org = createdOrg;
        }
        organizationId = org.id;
      }

      const [updatedExp] = await tx
        .update(careerExperiences)
        .set({
          organizationId,
          position: input.position.trim(),
          employmentType: input.employmentType || existing.employmentType,
          location: input.location || null,
          startDate: input.startDate,
          endDate: input.endDate || null,
          isCurrent: input.isCurrent ?? existing.isCurrent,
          description: input.description || null,
          responsibilities: input.responsibilities || existing.responsibilities,
          sortOrder: input.sortOrder ?? existing.sortOrder,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(careerExperiences.id, id), eq(careerExperiences.ownerId, ownerId)))
        .returning();

      // 1. Sync Projects
      await tx.delete(experienceProjects).where(eq(experienceProjects.experienceId, id));
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(experienceProjects).values(
          input.projectIds.map((projectId) => ({
            experienceId: id,
            projectId,
          }))
        );
      }

      // 2. Sync Skills
      await tx.delete(experienceSkills).where(eq(experienceSkills.experienceId, id));
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(experienceSkills).values(
          input.skillIds.map((skillId) => ({
            experienceId: id,
            skillId,
          }))
        );
      }

      // 3. Sync Domains
      await tx.delete(experienceDomains).where(eq(experienceDomains.experienceId, id));
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(experienceDomains).values(
          input.domainIds.map((domainId) => ({
            experienceId: id,
            domainId,
          }))
        );
      }

      // 4. Sync Technologies
      await tx.delete(experienceTechnologies).where(eq(experienceTechnologies.experienceId, id));
      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(experienceTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            experienceId: id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'CAREER_EXPERIENCE_UPDATE',
        entityType: 'career_experience',
        entityId: id,
        oldValues: existing,
        newValues: updatedExp,
      });

      return await CareerService.getAdminCareerExperienceById(ownerId, id, tx);
    });
  }

  /**
   * Archives a career experience (Owner scoped).
   */
  static async archiveCareerExperience(
    ownerId: string,
    id: string,
    actorId?: string
  ): Promise<void> {
    const existing = await db.query.careerExperiences.findFirst({
      where: and(eq(careerExperiences.id, id), eq(careerExperiences.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Career Experience', id);

    await db.transaction(async (tx) => {
      await tx
        .update(careerExperiences)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(careerExperiences.id, id), eq(careerExperiences.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'CAREER_EXPERIENCE_ARCHIVE',
        entityType: 'career_experience',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Deletes a career experience (Soft delete, Owner scoped).
   */
  static async deleteCareerExperience(
    ownerId: string,
    id: string,
    actorId?: string
  ): Promise<void> {
    const existing = await db.query.careerExperiences.findFirst({
      where: and(eq(careerExperiences.id, id), eq(careerExperiences.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Career Experience', id);

    await db.transaction(async (tx) => {
      await tx
        .update(careerExperiences)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(careerExperiences.id, id), eq(careerExperiences.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'CAREER_EXPERIENCE_DELETE',
        entityType: 'career_experience',
        entityId: id,
        oldValues: existing,
      });
    });
  }
}
