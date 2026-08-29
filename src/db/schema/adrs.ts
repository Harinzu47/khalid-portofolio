import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  check,
  index,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects';

/**
 * 10.29 adrs — Architectural Decision Records
 * Canonical Entity: ADR
 */
export const adrs = pgTable(
  'adrs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    number: integer('number'),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).unique().notNull(),
    status: varchar('status', { length: 30 }).default('proposed').notNull(),
    context: text('context'),
    decision: text('decision'),
    alternatives: jsonb('alternatives'),
    consequences: jsonb('consequences'),
    supersededById: uuid('superseded_by_id').references((): AnyPgColumn => adrs.id, {
      onDelete: 'set null',
    }),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }).default('draft').notNull(),
    decidedAt: timestamp('decided_at', { withTimezone: true, mode: 'date' }),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'date' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check(
      'chk_adr_status',
      sql`${t.status} IN ('proposed', 'accepted', 'superseded', 'rejected', 'deprecated')`
    ),
    check('chk_adr_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check(
      'chk_adr_pub_status',
      sql`${t.publicationStatus} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
    ),
    index('idx_adrs_project').on(t.projectId),
    index('idx_adrs_slug').on(t.slug),
    index('idx_adrs_status').on(t.status),
    index('idx_adrs_feed').on(t.visibility, t.publicationStatus, t.publishedAt),
  ]
);

export type ADR = typeof adrs.$inferSelect;
export type NewADR = typeof adrs.$inferInsert;
