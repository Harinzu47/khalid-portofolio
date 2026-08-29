import { db } from '@/db/client';
import {
  profiles,
  socialLinks,
  auditLogs,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import { AuditService } from './audit.service';
import type { ProfileFormInput, SocialLinkFormInput, DatabaseBackupData } from '@/validations/settings';

export class SettingsService {
  /**
   * Retrieves the operator profile. If none exists, creates a default template.
   */
  static async getOperatorProfile() {
    let profile = await db.query.profiles.findFirst();

    if (!profile) {
      const [newProfile] = await db
        .insert(profiles)
        .values({
          ownerId: '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0',
          fullName: 'Khalid Jundullah',
          username: 'khalid',
          headline: 'Network & Cloud Infrastructure Engineer → Fullstack Developer',
          bio: 'Network & Infrastructure Engineer (MTCNA) specializing in Cloud Native Infrastructure, Enterprise Network Routing, and High-Performance Backend Systems.',
          location: 'Indonesia',
          websiteUrl: 'https://hzcode.my.id',
        })
        .returning();
      profile = newProfile;
    }

    return profile;
  }

  /**
   * Updates operator profile.
   */
  static async updateOperatorProfile(input: ProfileFormInput, actorId?: string) {
    const current = await this.getOperatorProfile();

    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(profiles)
        .set({
          fullName: input.fullName,
          username: input.username,
          headline: input.headline || null,
          bio: input.bio || null,
          location: input.location || null,
          websiteUrl: input.websiteUrl || null,
          avatarPath: input.avatarPath || null,
          resumePath: input.resumePath || null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, current.id))
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'PROFILE_UPDATE',
        entityType: 'profile',
        entityId: current.id,
        oldValues: current,
        newValues: updated,
      });

      return updated;
    });
  }

  /**
   * Retrieves all social channel links.
   */
  static async getSocialLinks() {
    return await db.query.socialLinks.findMany({
      orderBy: [socialLinks.sortOrder],
    });
  }

  /**
   * Creates or updates a social link.
   */
  static async upsertSocialLink(input: SocialLinkFormInput, actorId?: string) {
    const profile = await this.getOperatorProfile();

    return await db.transaction(async (tx) => {
      if (input.id) {
        const existing = await tx.query.socialLinks.findFirst({
          where: eq(socialLinks.id, input.id),
        });
        if (!existing) throw new NotFoundError('SocialLink', input.id);

        const [updated] = await tx
          .update(socialLinks)
          .set({
            platform: input.platform,
            label: input.label || null,
            url: input.url,
            sortOrder: input.sortOrder,
            isVisible: input.isVisible,
            updatedAt: new Date(),
          })
          .where(eq(socialLinks.id, input.id))
          .returning();

        await AuditService.record(tx, {
          actorId,
          action: 'SOCIAL_LINK_UPDATE',
          entityType: 'social_link',
          entityId: updated.id,
          oldValues: existing,
          newValues: updated,
        });

        return updated;
      } else {
        const [created] = await tx
          .insert(socialLinks)
          .values({
            profileId: profile.id,
            platform: input.platform,
            label: input.label || null,
            url: input.url,
            sortOrder: input.sortOrder,
            isVisible: input.isVisible,
          })
          .returning();

        await AuditService.record(tx, {
          actorId,
          action: 'SOCIAL_LINK_CREATE',
          entityType: 'social_link',
          entityId: created.id,
          newValues: created,
        });

        return created;
      }
    });
  }

  /**
   * Deletes a social link.
   */
  static async deleteSocialLink(id: string, actorId?: string) {
    const existing = await db.query.socialLinks.findFirst({
      where: eq(socialLinks.id, id),
    });
    if (!existing) throw new NotFoundError('SocialLink', id);

    return await db.transaction(async (tx) => {
      await tx.delete(socialLinks).where(eq(socialLinks.id, id));

      await AuditService.record(tx, {
        actorId,
        action: 'SOCIAL_LINK_DELETE',
        entityType: 'social_link',
        entityId: id,
        oldValues: existing,
      });

      return existing;
    });
  }

  /**
   * Generates a complete database JSON snapshot.
   */
  static async exportFullDatabase(): Promise<DatabaseBackupData> {
    const [
      allProfiles,
      allSocialLinks,
      allOrgs,
      allCareers,
      allProjects,
      allTechs,
      allSkills,
      allProjTechs,
      allProjSkills,
      allProjLinks,
      allMedia,
      allProjMedia,
      allArticles,
      allJournal,
      allTags,
      allArtTags,
      allJournTags,
      allArtProjects,
      allJournProjects,
      allJournTechs,
      allNotes,
      allCerts,
      allRoadmap,
      allGoals,
      allAudits,
    ] = await Promise.all([
      db.query.profiles.findMany(),
      db.query.socialLinks.findMany(),
      db.query.organizations.findMany(),
      db.query.careerExperiences.findMany(),
      db.query.projects.findMany(),
      db.query.technologies.findMany(),
      db.query.skills.findMany(),
      db.query.projectTechnologies.findMany(),
      db.query.projectSkills.findMany(),
      db.query.projectLinks.findMany(),
      db.query.media.findMany(),
      db.query.projectMedia.findMany(),
      db.query.articles.findMany(),
      db.query.journalEntries.findMany(),
      db.query.tags.findMany(),
      db.query.articleTags.findMany(),
      db.query.journalTags.findMany(),
      db.query.articleProjects.findMany(),
      db.query.journalProjects.findMany(),
      db.query.journalTechnologies.findMany(),
      db.query.notes.findMany(),
      db.query.certificates.findMany(),
      db.query.roadmapItems.findMany(),
      db.query.learningGoals.findMany(),
      db.query.auditLogs.findMany({ orderBy: [desc(auditLogs.createdAt)], limit: 500 }),
    ]);

    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      entities: {
        profiles: allProfiles as any,
        social_links: allSocialLinks as any,
        organizations: allOrgs as any,
        career_experiences: allCareers as any,
        projects: allProjects as any,
        technologies: allTechs as any,
        skills: allSkills as any,
        project_technologies: allProjTechs as any,
        project_skills: allProjSkills as any,
        project_links: allProjLinks as any,
        media: allMedia as any,
        project_media: allProjMedia as any,
        articles: allArticles as any,
        journal_entries: allJournal as any,
        tags: allTags as any,
        article_tags: allArtTags as any,
        journal_tags: allJournTags as any,
        article_projects: allArtProjects as any,
        journal_projects: allJournProjects as any,
        journal_technologies: allJournTechs as any,
        notes: allNotes as any,
        certificates: allCerts as any,
        roadmap_items: allRoadmap as any,
        learning_goals: allGoals as any,
        audit_logs: allAudits as any,
      },
    };
  }
}
