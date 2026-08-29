import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  bigint,
  jsonb,
  primaryKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { domains } from './domains';

/**
 * 10.5 projects — Case studies & portfolio projects
 * Canonical Entity: Project
 */
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 220 }).unique().notNull(),
    shortDescription: varchar('short_description', { length: 500 }),
    description: text('description'),
    projectType: varchar('project_type', { length: 50 }),
    problemStatement: text('problem_statement'),
    solution: text('solution'),
    architecture: text('architecture'),
    role: varchar('role', { length: 150 }),
    roleSummary: text('role_summary'),
    status: varchar('status', { length: 30 }).default('planning').notNull(),
    startDate: date('start_date', { mode: 'string' }),
    endDate: date('end_date', { mode: 'string' }),
    repositoryUrl: text('repository_url'),
    liveUrl: text('live_url'),
    featured: boolean('featured').default(false).notNull(),
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
    check(
      'chk_project_status',
      sql`${t.status} IN ('idea', 'planning', 'active', 'maintained', 'completed', 'archived', 'experimental')`
    ),
    check('chk_project_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_project_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    check(
      'chk_project_dates',
      sql`${t.endDate} IS NULL OR ${t.startDate} IS NULL OR ${t.endDate} >= ${t.startDate}`
    ),
    index('idx_projects_feed').on(t.status, t.visibility, t.publicationStatus, t.publishedAt),
    index('idx_projects_featured').on(t.featured),
    index('idx_projects_slug').on(t.slug),
  ]
);

/**
 * 10.6 technologies — Tech stack taxonomy
 * Canonical Entity: Technology
 */
export const technologies = pgTable('technologies', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  category: varchar('category', { length: 100 }),
  technologyType: varchar('technology_type', { length: 50 }),
  description: text('description'),
  websiteUrl: text('website_url'),
  iconName: varchar('icon_name', { length: 100 }),
  visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.7 project_technologies — Project to Tech junction
 */
export const projectTechnologies = pgTable(
  'project_technologies',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    technologyId: uuid('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.technologyId] }),
  ]
);

/**
 * 10.8 skills — Core engineering competencies
 * Canonical Entity: Skill
 */
export const skills = pgTable(
  'skills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).unique().notNull(),
    category: varchar('category', { length: 100 }),
    description: text('description'),
    proficiencyLevel: integer('proficiency_level'),
    isFeatured: boolean('is_featured').default(false).notNull(),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check(
      'chk_skill_proficiency',
      sql`${t.proficiencyLevel} IS NULL OR (${t.proficiencyLevel} >= 1 AND ${t.proficiencyLevel} <= 5)`
    ),
  ]
);

/**
 * 10.9 project_skills — Project to Skill junction
 */
export const projectSkills = pgTable(
  'project_skills',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.skillId] }),
  ]
);

/**
 * 10.41 project_domains — Project to Domain junction
 */
export const projectDomains = pgTable(
  'project_domains',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.domainId] }),
  ]
);

/**
 * 10.10 project_links — External demo / repo links
 */
export const projectLinks = pgTable('project_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 100 }).notNull(),
  url: text('url').notNull(),
  linkType: varchar('link_type', { length: 50 }),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.11 media — Binary asset registry in Supabase Storage
 * Canonical Entity: Media
 */
export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  storageBucket: varchar('storage_bucket', { length: 100 }).default('portfolio').notNull(),
  disk: varchar('disk', { length: 50 }).default('supabase').notNull(),
  path: text('path').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  width: integer('width'),
  height: integer('height'),
  altText: varchar('alt_text', { length: 255 }),
  caption: text('caption'),
  metadata: jsonb('metadata'),
  visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
  uploadedBy: uuid('uploaded_by'),
  archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.12 project_media — Project gallery attachments
 */
export const projectMedia = pgTable(
  'project_media',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').default(0).notNull(),
    isCover: boolean('is_cover').default(false).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.mediaId] }),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Technology = typeof technologies.$inferSelect;
export type NewTechnology = typeof technologies.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type ProjectDomain = typeof projectDomains.$inferSelect;
export type NewProjectDomain = typeof projectDomains.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type ProjectLink = typeof projectLinks.$inferSelect;
export type NewProjectLink = typeof projectLinks.$inferInsert;
