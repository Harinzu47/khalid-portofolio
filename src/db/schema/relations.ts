import { relations } from 'drizzle-orm';
import { profiles, socialLinks } from './profile';
import { organizations, careerExperiences } from './career';
import {
  projects,
  technologies,
  projectTechnologies,
  skills,
  projectSkills,
  projectLinks,
  media,
  projectMedia,
} from './projects';
import {
  articles,
  journalEntries,
  tags,
  articleTags,
  journalTags,
  articleProjects,
  journalProjects,
  journalTechnologies,
} from './content';
import { certificates } from './learning';

// 1. Profile Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  socialLinks: many(socialLinks),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [socialLinks.profileId],
    references: [profiles.id],
  }),
}));

// 2. Career Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  experiences: many(careerExperiences),
}));

export const careerExperiencesRelations = relations(careerExperiences, ({ one }) => ({
  organization: one(organizations, {
    fields: [careerExperiences.organizationId],
    references: [organizations.id],
  }),
}));

// 3. Project Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  technologies: many(projectTechnologies),
  skills: many(projectSkills),
  links: many(projectLinks),
  media: many(projectMedia),
  articles: many(articleProjects),
  journals: many(journalProjects),
}));

export const technologiesRelations = relations(technologies, ({ many }) => ({
  projects: many(projectTechnologies),
  journals: many(journalTechnologies),
}));

export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
  project: one(projects, {
    fields: [projectTechnologies.projectId],
    references: [projects.id],
  }),
  technology: one(technologies, {
    fields: [projectTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  projects: many(projectSkills),
}));

export const projectSkillsRelations = relations(projectSkills, ({ one }) => ({
  project: one(projects, {
    fields: [projectSkills.projectId],
    references: [projects.id],
  }),
  skill: one(skills, {
    fields: [projectSkills.skillId],
    references: [skills.id],
  }),
}));

export const projectLinksRelations = relations(projectLinks, ({ one }) => ({
  project: one(projects, {
    fields: [projectLinks.projectId],
    references: [projects.id],
  }),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  projects: many(projectMedia),
  articles: many(articles),
  certificates: many(certificates),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, {
    fields: [projectMedia.projectId],
    references: [projects.id],
  }),
  media: one(media, {
    fields: [projectMedia.mediaId],
    references: [media.id],
  }),
}));

// 4. Content Relations
export const articlesRelations = relations(articles, ({ one, many }) => ({
  ogImage: one(media, {
    fields: [articles.ogImageId],
    references: [media.id],
  }),
  tags: many(articleTags),
  projects: many(articleProjects),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articles: many(articleTags),
  journals: many(journalTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const articleProjectsRelations = relations(articleProjects, ({ one }) => ({
  article: one(articles, {
    fields: [articleProjects.articleId],
    references: [articles.id],
  }),
  project: one(projects, {
    fields: [articleProjects.projectId],
    references: [projects.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  tags: many(journalTags),
  projects: many(journalProjects),
  technologies: many(journalTechnologies),
}));

export const journalTagsRelations = relations(journalTags, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalTags.journalId],
    references: [journalEntries.id],
  }),
  tag: one(tags, {
    fields: [journalTags.tagId],
    references: [tags.id],
  }),
}));

export const journalProjectsRelations = relations(journalProjects, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalProjects.journalId],
    references: [journalEntries.id],
  }),
  project: one(projects, {
    fields: [journalProjects.projectId],
    references: [projects.id],
  }),
}));

export const journalTechnologiesRelations = relations(journalTechnologies, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalTechnologies.journalId],
    references: [journalEntries.id],
  }),
  technology: one(technologies, {
    fields: [journalTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

// 5. Learning & Credentials Relations
export const certificatesRelations = relations(certificates, ({ one }) => ({
  media: one(media, {
    fields: [certificates.certificateMediaId],
    references: [media.id],
  }),
}));
