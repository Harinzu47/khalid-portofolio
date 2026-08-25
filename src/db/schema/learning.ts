import { pgTable, uuid, varchar, text, timestamp, integer, date, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { media } from './projects';

/**
 * 10.22 certificates — Verified certifications & credentials
 */
export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    issuer: varchar('issuer', { length: 200 }).notNull(),
    credentialId: varchar('credential_id', { length: 200 }),
    credentialUrl: text('credential_url'),
    issuedAt: date('issued_at', { mode: 'string' }).notNull(),
    expiresAt: date('expires_at', { mode: 'string' }),
    certificateMediaId: uuid('certificate_media_id').references(() => media.id, { onDelete: 'set null' }),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check('chk_cert_expiry', sql`${t.expiresAt} IS NULL OR ${t.expiresAt} >= ${t.issuedAt}`),
    index('idx_certificates_issued').on(t.issuedAt),
  ]
);

/**
 * 10.23 learning_goals — Engineering learning objectives
 */
export const learningGoals = pgTable(
  'learning_goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
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
 */
export const roadmapItems = pgTable(
  'roadmap_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }),
    status: varchar('status', { length: 30 }).default('backlog').notNull(),
    priority: integer('priority').default(1),
    targetDate: date('target_date', { mode: 'string' }),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check('chk_roadmap_status', sql`${t.status} IN ('backlog', 'planned', 'in_progress', 'completed')`),
    index('idx_roadmap_items_status').on(t.status, t.sortOrder),
  ]
);

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;
export type LearningGoal = typeof learningGoals.$inferSelect;
export type NewLearningGoal = typeof learningGoals.$inferInsert;
export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type NewRoadmapItem = typeof roadmapItems.$inferInsert;
