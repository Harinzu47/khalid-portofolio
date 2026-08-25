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
  primaryKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * 10.5 projects — Case studies & portfolio projects
 */
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 220 }).unique().notNull(),
    shortDescription: varchar('short_description', { length: 500 }),
    description: text('description'),
    problemStatement: text('problem_statement'),
    solution: text('solution'),
    architecture: text('architecture'),
    role: varchar('role', { length: 150 }),
    status: varchar('status', { length: 30 }).default('planning').notNull(),
    startDate: date('start_date', { mode: 'string' }),
    endDate: date('end_date', { mode: 'string' }),
    repositoryUrl: text('repository_url'),
    liveUrl: text('live_url'),
    featured: boolean('featured').default(false).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    check('chk_project_status', sql`${t.status} IN ('idea', 'planning', 'active', 'completed', 'archived')`),
    check('chk_project_dates', sql`${t.endDate} IS NULL OR ${t.startDate} IS NULL OR ${t.endDate} >= ${t.startDate}`),
    index('idx_projects_feed').on(t.status, t.publishedAt),
    index('idx_projects_featured').on(t.featured),
  ]
);

/**
 * 10.6 technologies — Tech stack taxonomy
 */
export const technologies = pgTable('technologies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  websiteUrl: text('website_url'),
  iconName: varchar('icon_name', { length: 100 }),
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
 */
export const skills = pgTable(
  'skills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).unique().notNull(),
    category: varchar('category', { length: 100 }),
    description: text('description'),
    proficiencyLevel: integer('proficiency_level'),
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
 */
export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  disk: varchar('disk', { length: 50 }).default('supabase').notNull(),
  path: text('path').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  altText: varchar('alt_text', { length: 255 }),
  uploadedBy: uuid('uploaded_by'),
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
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type ProjectLink = typeof projectLinks.$inferSelect;
export type NewProjectLink = typeof projectLinks.$inferInsert;
