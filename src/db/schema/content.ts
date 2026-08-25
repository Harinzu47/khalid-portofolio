import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  date,
  primaryKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { media } from './projects';
import { projects, technologies } from './projects';

/**
 * 10.16 tags — Unified taxonomy tags
 */
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.13 articles — Long-form technical articles
 */
export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).unique().notNull(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    status: varchar('status', { length: 30 }).default('draft').notNull(),
    featured: boolean('featured').default(false).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: varchar('seo_description', { length: 500 }),
    ogImageId: uuid('og_image_id').references(() => media.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    check('chk_article_status', sql`${t.status} IN ('draft', 'review', 'published', 'archived')`),
    index('idx_articles_feed').on(t.status, t.publishedAt),
  ]
);

/**
 * 10.14 journal_entries — Daily engineering logs & work notes
 */
export const journalEntries = pgTable(
  'journal_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).unique().notNull(),
    entryDate: date('entry_date', { mode: 'string' }).default(sql`CURRENT_DATE`).notNull(),
    content: text('content').notNull(),
    summary: text('summary'),
    status: varchar('status', { length: 30 }).default('draft').notNull(),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    reflection: text('reflection'),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    check('chk_journal_status', sql`${t.status} IN ('draft', 'review', 'published', 'archived')`),
    check('chk_journal_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    index('idx_journal_feed').on(t.status, t.visibility, t.entryDate),
    index('idx_journal_date').on(t.entryDate),
  ]
);

/**
 * 10.15 notes — Short-form technical snippets & bookmarks
 */
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).unique().notNull(),
    content: text('content').notNull(),
    status: varchar('status', { length: 30 }).default('draft').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    check('chk_note_status', sql`${t.status} IN ('draft', 'review', 'published', 'archived')`),
    index('idx_notes_status').on(t.status),
  ]
);

/**
 * 10.17 article_tags — Article taxonomy junction
 */
export const articleTags = pgTable(
  'article_tags',
  {
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.tagId] }),
  ]
);

/**
 * 10.18 journal_tags — Journal taxonomy junction
 */
export const journalTags = pgTable(
  'journal_tags',
  {
    journalId: uuid('journal_id')
      .notNull()
      .references(() => journalEntries.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.journalId, t.tagId] }),
  ]
);

/**
 * 10.19 article_projects — Article to Project junction
 */
export const articleProjects = pgTable(
  'article_projects',
  {
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.projectId] }),
  ]
);

/**
 * 10.20 journal_projects — Journal to Project junction
 */
export const journalProjects = pgTable(
  'journal_projects',
  {
    journalId: uuid('journal_id')
      .notNull()
      .references(() => journalEntries.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.journalId, t.projectId] }),
  ]
);

/**
 * 10.21 journal_technologies — Journal to Technology junction
 */
export const journalTechnologies = pgTable(
  'journal_technologies',
  {
    journalId: uuid('journal_id')
      .notNull()
      .references(() => journalEntries.id, { onDelete: 'cascade' }),
    technologyId: uuid('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.journalId, t.technologyId] }),
  ]
);

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
