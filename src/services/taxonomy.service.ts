import { db } from '@/db/client';
import {
  skills,
  technologies,
  tags,
  domains,
  domainSkills,
  projectSkills,
  projectTechnologies,
  projectDomains,
  projectTags,
} from '@/db/schema';
import { eq, desc, asc, sql, and, isNull } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import type {
  SkillFormInput,
  DomainFormInput,
  TechnologyFormInput,
  TagFormInput,
} from '@/validations/taxonomy';
import type {
  TaxonomyListItemDTO,
  SkillEditorDTO,
  DomainEditorDTO,
  TechnologyEditorDTO,
  TagEditorDTO,
} from '@/types/dtos';

export class TaxonomyService {
  // ==========================================
  // 1. SKILLS
  // ==========================================

  static async getSkills(ownerId?: string): Promise<TaxonomyListItemDTO[]> {
    const conditions = [isNull(skills.archivedAt)];
    if (ownerId) {
      conditions.push(eq(skills.ownerId, ownerId));
    }

    const rows = await db.query.skills.findMany({
      where: and(...conditions),
      orderBy: [asc(skills.category), desc(skills.proficiencyLevel), asc(skills.name)],
    });

    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      type: 'skill' as const,
      description: s.description,
      visibility: s.visibility as any,
      isFeatured: s.isFeatured,
      proficiencyLevel: s.proficiencyLevel,
      updatedAt: s.updatedAt.toISOString(),
    }));
  }

  static async getSkillById(id: string, ownerId?: string): Promise<SkillEditorDTO> {
    const conditions = [eq(skills.id, id), isNull(skills.archivedAt)];
    if (ownerId) {
      conditions.push(eq(skills.ownerId, ownerId));
    }

    const skill = await db.query.skills.findFirst({
      where: and(...conditions),
      with: {
        domains: true,
      },
    });

    if (!skill) throw new NotFoundError('Skill', id);

    return {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      category: skill.category || 'Infrastructure',
      description: skill.description,
      proficiencyLevel: skill.proficiencyLevel,
      isFeatured: skill.isFeatured,
      visibility: skill.visibility as any,
      domainIds: skill.domains ? skill.domains.map((d: any) => d.domainId) : [],
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
    };
  }

  static async createSkill(
    ownerId: string,
    input: SkillFormInput,
    actorId?: string
  ): Promise<SkillEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.name);

    const existing = await db.query.skills.findFirst({
      where: eq(skills.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`Skill with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const [newSkill] = await tx
        .insert(skills)
        .values({
          ownerId,
          name: input.name.trim(),
          slug: finalSlug,
          category: input.category || 'Infrastructure',
          description: input.description || null,
          proficiencyLevel: input.proficiencyLevel || null,
          isFeatured: input.isFeatured || false,
          visibility: input.visibility || 'private',
        })
        .returning();

      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(domainSkills).values(
          input.domainIds.map((domainId) => ({
            domainId,
            skillId: newSkill.id,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'SKILL_CREATE',
        entityType: 'skill',
        entityId: newSkill.id,
        newValues: newSkill,
      });

      return {
        id: newSkill.id,
        name: newSkill.name,
        slug: newSkill.slug,
        category: newSkill.category || 'Infrastructure',
        description: newSkill.description,
        proficiencyLevel: newSkill.proficiencyLevel,
        isFeatured: newSkill.isFeatured,
        visibility: newSkill.visibility as any,
        domainIds: input.domainIds || [],
        createdAt: newSkill.createdAt.toISOString(),
        updatedAt: newSkill.updatedAt.toISOString(),
      };
    });
  }

  static async updateSkill(
    ownerId: string,
    id: string,
    input: SkillFormInput,
    actorId?: string
  ): Promise<SkillEditorDTO> {
    const existing = await db.query.skills.findFirst({
      where: and(eq(skills.id, id), eq(skills.ownerId, ownerId), isNull(skills.archivedAt)),
    });

    if (!existing) throw new NotFoundError('Skill', id);

    const finalSlug = input.slug?.trim() || slugify(input.name);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.skills.findFirst({
        where: and(eq(skills.slug, finalSlug), sql`${skills.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      const [updatedSkill] = await tx
        .update(skills)
        .set({
          name: input.name.trim(),
          slug: finalSlug,
          category: input.category || 'Infrastructure',
          description: input.description || null,
          proficiencyLevel: input.proficiencyLevel || null,
          isFeatured: input.isFeatured ?? existing.isFeatured,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(skills.id, id), eq(skills.ownerId, ownerId)))
        .returning();

      // Sync domain junctions
      await tx.delete(domainSkills).where(eq(domainSkills.skillId, id));
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(domainSkills).values(
          input.domainIds.map((domainId) => ({
            domainId,
            skillId: id,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'SKILL_UPDATE',
        entityType: 'skill',
        entityId: id,
        oldValues: existing,
        newValues: updatedSkill,
      });

      return {
        id: updatedSkill.id,
        name: updatedSkill.name,
        slug: updatedSkill.slug,
        category: updatedSkill.category || 'Infrastructure',
        description: updatedSkill.description,
        proficiencyLevel: updatedSkill.proficiencyLevel,
        isFeatured: updatedSkill.isFeatured,
        visibility: updatedSkill.visibility as any,
        domainIds: input.domainIds || [],
        createdAt: updatedSkill.createdAt.toISOString(),
        updatedAt: updatedSkill.updatedAt.toISOString(),
      };
    });
  }

  static async archiveSkill(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.skills.findFirst({
      where: and(eq(skills.id, id), eq(skills.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Skill', id);

    await db.transaction(async (tx) => {
      await tx
        .update(skills)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(skills.id, id), eq(skills.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'SKILL_ARCHIVE',
        entityType: 'skill',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  static async deleteSkill(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.skills.findFirst({
      where: and(eq(skills.id, id), eq(skills.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Skill', id);

    await db.transaction(async (tx) => {
      await tx.delete(projectSkills).where(eq(projectSkills.skillId, id));
      await tx.delete(domainSkills).where(eq(domainSkills.skillId, id));
      await tx.delete(skills).where(and(eq(skills.id, id), eq(skills.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'SKILL_DELETE',
        entityType: 'skill',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  // ==========================================
  // 2. DOMAINS
  // ==========================================

  static async getDomains(ownerId?: string): Promise<TaxonomyListItemDTO[]> {
    const conditions = [isNull(domains.archivedAt)];
    if (ownerId) {
      conditions.push(eq(domains.ownerId, ownerId));
    }

    const rows = await db.query.domains.findMany({
      where: and(...conditions),
      orderBy: [asc(domains.sortOrder), asc(domains.name)],
    });

    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      type: 'domain' as const,
      description: d.description,
      visibility: d.visibility as any,
      updatedAt: d.updatedAt.toISOString(),
    }));
  }

  static async getDomainById(id: string, ownerId?: string): Promise<DomainEditorDTO> {
    const conditions = [eq(domains.id, id), isNull(domains.archivedAt)];
    if (ownerId) {
      conditions.push(eq(domains.ownerId, ownerId));
    }

    const domain = await db.query.domains.findFirst({
      where: and(...conditions),
      with: {
        skills: true,
      },
    });

    if (!domain) throw new NotFoundError('Domain', id);

    return {
      id: domain.id,
      name: domain.name,
      slug: domain.slug,
      description: domain.description,
      sortOrder: domain.sortOrder,
      visibility: domain.visibility as any,
      skillIds: domain.skills ? domain.skills.map((s: any) => s.skillId) : [],
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }

  static async createDomain(
    ownerId: string,
    input: DomainFormInput,
    actorId?: string
  ): Promise<DomainEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.name);

    const existing = await db.query.domains.findFirst({
      where: eq(domains.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`Domain with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const [newDomain] = await tx
        .insert(domains)
        .values({
          ownerId,
          name: input.name.trim(),
          slug: finalSlug,
          description: input.description || null,
          sortOrder: input.sortOrder || 0,
          visibility: input.visibility || 'private',
        })
        .returning();

      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(domainSkills).values(
          input.skillIds.map((skillId) => ({
            domainId: newDomain.id,
            skillId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'DOMAIN_CREATE',
        entityType: 'domain',
        entityId: newDomain.id,
        newValues: newDomain,
      });

      return {
        id: newDomain.id,
        name: newDomain.name,
        slug: newDomain.slug,
        description: newDomain.description,
        sortOrder: newDomain.sortOrder,
        visibility: newDomain.visibility as any,
        skillIds: input.skillIds || [],
        createdAt: newDomain.createdAt.toISOString(),
        updatedAt: newDomain.updatedAt.toISOString(),
      };
    });
  }

  static async updateDomain(
    ownerId: string,
    id: string,
    input: DomainFormInput,
    actorId?: string
  ): Promise<DomainEditorDTO> {
    const existing = await db.query.domains.findFirst({
      where: and(eq(domains.id, id), eq(domains.ownerId, ownerId), isNull(domains.archivedAt)),
    });

    if (!existing) throw new NotFoundError('Domain', id);

    const finalSlug = input.slug?.trim() || slugify(input.name);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.domains.findFirst({
        where: and(eq(domains.slug, finalSlug), sql`${domains.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      const [updatedDomain] = await tx
        .update(domains)
        .set({
          name: input.name.trim(),
          slug: finalSlug,
          description: input.description || null,
          sortOrder: input.sortOrder ?? existing.sortOrder,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(domains.id, id), eq(domains.ownerId, ownerId)))
        .returning();

      // Sync skill junctions
      await tx.delete(domainSkills).where(eq(domainSkills.domainId, id));
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(domainSkills).values(
          input.skillIds.map((skillId) => ({
            domainId: id,
            skillId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'DOMAIN_UPDATE',
        entityType: 'domain',
        entityId: id,
        oldValues: existing,
        newValues: updatedDomain,
      });

      return {
        id: updatedDomain.id,
        name: updatedDomain.name,
        slug: updatedDomain.slug,
        description: updatedDomain.description,
        sortOrder: updatedDomain.sortOrder,
        visibility: updatedDomain.visibility as any,
        skillIds: input.skillIds || [],
        createdAt: updatedDomain.createdAt.toISOString(),
        updatedAt: updatedDomain.updatedAt.toISOString(),
      };
    });
  }

  static async archiveDomain(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.domains.findFirst({
      where: and(eq(domains.id, id), eq(domains.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Domain', id);

    await db.transaction(async (tx) => {
      await tx
        .update(domains)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(domains.id, id), eq(domains.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'DOMAIN_ARCHIVE',
        entityType: 'domain',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  static async deleteDomain(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.domains.findFirst({
      where: and(eq(domains.id, id), eq(domains.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Domain', id);

    await db.transaction(async (tx) => {
      await tx.delete(domainSkills).where(eq(domainSkills.domainId, id));
      await tx.delete(projectDomains).where(eq(projectDomains.domainId, id));
      await tx.delete(domains).where(and(eq(domains.id, id), eq(domains.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'DOMAIN_DELETE',
        entityType: 'domain',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  // ==========================================
  // 3. TECHNOLOGIES
  // ==========================================

  static async getTechnologies(ownerId?: string): Promise<TaxonomyListItemDTO[]> {
    const conditions = [isNull(technologies.archivedAt)];
    if (ownerId) {
      conditions.push(eq(technologies.ownerId, ownerId));
    }

    const rows = await db.query.technologies.findMany({
      where: and(...conditions),
      orderBy: [asc(technologies.category), asc(technologies.name)],
    });

    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      category: t.category,
      type: 'technology' as const,
      description: t.description,
      websiteUrl: t.websiteUrl,
      iconName: t.iconName,
      visibility: t.visibility as any,
      updatedAt: t.updatedAt.toISOString(),
    }));
  }

  static async getTechnologyById(id: string, ownerId?: string): Promise<TechnologyEditorDTO> {
    const conditions = [eq(technologies.id, id), isNull(technologies.archivedAt)];
    if (ownerId) {
      conditions.push(eq(technologies.ownerId, ownerId));
    }

    const tech = await db.query.technologies.findFirst({
      where: and(...conditions),
    });

    if (!tech) throw new NotFoundError('Technology', id);

    return {
      id: tech.id,
      name: tech.name,
      slug: tech.slug,
      category: tech.category,
      technologyType: tech.technologyType,
      description: tech.description,
      websiteUrl: tech.websiteUrl,
      iconName: tech.iconName,
      visibility: tech.visibility as any,
      createdAt: tech.createdAt.toISOString(),
      updatedAt: tech.updatedAt.toISOString(),
    };
  }

  static async createTechnology(
    ownerId: string,
    input: TechnologyFormInput,
    actorId?: string
  ): Promise<TechnologyEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.name);

    const existing = await db.query.technologies.findFirst({
      where: eq(technologies.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`Technology with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const [newTech] = await tx
        .insert(technologies)
        .values({
          ownerId,
          name: input.name.trim(),
          slug: finalSlug,
          category: input.category || null,
          technologyType: input.technologyType || null,
          description: input.description || null,
          websiteUrl: input.websiteUrl || null,
          iconName: input.iconName || null,
          visibility: input.visibility || 'private',
        })
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'TECHNOLOGY_CREATE',
        entityType: 'technology',
        entityId: newTech.id,
        newValues: newTech,
      });

      return {
        id: newTech.id,
        name: newTech.name,
        slug: newTech.slug,
        category: newTech.category,
        technologyType: newTech.technologyType,
        description: newTech.description,
        websiteUrl: newTech.websiteUrl,
        iconName: newTech.iconName,
        visibility: newTech.visibility as any,
        createdAt: newTech.createdAt.toISOString(),
        updatedAt: newTech.updatedAt.toISOString(),
      };
    });
  }

  static async updateTechnology(
    ownerId: string,
    id: string,
    input: TechnologyFormInput,
    actorId?: string
  ): Promise<TechnologyEditorDTO> {
    const existing = await db.query.technologies.findFirst({
      where: and(eq(technologies.id, id), eq(technologies.ownerId, ownerId), isNull(technologies.archivedAt)),
    });

    if (!existing) throw new NotFoundError('Technology', id);

    const finalSlug = input.slug?.trim() || slugify(input.name);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.technologies.findFirst({
        where: and(eq(technologies.slug, finalSlug), sql`${technologies.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      const [updatedTech] = await tx
        .update(technologies)
        .set({
          name: input.name.trim(),
          slug: finalSlug,
          category: input.category || null,
          technologyType: input.technologyType || null,
          description: input.description || null,
          websiteUrl: input.websiteUrl || null,
          iconName: input.iconName || null,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(technologies.id, id), eq(technologies.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'TECHNOLOGY_UPDATE',
        entityType: 'technology',
        entityId: id,
        oldValues: existing,
        newValues: updatedTech,
      });

      return {
        id: updatedTech.id,
        name: updatedTech.name,
        slug: updatedTech.slug,
        category: updatedTech.category,
        technologyType: updatedTech.technologyType,
        description: updatedTech.description,
        websiteUrl: updatedTech.websiteUrl,
        iconName: updatedTech.iconName,
        visibility: updatedTech.visibility as any,
        createdAt: updatedTech.createdAt.toISOString(),
        updatedAt: updatedTech.updatedAt.toISOString(),
      };
    });
  }

  static async archiveTechnology(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.technologies.findFirst({
      where: and(eq(technologies.id, id), eq(technologies.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Technology', id);

    await db.transaction(async (tx) => {
      await tx
        .update(technologies)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(technologies.id, id), eq(technologies.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'TECHNOLOGY_ARCHIVE',
        entityType: 'technology',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  static async deleteTechnology(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.technologies.findFirst({
      where: and(eq(technologies.id, id), eq(technologies.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Technology', id);

    await db.transaction(async (tx) => {
      await tx.delete(projectTechnologies).where(eq(projectTechnologies.technologyId, id));
      await tx.delete(technologies).where(and(eq(technologies.id, id), eq(technologies.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'TECHNOLOGY_DELETE',
        entityType: 'technology',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  // ==========================================
  // 4. TAGS
  // ==========================================

  static async getTags(ownerId?: string): Promise<TaxonomyListItemDTO[]> {
    const conditions = [isNull(tags.archivedAt)];
    if (ownerId) {
      conditions.push(eq(tags.ownerId, ownerId));
    }

    const rows = await db.query.tags.findMany({
      where: and(...conditions),
      orderBy: [asc(tags.name)],
    });

    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      type: 'tag' as const,
      description: t.description,
      visibility: t.visibility as any,
      updatedAt: t.updatedAt.toISOString(),
    }));
  }

  static async getTagById(id: string, ownerId?: string): Promise<TagEditorDTO> {
    const conditions = [eq(tags.id, id), isNull(tags.archivedAt)];
    if (ownerId) {
      conditions.push(eq(tags.ownerId, ownerId));
    }

    const tag = await db.query.tags.findFirst({
      where: and(...conditions),
    });

    if (!tag) throw new NotFoundError('Tag', id);

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      visibility: tag.visibility as any,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  static async createTag(
    ownerId: string,
    input: TagFormInput,
    actorId?: string
  ): Promise<TagEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.name);

    const existing = await db.query.tags.findFirst({
      where: eq(tags.slug, finalSlug),
    });

    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        slug: existing.slug,
        description: existing.description,
        visibility: existing.visibility as any,
        createdAt: existing.createdAt.toISOString(),
        updatedAt: existing.updatedAt.toISOString(),
      };
    }

    return await db.transaction(async (tx) => {
      const [newTag] = await tx
        .insert(tags)
        .values({
          ownerId,
          name: input.name.trim(),
          slug: finalSlug,
          description: input.description || null,
          visibility: input.visibility || 'private',
        })
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'TAG_CREATE',
        entityType: 'tag',
        entityId: newTag.id,
        newValues: newTag,
      });

      return {
        id: newTag.id,
        name: newTag.name,
        slug: newTag.slug,
        description: newTag.description,
        visibility: newTag.visibility as any,
        createdAt: newTag.createdAt.toISOString(),
        updatedAt: newTag.updatedAt.toISOString(),
      };
    });
  }

  static async updateTag(
    ownerId: string,
    id: string,
    input: TagFormInput,
    actorId?: string
  ): Promise<TagEditorDTO> {
    const existing = await db.query.tags.findFirst({
      where: and(eq(tags.id, id), eq(tags.ownerId, ownerId), isNull(tags.archivedAt)),
    });

    if (!existing) throw new NotFoundError('Tag', id);

    const finalSlug = input.slug?.trim() || slugify(input.name);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.tags.findFirst({
        where: and(eq(tags.slug, finalSlug), sql`${tags.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      const [updatedTag] = await tx
        .update(tags)
        .set({
          name: input.name.trim(),
          slug: finalSlug,
          description: input.description || null,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(tags.id, id), eq(tags.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'TAG_UPDATE',
        entityType: 'tag',
        entityId: id,
        oldValues: existing,
        newValues: updatedTag,
      });

      return {
        id: updatedTag.id,
        name: updatedTag.name,
        slug: updatedTag.slug,
        description: updatedTag.description,
        visibility: updatedTag.visibility as any,
        createdAt: updatedTag.createdAt.toISOString(),
        updatedAt: updatedTag.updatedAt.toISOString(),
      };
    });
  }

  static async archiveTag(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.tags.findFirst({
      where: and(eq(tags.id, id), eq(tags.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Tag', id);

    await db.transaction(async (tx) => {
      await tx
        .update(tags)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(tags.id, id), eq(tags.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'TAG_ARCHIVE',
        entityType: 'tag',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  static async deleteTag(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.tags.findFirst({
      where: and(eq(tags.id, id), eq(tags.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Tag', id);

    await db.transaction(async (tx) => {
      await tx.delete(projectTags).where(eq(projectTags.tagId, id));
      await tx.delete(tags).where(and(eq(tags.id, id), eq(tags.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'TAG_DELETE',
        entityType: 'tag',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  static async getSkillsSelector(ownerId: string): Promise<{ id: string; name: string; slug?: string }[]> {
    const data = await db.query.skills.findMany({
      where: and(eq(skills.ownerId, ownerId), isNull(skills.archivedAt)),
      columns: { id: true, name: true, slug: true },
      orderBy: [asc(skills.name)],
    });
    return data.map((s) => ({ id: s.id, name: s.name, slug: s.slug }));
  }

  static async getDomainsSelector(ownerId: string): Promise<{ id: string; name: string; slug?: string }[]> {
    const data = await db.query.domains.findMany({
      where: and(eq(domains.ownerId, ownerId), isNull(domains.archivedAt)),
      columns: { id: true, name: true, slug: true },
      orderBy: [asc(domains.name)],
    });
    return data.map((d) => ({ id: d.id, name: d.name, slug: d.slug }));
  }

  static async getTechnologiesSelector(ownerId: string): Promise<{ id: string; name: string; slug?: string }[]> {
    const data = await db.query.technologies.findMany({
      where: and(eq(technologies.ownerId, ownerId), isNull(technologies.archivedAt)),
      columns: { id: true, name: true, slug: true },
      orderBy: [asc(technologies.name)],
    });
    return data.map((t) => ({ id: t.id, name: t.name, slug: t.slug }));
  }

  static async getTagsSelector(ownerId: string): Promise<{ id: string; name: string; slug?: string }[]> {
    const data = await db.query.tags.findMany({
      where: and(eq(tags.ownerId, ownerId), isNull(tags.archivedAt)),
      columns: { id: true, name: true, slug: true },
      orderBy: [asc(tags.name)],
    });
    return data.map((t) => ({ id: t.id, name: t.name, slug: t.slug }));
  }
}

