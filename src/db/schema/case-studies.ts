import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects';

/**
 * 10.28 project_case_studies — Curated engineering narrative attached to one canonical Project
 * Canonical Entity: ProjectCaseStudy
 * Cardinality: Project 1 ─── 0..1 ProjectCaseStudy (project_id UNIQUE)
 */
export const projectCaseStudies = pgTable(
  'project_case_studies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    projectId: uuid('project_id')
      .unique()
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    subtitle: varchar('subtitle', { length: 255 }),
    executiveSummary: text('executive_summary'),
    problemStatement: text('problem_statement'),
    objectives: jsonb('objectives'),
    constraints: jsonb('constraints'),
    architecture: jsonb('architecture'),
    implementation: jsonb('implementation'),
    tradeoffs: jsonb('tradeoffs'),
    challenges: jsonb('challenges'),
    results: jsonb('results'),
    reflection: jsonb('reflection'),
    contentBlocks: jsonb('content_blocks'),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }).default('draft').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'date' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check('chk_case_study_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check('chk_case_study_pub_status', sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`),
    index('idx_case_studies_project').on(t.projectId),
    index('idx_case_studies_feed').on(t.visibility, t.publicationStatus, t.publishedAt),
  ]
);

export type ProjectCaseStudy = typeof projectCaseStudies.$inferSelect;
export type NewProjectCaseStudy = typeof projectCaseStudies.$inferInsert;
