import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  primaryKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projects, technologies } from './projects';
import { domains } from './domains';
import { learningPaths, roadmapItems } from './learning';

/**
 * 10.30 now_entries — Temporal attention and current engineering focus
 * Canonical Entity: NowEntry
 */
export const nowEntries = pgTable(
  'now_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    entryType: varchar('entry_type', { length: 40 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 30 }).default('active').notNull(),
    startedAt: date('started_at', { mode: 'string' }),
    endedAt: date('ended_at', { mode: 'string' }),
    isCurrent: boolean('is_current').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }).default('draft').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'date' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check(
      'chk_now_entry_type',
      sql`${t.entryType} IN ('building', 'learning', 'managing', 'researching', 'reading', 'watching', 'exploring', 'using')`
    ),
    check(
      'chk_now_status',
      sql`${t.status} IN ('active', 'idle', 'completed', 'archived')`
    ),
    check('chk_now_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_now_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    check('chk_now_dates', sql`${t.endedAt} IS NULL OR ${t.startedAt} IS NULL OR ${t.endedAt} >= ${t.startedAt}`),
    index('idx_now_feed').on(t.isCurrent, t.visibility, t.publicationStatus, t.sortOrder),
  ]
);

/**
 * 10.31 now_projects — NowEntry to Project junction
 */
export const nowProjects = pgTable(
  'now_projects',
  {
    nowId: uuid('now_id')
      .notNull()
      .references(() => nowEntries.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.nowId, t.projectId] }),
  ]
);

/**
 * 10.32 now_domains — NowEntry to Domain junction
 */
export const nowDomains = pgTable(
  'now_domains',
  {
    nowId: uuid('now_id')
      .notNull()
      .references(() => nowEntries.id, { onDelete: 'cascade' }),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.nowId, t.domainId] }),
  ]
);

/**
 * 10.33 now_technologies — NowEntry to Technology junction
 */
export const nowTechnologies = pgTable(
  'now_technologies',
  {
    nowId: uuid('now_id')
      .notNull()
      .references(() => nowEntries.id, { onDelete: 'cascade' }),
    technologyId: uuid('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.nowId, t.technologyId] }),
  ]
);

/**
 * 10.60 now_learning_paths — NowEntry to LearningPath junction
 */
export const nowLearningPaths = pgTable(
  'now_learning_paths',
  {
    nowId: uuid('now_id')
      .notNull()
      .references(() => nowEntries.id, { onDelete: 'cascade' }),
    learningPathId: uuid('learning_path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.nowId, t.learningPathId] }),
  ]
);

/**
 * 10.61 now_roadmaps — NowEntry to Roadmap junction
 */
export const nowRoadmaps = pgTable(
  'now_roadmaps',
  {
    nowId: uuid('now_id')
      .notNull()
      .references(() => nowEntries.id, { onDelete: 'cascade' }),
    roadmapId: uuid('roadmap_id')
      .notNull()
      .references(() => roadmapItems.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.nowId, t.roadmapId] }),
  ]
);

export type NowEntry = typeof nowEntries.$inferSelect;
export type NewNowEntry = typeof nowEntries.$inferInsert;
export type NowProject = typeof nowProjects.$inferSelect;
export type NewNowProject = typeof nowProjects.$inferInsert;
export type NowDomain = typeof nowDomains.$inferSelect;
export type NewNowDomain = typeof nowDomains.$inferInsert;
export type NowTechnology = typeof nowTechnologies.$inferSelect;
export type NewNowTechnology = typeof nowTechnologies.$inferInsert;
export type NowLearningPath = typeof nowLearningPaths.$inferSelect;
export type NewNowLearningPath = typeof nowLearningPaths.$inferInsert;
export type NowRoadmap = typeof nowRoadmaps.$inferSelect;
export type NewNowRoadmap = typeof nowRoadmaps.$inferInsert;
