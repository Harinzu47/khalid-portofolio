import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  date,
  integer,
  jsonb,
  primaryKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { media, projects, technologies, skills } from './projects';
import { domains } from './domains';

/**
 * 10.16 tags — Unified taxonomy tags
 * Canonical Entity: Tag
 */
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).unique().notNull(),
  description: text('description'),
  visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.13 articles — Long-form technical essays
 * Canonical Entity: Article
 */
export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).unique().notNull(),
    subtitle: varchar('subtitle', { length: 255 }),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    status: varchar('status', { length: 30 }).default('draft').notNull(),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }).default('draft').notNull(),
    readingTimeMinutes: integer('reading_time_minutes'),
    revision: integer('revision').default(1).notNull(),
    featured: boolean('featured').default(false).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'date' }),
    lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true, mode: 'date' }),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: varchar('seo_description', { length: 500 }),
    ogImageId: uuid('og_image_id').references(() => media.id, { onDelete: 'set null' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    check('chk_article_status', sql`${t.status} IN ('draft', 'review', 'published', 'archived')`),
    check('chk_article_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_article_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    index('idx_articles_feed').on(t.status, t.visibility, t.publicationStatus, t.publishedAt),
  ]
);

/**
 * 10.14 journal_entries — Daily engineering logs & work notes
 * Canonical Entity: JournalEntry
 */
export const journalEntries = pgTable(
  'journal_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).unique().notNull(),
    entryDate: date('entry_date', { mode: 'string' }).default(sql`CURRENT_DATE`).notNull(),
    content: text('content').notNull(),
    summary: text('summary'),
    status: varchar('status', { length: 30 }).default('draft').notNull(),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }).default('draft').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'date' }),
    sessionNumber: integer('session_number'),
    workState: varchar('work_state', { length: 50 }),
    isFeatured: boolean('is_featured').default(false).notNull(),
    reflection: text('reflection'),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'date' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    check('chk_journal_status', sql`${t.status} IN ('draft', 'review', 'published', 'archived')`),
    check('chk_journal_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_journal_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    index('idx_journal_feed').on(t.status, t.visibility, t.publicationStatus, t.entryDate),
    index('idx_journal_date').on(t.entryDate),
  ]
);

/**
 * 10.15 notes — Reusable technical reference & bookmarks
 * Canonical Entity: TechNote
 */
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).unique().notNull(),
    summary: text('summary'),
    content: text('content').notNull(),
    difficulty: varchar('difficulty', { length: 30 }),
    verificationStatus: varchar('verification_status', { length: 30 }),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true, mode: 'date' }),
    testedVersions: jsonb('tested_versions'),
    isFeatured: boolean('is_featured').default(false).notNull(),
    status: varchar('status', { length: 30 }).default('draft').notNull(),
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
    check('chk_note_status', sql`${t.status} IN ('draft', 'review', 'published', 'archived')`),
    check('chk_note_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_note_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    index('idx_notes_status').on(t.status, t.visibility, t.publicationStatus),
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

/**
 * 10.42 article_domains — Article to Domain junction
 */
export const articleDomains = pgTable(
  'article_domains',
  {
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.domainId] }),
  ]
);

/**
 * 10.43 article_skills — Article to Skill junction
 */
export const articleSkills = pgTable(
  'article_skills',
  {
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.skillId] }),
  ]
);

/**
 * 10.44 article_technologies — Article to Technology junction
 */
export const articleTechnologies = pgTable(
  'article_technologies',
  {
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    technologyId: uuid('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.technologyId] }),
  ]
);

/**
 * 10.45 journal_domains — Journal to Domain junction
 */
export const journalDomains = pgTable(
  'journal_domains',
  {
    journalId: uuid('journal_id')
      .notNull()
      .references(() => journalEntries.id, { onDelete: 'cascade' }),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.journalId, t.domainId] }),
  ]
);

/**
 * 10.46 journal_skills — Journal to Skill junction
 */
export const journalSkills = pgTable(
  'journal_skills',
  {
    journalId: uuid('journal_id')
      .notNull()
      .references(() => journalEntries.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.journalId, t.skillId] }),
  ]
);

/**
 * 10.47 note_projects — Note to Project junction
 */
export const noteProjects = pgTable(
  'note_projects',
  {
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.projectId] }),
  ]
);

/**
 * 10.48 note_skills — Note to Skill junction
 */
export const noteSkills = pgTable(
  'note_skills',
  {
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.skillId] }),
  ]
);

/**
 * 10.49 note_domains — Note to Domain junction
 */
export const noteDomains = pgTable(
  'note_domains',
  {
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.domainId] }),
  ]
);

/**
 * 10.50 note_technologies — Note to Technology junction
 */
export const noteTechnologies = pgTable(
  'note_technologies',
  {
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    technologyId: uuid('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.technologyId] }),
  ]
);

/**
 * 10.51 note_tags — Note to Tag junction
 */
export const noteTags = pgTable(
  'note_tags',
  {
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.tagId] }),
  ]
);

/**
 * 10.52 project_tags — Project to Tag junction
 */
export const projectTags = pgTable(
  'project_tags',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.tagId] }),
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
export type ArticleTag = typeof articleTags.$inferSelect;
export type NewArticleTag = typeof articleTags.$inferInsert;
export type JournalTag = typeof journalTags.$inferSelect;
export type NewJournalTag = typeof journalTags.$inferInsert;
export type ArticleProject = typeof articleProjects.$inferSelect;
export type NewArticleProject = typeof articleProjects.$inferInsert;
export type JournalProject = typeof journalProjects.$inferSelect;
export type NewJournalProject = typeof journalProjects.$inferInsert;
export type JournalTechnology = typeof journalTechnologies.$inferSelect;
export type NewJournalTechnology = typeof journalTechnologies.$inferInsert;
export type ArticleDomain = typeof articleDomains.$inferSelect;
export type NewArticleDomain = typeof articleDomains.$inferInsert;
export type ArticleSkill = typeof articleSkills.$inferSelect;
export type NewArticleSkill = typeof articleSkills.$inferInsert;
export type ArticleTechnology = typeof articleTechnologies.$inferSelect;
export type NewArticleTechnology = typeof articleTechnologies.$inferInsert;
export type JournalDomain = typeof journalDomains.$inferSelect;
export type NewJournalDomain = typeof journalDomains.$inferInsert;
export type JournalSkill = typeof journalSkills.$inferSelect;
export type NewJournalSkill = typeof journalSkills.$inferInsert;
export type NoteProject = typeof noteProjects.$inferSelect;
export type NewNoteProject = typeof noteProjects.$inferInsert;
export type NoteSkill = typeof noteSkills.$inferSelect;
export type NewNoteSkill = typeof noteSkills.$inferInsert;
export type NoteDomain = typeof noteDomains.$inferSelect;
export type NewNoteDomain = typeof noteDomains.$inferInsert;
export type NoteTechnology = typeof noteTechnologies.$inferSelect;
export type NewNoteTechnology = typeof noteTechnologies.$inferInsert;
export type NoteTag = typeof noteTags.$inferSelect;
export type NewNoteTag = typeof noteTags.$inferInsert;
export type ProjectTag = typeof projectTags.$inferSelect;
export type NewProjectTag = typeof projectTags.$inferInsert;
