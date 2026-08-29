import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  date,
  jsonb,
  primaryKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { media, skills, technologies } from './projects';
import { domains } from './domains';

/**
 * 10.53 learning_paths — Structured learning curriculum and skill progression
 * Canonical Entity: LearningPath
 */
export const learningPaths = pgTable(
  'learning_paths',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).unique().notNull(),
    summary: text('summary'),
    status: varchar('status', { length: 30 }).default('planned').notNull(),
    startedAt: date('started_at', { mode: 'string' }),
    completedAt: date('completed_at', { mode: 'string' }),
    progressMode: varchar('progress_mode', { length: 30 }),
    progressValue: integer('progress_value'),
    currentFocus: text('current_focus'),
    content: jsonb('content'),
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
      'chk_learning_path_status',
      sql`${t.status} IN ('planned', 'active', 'paused', 'completed', 'archived')`
    ),
    check('chk_learning_path_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_learning_path_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    check('chk_learning_path_dates', sql`${t.completedAt} IS NULL OR ${t.startedAt} IS NULL OR ${t.completedAt} >= ${t.startedAt}`),
    index('idx_learning_paths_feed').on(t.status, t.visibility, t.publicationStatus),
  ]
);

/**
 * 10.54 learning_path_skills — LearningPath to Skill junction
 */
export const learningPathSkills = pgTable(
  'learning_path_skills',
  {
    learningPathId: uuid('learning_path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.learningPathId, t.skillId] }),
  ]
);

/**
 * 10.55 learning_path_domains — LearningPath to Domain junction
 */
export const learningPathDomains = pgTable(
  'learning_path_domains',
  {
    learningPathId: uuid('learning_path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.learningPathId, t.domainId] }),
  ]
);

/**
 * 10.56 learning_path_technologies — LearningPath to Technology junction
 */
export const learningPathTechnologies = pgTable(
  'learning_path_technologies',
  {
    learningPathId: uuid('learning_path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
    technologyId: uuid('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.learningPathId, t.technologyId] }),
  ]
);

/**
 * 10.22 certificates — Verified certifications & credentials
 * Canonical Entity: Certificate
 */
export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }),
    issuer: varchar('issuer', { length: 200 }).notNull(),
    credentialId: varchar('credential_id', { length: 200 }),
    credentialUrl: text('credential_url'),
    issuedAt: date('issued_at', { mode: 'string' }).notNull(),
    expiresAt: date('expires_at', { mode: 'string' }),
    certificateMediaId: uuid('certificate_media_id').references(() => media.id, { onDelete: 'set null' }),
    description: text('description'),
    verificationStatus: varchar('verification_status', { length: 50 }),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }).default('draft').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'date' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check('chk_cert_expiry', sql`${t.expiresAt} IS NULL OR ${t.expiresAt} >= ${t.issuedAt}`),
    check('chk_cert_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_cert_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    index('idx_certificates_issued').on(t.issuedAt),
    index('idx_certificates_feed').on(t.visibility, t.publicationStatus, t.issuedAt),
  ]
);

/**
 * 10.57 certificate_skills — Certificate to Skill junction
 */
export const certificateSkills = pgTable(
  'certificate_skills',
  {
    certificateId: uuid('certificate_id')
      .notNull()
      .references(() => certificates.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.certificateId, t.skillId] }),
  ]
);

/**
 * 10.58 certificate_domains — Certificate to Domain junction
 */
export const certificateDomains = pgTable(
  'certificate_domains',
  {
    certificateId: uuid('certificate_id')
      .notNull()
      .references(() => certificates.id, { onDelete: 'cascade' }),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.certificateId, t.domainId] }),
  ]
);

/**
 * 10.59 certificate_technologies — Certificate to Technology junction
 */
export const certificateTechnologies = pgTable(
  'certificate_technologies',
  {
    certificateId: uuid('certificate_id')
      .notNull()
      .references(() => certificates.id, { onDelete: 'cascade' }),
    technologyId: uuid('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.certificateId, t.technologyId] }),
  ]
);

/**
 * 10.23 learning_goals — Legacy engineering learning objectives (retained for backward compatibility)
 */
export const learningGoals = pgTable(
  'learning_goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 30 }).default('planned').notNull(),
    priority: varchar('priority', { length: 30 }).default('medium').notNull(),
    progress: integer('progress').default(0).notNull(),
    targetDate: date('target_date', { mode: 'string' }),
    startedAt: date('started_at', { mode: 'string' }),
    completedAt: date('completed_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check('chk_learning_progress', sql`${t.progress} >= 0 AND ${t.progress} <= 100`),
    check('chk_learning_status', sql`${t.status} IN ('planned', 'in_progress', 'completed', 'abandoned')`),
    check('chk_learning_priority', sql`${t.priority} IN ('low', 'medium', 'high', 'urgent')`),
    index('idx_learning_goals_status').on(t.status, t.priority),
  ]
);

/**
 * 10.24 roadmap_items — Public & private milestone tracks
 * Canonical Entity: Roadmap
 */
export const roadmapItems = pgTable(
  'roadmap_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }),
    summary: text('summary'),
    description: text('description'),
    category: varchar('category', { length: 100 }),
    roadmapType: varchar('roadmap_type', { length: 50 }),
    status: varchar('status', { length: 30 }).default('backlog').notNull(),
    priority: integer('priority').default(1),
    startDate: date('start_date', { mode: 'string' }),
    targetDate: date('target_date', { mode: 'string' }),
    sortOrder: integer('sort_order').default(0).notNull(),
    content: jsonb('content'),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }).default('draft').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'date' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check('chk_roadmap_status', sql`${t.status} IN ('backlog', 'planned', 'in_progress', 'completed')`),
    check('chk_roadmap_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_roadmap_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    index('idx_roadmap_items_status').on(t.status, t.sortOrder),
    index('idx_roadmap_feed').on(t.visibility, t.publicationStatus, t.sortOrder),
  ]
);

export type LearningPath = typeof learningPaths.$inferSelect;
export type NewLearningPath = typeof learningPaths.$inferInsert;
export type LearningPathSkill = typeof learningPathSkills.$inferSelect;
export type NewLearningPathSkill = typeof learningPathSkills.$inferInsert;
export type LearningPathDomain = typeof learningPathDomains.$inferSelect;
export type NewLearningPathDomain = typeof learningPathDomains.$inferInsert;
export type LearningPathTechnology = typeof learningPathTechnologies.$inferSelect;
export type NewLearningPathTechnology = typeof learningPathTechnologies.$inferInsert;
export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;
export type CertificateSkill = typeof certificateSkills.$inferSelect;
export type NewCertificateSkill = typeof certificateSkills.$inferInsert;
export type CertificateDomain = typeof certificateDomains.$inferSelect;
export type NewCertificateDomain = typeof certificateDomains.$inferInsert;
export type CertificateTechnology = typeof certificateTechnologies.$inferSelect;
export type NewCertificateTechnology = typeof certificateTechnologies.$inferInsert;
export type LearningGoal = typeof learningGoals.$inferSelect;
export type NewLearningGoal = typeof learningGoals.$inferInsert;
export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type NewRoadmapItem = typeof roadmapItems.$inferInsert;
