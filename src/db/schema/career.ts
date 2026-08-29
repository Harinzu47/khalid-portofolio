import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  jsonb,
  primaryKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projects, technologies, skills } from './projects';
import { domains } from './domains';

/**
 * 10.3 organizations — Companies, clients, institutions
 * Canonical Entity: Organization
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).unique().notNull(),
  organizationType: varchar('organization_type', { length: 50 }),
  location: varchar('location', { length: 150 }),
  description: text('description'),
  websiteUrl: text('website_url'),
  logoPath: text('logo_path'),
  visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.4 career_experiences — Professional roles & history
 * Canonical Entity: Experience
 */
export const careerExperiences = pgTable(
  'career_experiences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    position: varchar('position', { length: 200 }).notNull(),
    employmentType: varchar('employment_type', { length: 50 }),
    location: varchar('location', { length: 150 }),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }),
    description: text('description'),
    responsibilities: jsonb('responsibilities'),
    isCurrent: boolean('is_current').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }).default('draft').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'date' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    check('chk_career_dates', sql`${t.endDate} IS NULL OR ${t.endDate} >= ${t.startDate}`),
    check('chk_career_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_career_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    index('idx_career_start_date').on(t.startDate),
    index('idx_career_feed').on(t.visibility, t.publicationStatus, t.startDate),
  ]
);

/**
 * 10.37 experience_projects — Experience to Project junction
 */
export const experienceProjects = pgTable(
  'experience_projects',
  {
    experienceId: uuid('experience_id')
      .notNull()
      .references(() => careerExperiences.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.experienceId, t.projectId] }),
  ]
);

/**
 * 10.38 experience_skills — Experience to Skill junction
 */
export const experienceSkills = pgTable(
  'experience_skills',
  {
    experienceId: uuid('experience_id')
      .notNull()
      .references(() => careerExperiences.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.experienceId, t.skillId] }),
  ]
);

/**
 * 10.39 experience_domains — Experience to Domain junction
 */
export const experienceDomains = pgTable(
  'experience_domains',
  {
    experienceId: uuid('experience_id')
      .notNull()
      .references(() => careerExperiences.id, { onDelete: 'cascade' }),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.experienceId, t.domainId] }),
  ]
);

/**
 * 10.40 experience_technologies — Experience to Technology junction
 */
export const experienceTechnologies = pgTable(
  'experience_technologies',
  {
    experienceId: uuid('experience_id')
      .notNull()
      .references(() => careerExperiences.id, { onDelete: 'cascade' }),
    technologyId: uuid('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.experienceId, t.technologyId] }),
  ]
);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type CareerExperience = typeof careerExperiences.$inferSelect;
export type NewCareerExperience = typeof careerExperiences.$inferInsert;
export type ExperienceProject = typeof experienceProjects.$inferSelect;
export type NewExperienceProject = typeof experienceProjects.$inferInsert;
export type ExperienceSkill = typeof experienceSkills.$inferSelect;
export type NewExperienceSkill = typeof experienceSkills.$inferInsert;
export type ExperienceDomain = typeof experienceDomains.$inferSelect;
export type NewExperienceDomain = typeof experienceDomains.$inferInsert;
export type ExperienceTechnology = typeof experienceTechnologies.$inferSelect;
export type NewExperienceTechnology = typeof experienceTechnologies.$inferInsert;
