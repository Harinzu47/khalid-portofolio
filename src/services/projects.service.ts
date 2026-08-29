import { db } from '@/db/client';
import {
  projects,
  projectTechnologies,
  projectSkills,
  projectDomains,
  projectTags,
  projectLinks,
  technologies,
  skills,
  domains,
  tags,
  projectCaseStudies,
  experienceProjects,
  careerExperiences,
} from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { ProjectFormInput } from '@/validations/project';
import type {
  ProjectListItemDTO,
  ProjectEditorDTO,
  PaginatedResultDTO,
  EntityRefDTO,
} from '@/types/dtos';

export class ProjectsService {
  /**
   * Helper query for admin selectors.
   */
  static async getProjectsSelector(ownerId: string): Promise<{ id: string; name: string; slug?: string }[]> {
    const data = await db.query.projects.findMany({
      where: and(
        eq(projects.ownerId, ownerId),
        isNull(projects.deletedAt),
        isNull(projects.archivedAt)
      ),
      columns: { id: true, title: true, slug: true },
      orderBy: [desc(projects.createdAt)],
    });
    return data.map((p) => ({ id: p.id, name: p.title, slug: p.slug }));
  }

  /**
   * Fetches public projects for the portfolio feed.
   */
  static async getPublicProjects(params?: PaginationParams): Promise<PaginatedResultDTO<ProjectListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 12);

    const conditions = and(
      eq(projects.visibility, 'public'),
      eq(projects.publicationStatus, 'published'),
      isNull(projects.deletedAt),
      isNull(projects.archivedAt)
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
          domains: {
            with: {
              domain: true,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    const formattedData: ProjectListItemDTO[] = data.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      projectType: p.projectType,
      visibility: p.visibility as any,
      publicationStatus: p.publicationStatus as any,
      featured: p.featured,
      domains: (p.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      technologies: (p.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
        iconName: t.technology.iconName,
      })),
      updatedAt: p.updatedAt.toISOString(),
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Fetches all projects for the admin workspace (Owner scoped).
   */
  static async getAdminProjects(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<ProjectListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 20);

    const conditions = and(eq(projects.ownerId, ownerId), isNull(projects.deletedAt));

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
          domains: {
            with: {
              domain: true,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    const formattedData: ProjectListItemDTO[] = data.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      projectType: p.projectType,
      visibility: p.visibility as any,
      publicationStatus: p.publicationStatus as any,
      featured: p.featured,
      domains: (p.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      technologies: (p.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
        iconName: t.technology.iconName,
      })),
      updatedAt: p.updatedAt.toISOString(),
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Fetches project by ID for admin edit form (Owner scoped).
   */
  static async getProjectEditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<ProjectEditorDTO> {
    const project = await executor.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.ownerId, ownerId), isNull(projects.deletedAt)),
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
        domains: {
          with: {
            domain: true,
          },
        },
        tags: {
          with: {
            tag: true,
          },
        },
        links: true,
        caseStudy: true,
        experiences: {
          with: {
            experience: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project', id);
    }

    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      description: project.description,
      projectType: project.projectType,
      problemStatement: project.problemStatement,
      solution: project.solution,
      architecture: project.architecture,
      role: project.role,
      roleSummary: project.roleSummary,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      repositoryUrl: project.repositoryUrl,
      liveUrl: project.liveUrl,
      featured: project.featured,
      sortOrder: project.sortOrder,
      visibility: project.visibility as any,
      publicationStatus: project.publicationStatus as any,
      publishedAt: project.publishedAt ? project.publishedAt.toISOString() : null,
      archivedAt: project.archivedAt ? project.archivedAt.toISOString() : null,
      domains: (project.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      skills: (project.skills || []).map((s: any) => ({
        id: s.skill.id,
        name: s.skill.name,
        slug: s.skill.slug,
      })),
      technologies: (project.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
        iconName: t.technology.iconName,
      })),
      tags: (project.tags || []).map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      })),
      experienceReferences: (project.experiences || []).map((e: any) => ({
        id: e.experience.id,
        title: e.experience.position,
      })),
      caseStudySummary: project.caseStudy
        ? {
            id: project.caseStudy.id,
            title: project.caseStudy.title,
            subtitle: project.caseStudy.subtitle,
            executiveSummary: project.caseStudy.executiveSummary,
            exists: true,
          }
        : undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  /**
   * Creates a new project with owner isolation and transactional junction sync.
   */
  static async createProject(
    ownerId: string,
    input: ProjectFormInput,
    actorId?: string
  ): Promise<ProjectEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    const existing = await db.query.projects.findFirst({
      where: eq(projects.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`Project with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const [newProject] = await tx
        .insert(projects)
        .values({
          ownerId,
          title: input.title.trim(),
          slug: finalSlug,
          shortDescription: input.shortDescription || null,
          description: input.description || null,
          projectType: input.projectType || null,
          problemStatement: input.problemStatement || null,
          solution: input.solution || null,
          architecture: input.architecture || null,
          role: input.role || null,
          roleSummary: input.roleSummary || null,
          status: input.status || 'planning',
          startDate: input.startDate || null,
          endDate: input.endDate || null,
          repositoryUrl: input.repositoryUrl || null,
          liveUrl: input.liveUrl || null,
          featured: input.featured || false,
          sortOrder: input.sortOrder || 0,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Enforce DRAFT default per Amendment 3
        })
        .returning();

      // Synchronize Junctions
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(projectDomains).values(
          input.domainIds.map((domainId) => ({
            projectId: newProject.id,
            domainId,
          }))
        );
      }

      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(projectSkills).values(
          input.skillIds.map((skillId) => ({
            projectId: newProject.id,
            skillId,
          }))
        );
      }

      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(projectTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            projectId: newProject.id,
            technologyId,
          }))
        );
      }

      if (input.tagIds && input.tagIds.length > 0) {
        await tx.insert(projectTags).values(
          input.tagIds.map((tagId) => ({
            projectId: newProject.id,
            tagId,
          }))
        );
      }

      if (input.links && input.links.length > 0) {
        await tx.insert(projectLinks).values(
          input.links.map((link, idx) => ({
            projectId: newProject.id,
            label: link.label.trim(),
            url: link.url.trim(),
            linkType: link.linkType || 'external',
            sortOrder: idx,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'PROJECT_CREATE',
        entityType: 'project',
        entityId: newProject.id,
        newValues: newProject,
      });

      return await ProjectsService.getProjectEditorById(ownerId, newProject.id, tx);
    });
  }

  /**
   * Updates an existing project with owner isolation and transactional junction sync.
   * Note: Does NOT modify publicationStatus (reserved for PublishingService per Amendment 3).
   */
  static async updateProject(
    ownerId: string,
    id: string,
    input: ProjectFormInput,
    actorId?: string
  ): Promise<ProjectEditorDTO> {
    const existing = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.ownerId, ownerId), isNull(projects.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    const finalSlug = input.slug?.trim() || slugify(input.title);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.projects.findFirst({
        where: and(eq(projects.slug, finalSlug), sql`${projects.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      const [updatedProject] = await tx
        .update(projects)
        .set({
          title: input.title.trim(),
          slug: finalSlug,
          shortDescription: input.shortDescription || null,
          description: input.description || null,
          projectType: input.projectType || null,
          problemStatement: input.problemStatement || null,
          solution: input.solution || null,
          architecture: input.architecture || null,
          role: input.role || null,
          roleSummary: input.roleSummary || null,
          status: input.status || existing.status,
          startDate: input.startDate || null,
          endDate: input.endDate || null,
          repositoryUrl: input.repositoryUrl || null,
          liveUrl: input.liveUrl || null,
          featured: input.featured ?? existing.featured,
          sortOrder: input.sortOrder ?? existing.sortOrder,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
        .returning();

      // 1. Sync Domains
      await tx.delete(projectDomains).where(eq(projectDomains.projectId, id));
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(projectDomains).values(
          input.domainIds.map((domainId) => ({
            projectId: id,
            domainId,
          }))
        );
      }

      // 2. Sync Skills
      await tx.delete(projectSkills).where(eq(projectSkills.projectId, id));
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(projectSkills).values(
          input.skillIds.map((skillId) => ({
            projectId: id,
            skillId,
          }))
        );
      }

      // 3. Sync Technologies
      await tx.delete(projectTechnologies).where(eq(projectTechnologies.projectId, id));
      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(projectTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            projectId: id,
            technologyId,
          }))
        );
      }

      // 4. Sync Tags
      await tx.delete(projectTags).where(eq(projectTags.projectId, id));
      if (input.tagIds && input.tagIds.length > 0) {
        await tx.insert(projectTags).values(
          input.tagIds.map((tagId) => ({
            projectId: id,
            tagId,
          }))
        );
      }

      // 5. Sync Links
      await tx.delete(projectLinks).where(eq(projectLinks.projectId, id));
      if (input.links && input.links.length > 0) {
        await tx.insert(projectLinks).values(
          input.links.map((link, idx) => ({
            projectId: id,
            label: link.label.trim(),
            url: link.url.trim(),
            linkType: link.linkType || 'external',
            sortOrder: idx,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'PROJECT_UPDATE',
        entityType: 'project',
        entityId: id,
        oldValues: existing,
        newValues: updatedProject,
      });

      return await ProjectsService.getProjectEditorById(ownerId, id, tx);
    });
  }

  /**
   * Archives a project (Owner scoped).
   */
  static async archiveProject(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Project', id);

    await db.transaction(async (tx) => {
      await tx
        .update(projects)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'PROJECT_ARCHIVE',
        entityType: 'project',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Deletes a project (Soft delete, Owner scoped).
   */
  static async deleteProject(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Project', id);

    await db.transaction(async (tx) => {
      await tx
        .update(projects)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'PROJECT_DELETE',
        entityType: 'project',
        entityId: id,
        oldValues: existing,
      });
    });
  }
}
