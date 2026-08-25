import { db } from '@/db/client';
import {
  projects,
  projectTechnologies,
  projectSkills,
  projectLinks,
  technologies,
  skills,
} from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { ProjectFormInput } from '@/validations/project';

export class ProjectsService {
  /**
   * Fetches public projects for the portfolio feed.
   */
  static async getPublicProjects(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 12);

    const conditions = and(
      eq(projects.status, 'completed'),
      sql`${projects.publishedAt} IS NOT NULL`,
      isNull(projects.deletedAt)
    );

    const [data, countResult] = await Promise.all([
      db.query.projects.findMany({
        where: conditions,
        orderBy: [desc(projects.publishedAt), desc(projects.createdAt)],
        limit,
        offset,
        with: {
          technologies: {
            with: {
              technology: true,
            },
          },
          skills: {
            with: {
              skill: true,
            },
          },
          links: true,
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Fetches a single public project by slug with full case study relations.
   */
  static async getPublicProjectBySlug(slug: string) {
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.slug, slug),
        eq(projects.status, 'completed'),
        sql`${projects.publishedAt} IS NOT NULL`,
        isNull(projects.deletedAt)
      ),
      with: {
        technologies: {
          with: {
            technology: true,
          },
        },
        skills: {
          with: {
            skill: true,
          },
        },
        media: {
          with: {
            media: true,
          },
        },
        links: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Project', slug);
    }

    return project;
  }

  /**
   * Fetches all projects for the admin workspace list.
   */
  static async getAdminProjects(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 20);

    const conditions = isNull(projects.deletedAt);

    const [data, countResult] = await Promise.all([
      db.query.projects.findMany({
        where: conditions,
        orderBy: [desc(projects.updatedAt)],
        limit,
        offset,
        with: {
          technologies: {
            with: {
              technology: true,
            },
          },
          links: true,
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Fetches project by ID for admin edit form.
   */
  static async getAdminProjectById(id: string) {
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), isNull(projects.deletedAt)),
      with: {
        technologies: true,
        skills: true,
        links: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Project', id);
    }

    return project;
  }

  /**
   * Creates a new project and syncs its junction relations atomically.
   */
  static async createProject(input: ProjectFormInput, actorId?: string) {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    // Check slug uniqueness
    const existing = await db.query.projects.findFirst({
      where: eq(projects.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`A project with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const publishedAt = input.published ? new Date() : null;

      const [newProject] = await tx
        .insert(projects)
        .values({
          title: input.title,
          slug: finalSlug,
          shortDescription: input.shortDescription || null,
          description: input.description || null,
          problemStatement: input.problemStatement || null,
          solution: input.solution || null,
          architecture: input.architecture || null,
          role: input.role || null,
          status: input.status,
          startDate: input.startDate || null,
          endDate: input.endDate || null,
          repositoryUrl: input.repositoryUrl || null,
          liveUrl: input.liveUrl || null,
          featured: input.featured,
          publishedAt,
        })
        .returning();

      // Sync technologies
      if (input.technologyIds.length > 0) {
        await tx.insert(projectTechnologies).values(
          input.technologyIds.map((techId) => ({
            projectId: newProject.id,
            technologyId: techId,
          }))
        );
      }

      // Sync skills
      if (input.skillIds.length > 0) {
        await tx.insert(projectSkills).values(
          input.skillIds.map((skillId) => ({
            projectId: newProject.id,
            skillId,
          }))
        );
      }

      // Sync links
      if (input.links.length > 0) {
        await tx.insert(projectLinks).values(
          input.links.map((link, idx) => ({
            projectId: newProject.id,
            label: link.label,
            url: link.url,
            linkType: link.linkType || null,
            sortOrder: idx,
          }))
        );
      }

      // Record Audit Log
      await AuditService.record(tx, {
        actorId,
        action: 'PROJECT_CREATE',
        entityType: 'project',
        entityId: newProject.id,
        newValues: newProject,
      });

      return newProject;
    });
  }

  /**
   * Updates an existing project and its junction relations atomically.
   */
  static async updateProject(id: string, input: ProjectFormInput, actorId?: string) {
    const existing = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), isNull(projects.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    const finalSlug = input.slug?.trim() || slugify(input.title);

    // Check slug collision with other records
    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.projects.findFirst({
        where: and(eq(projects.slug, finalSlug), sql`${projects.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already taken by another project.`);
      }
    }

    return await db.transaction(async (tx) => {
      const publishedAt = input.published
        ? existing.publishedAt || new Date()
        : null;

      const [updatedProject] = await tx
        .update(projects)
        .set({
          title: input.title,
          slug: finalSlug,
          shortDescription: input.shortDescription || null,
          description: input.description || null,
          problemStatement: input.problemStatement || null,
          solution: input.solution || null,
          architecture: input.architecture || null,
          role: input.role || null,
          status: input.status,
          startDate: input.startDate || null,
          endDate: input.endDate || null,
          repositoryUrl: input.repositoryUrl || null,
          liveUrl: input.liveUrl || null,
          featured: input.featured,
          publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      // Reset and sync technologies
      await tx.delete(projectTechnologies).where(eq(projectTechnologies.projectId, id));
      if (input.technologyIds.length > 0) {
        await tx.insert(projectTechnologies).values(
          input.technologyIds.map((techId) => ({
            projectId: id,
            technologyId: techId,
          }))
        );
      }

      // Reset and sync skills
      await tx.delete(projectSkills).where(eq(projectSkills.projectId, id));
      if (input.skillIds.length > 0) {
        await tx.insert(projectSkills).values(
          input.skillIds.map((skillId) => ({
            projectId: id,
            skillId,
          }))
        );
      }

      // Reset and sync links
      await tx.delete(projectLinks).where(eq(projectLinks.projectId, id));
      if (input.links.length > 0) {
        await tx.insert(projectLinks).values(
          input.links.map((link, idx) => ({
            projectId: id,
            label: link.label,
            url: link.url,
            linkType: link.linkType || null,
            sortOrder: idx,
          }))
        );
      }

      // Record Audit Log
      await AuditService.record(tx, {
        actorId,
        action: 'PROJECT_UPDATE',
        entityType: 'project',
        entityId: id,
        oldValues: existing,
        newValues: updatedProject,
      });

      return updatedProject;
    });
  }

  /**
   * Soft deletes or permanently deletes a project.
   */
  static async deleteProject(id: string, actorId?: string, permanent = false) {
    const existing = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    return await db.transaction(async (tx) => {
      if (permanent) {
        await tx.delete(projects).where(eq(projects.id, id));
      } else {
        await tx
          .update(projects)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(projects.id, id));
      }

      await AuditService.record(tx, {
        actorId,
        action: permanent ? 'PROJECT_PERMANENT_DELETE' : 'PROJECT_SOFT_DELETE',
        entityType: 'project',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Fetches all available technologies and skills for project form selectors.
   */
  static async getTaxonomyOptions() {
    const [allTechs, allSkills] = await Promise.all([
      db.select().from(technologies).orderBy(technologies.name),
      db.select().from(skills).orderBy(skills.name),
    ]);

    return {
      technologies: allTechs,
      skills: allSkills,
    };
  }
}
