import { db } from '@/db/client';
import { skills, technologies, tags, projectSkills, projectTechnologies } from '@/db/schema';
import { eq, desc, asc, sql, and } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import type { SkillFormInput, TechnologyFormInput, TagFormInput } from '@/validations/taxonomy';

export class TaxonomyService {
  // ==========================================
  // 1. SKILLS
  // ==========================================

  static async getSkills() {
    return await db.query.skills.findMany({
      orderBy: [asc(skills.category), desc(skills.proficiencyLevel), asc(skills.name)],
    });
  }

  static async getSkillById(id: string) {
    const skill = await db.query.skills.findFirst({
      where: eq(skills.id, id),
    });
    if (!skill) throw new NotFoundError('Skill', id);
    return skill;
  }

  static async createSkill(input: SkillFormInput, actorId?: string) {
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
          name: input.name,
          slug: finalSlug,
          category: input.category || 'General',
          description: input.description || null,
          proficiencyLevel: input.proficiencyLevel || null,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'SKILL_CREATE',
        entityType: 'skill',
        entityId: newSkill.id,
        newValues: newSkill,
      });

      return newSkill;
    });
  }

  static async updateSkill(id: string, input: SkillFormInput, actorId?: string) {
    const existing = await db.query.skills.findFirst({
      where: eq(skills.id, id),
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
          name: input.name,
          slug: finalSlug,
          category: input.category || 'General',
          description: input.description || null,
          proficiencyLevel: input.proficiencyLevel || null,
          updatedAt: new Date(),
        })
        .where(eq(skills.id, id))
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'SKILL_UPDATE',
        entityType: 'skill',
        entityId: id,
        oldValues: existing,
        newValues: updatedSkill,
      });

      return updatedSkill;
    });
  }

  static async deleteSkill(id: string, actorId?: string) {
    const existing = await db.query.skills.findFirst({
      where: eq(skills.id, id),
    });

    if (!existing) throw new NotFoundError('Skill', id);

    return await db.transaction(async (tx) => {
      // Clean up project junction references before deleting skill
      await tx.delete(projectSkills).where(eq(projectSkills.skillId, id));
      await tx.delete(skills).where(eq(skills.id, id));

      await AuditService.record(tx, {
        actorId,
        action: 'SKILL_DELETE',
        entityType: 'skill',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  // ==========================================
  // 2. TECHNOLOGIES
  // ==========================================

  static async getTechnologies() {
    return await db.query.technologies.findMany({
      orderBy: [asc(technologies.category), asc(technologies.name)],
    });
  }

  static async getTechnologyById(id: string) {
    const tech = await db.query.technologies.findFirst({
      where: eq(technologies.id, id),
    });
    if (!tech) throw new NotFoundError('Technology', id);
    return tech;
  }

  static async createTechnology(input: TechnologyFormInput, actorId?: string) {
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
          name: input.name,
          slug: finalSlug,
          category: input.category || null,
          description: input.description || null,
          websiteUrl: input.websiteUrl || null,
          iconName: input.iconName || null,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'TECHNOLOGY_CREATE',
        entityType: 'technology',
        entityId: newTech.id,
        newValues: newTech,
      });

      return newTech;
    });
  }

  static async updateTechnology(id: string, input: TechnologyFormInput, actorId?: string) {
    const existing = await db.query.technologies.findFirst({
      where: eq(technologies.id, id),
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
          name: input.name,
          slug: finalSlug,
          category: input.category || null,
          description: input.description || null,
          websiteUrl: input.websiteUrl || null,
          iconName: input.iconName || null,
          updatedAt: new Date(),
        })
        .where(eq(technologies.id, id))
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'TECHNOLOGY_UPDATE',
        entityType: 'technology',
        entityId: id,
        oldValues: existing,
        newValues: updatedTech,
      });

      return updatedTech;
    });
  }

  static async deleteTechnology(id: string, actorId?: string) {
    const existing = await db.query.technologies.findFirst({
      where: eq(technologies.id, id),
    });

    if (!existing) throw new NotFoundError('Technology', id);

    return await db.transaction(async (tx) => {
      await tx.delete(projectTechnologies).where(eq(projectTechnologies.technologyId, id));
      await tx.delete(technologies).where(eq(technologies.id, id));

      await AuditService.record(tx, {
        actorId,
        action: 'TECHNOLOGY_DELETE',
        entityType: 'technology',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  // ==========================================
  // 3. TAGS
  // ==========================================

  static async getTags() {
    return await db.select().from(tags).orderBy(tags.name);
  }

  static async createTag(input: TagFormInput, actorId?: string) {
    const finalSlug = input.slug?.trim() || slugify(input.name);

    const existing = await db.query.tags.findFirst({
      where: eq(tags.slug, finalSlug),
    });

    if (existing) return existing;

    return await db.transaction(async (tx) => {
      const [newTag] = await tx
        .insert(tags)
        .values({
          name: input.name.trim(),
          slug: finalSlug,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'TAG_CREATE',
        entityType: 'tag',
        entityId: newTag.id,
        newValues: newTag,
      });

      return newTag;
    });
  }

  static async deleteTag(id: string, actorId?: string) {
    const existing = await db.query.tags.findFirst({
      where: eq(tags.id, id),
    });

    if (!existing) throw new NotFoundError('Tag', id);

    return await db.transaction(async (tx) => {
      await tx.delete(tags).where(eq(tags.id, id));

      await AuditService.record(tx, {
        actorId,
        action: 'TAG_DELETE',
        entityType: 'tag',
        entityId: id,
        oldValues: existing,
      });
    });
  }
}
