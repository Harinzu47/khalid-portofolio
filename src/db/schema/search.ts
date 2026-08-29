import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

/**
 * 10.30 search_documents — Canonical derived search projection table
 * In accordance with HZCODE Search Architecture v1 & Phase 9 Amendments.
 * Derived infrastructure only: canonical tables remain the source of truth.
 */
export const searchDocuments = pgTable(
  'search_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    title: text('title').notNull(),
    slug: text('slug'),
    summary: text('summary'),
    bodyText: text('body_text'),
    visibility: varchar('visibility', { length: 30 }).notNull(),
    publicationStatus: varchar('publication_status', { length: 30 }),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    sourceUpdatedAt: timestamp('source_updated_at', { withTimezone: true, mode: 'date' }).notNull(),
    indexedAt: timestamp('indexed_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    projectionVersion: integer('projection_version').default(1).notNull(),
    taxonomy: jsonb('taxonomy').$type<{
      domains: string[];
      technologies: string[];
      skills: string[];
      tags: string[];
    }>(),
    exactTerms: text('exact_terms').array().notNull().default(sql`'{}'::text[]`),
    searchVector: tsvector('search_vector'),
  },
  (t) => [
    uniqueIndex('uq_search_doc_entity').on(t.ownerId, t.entityType, t.entityId),
    index('idx_search_docs_owner_vis_pub').on(t.ownerId, t.visibility, t.publicationStatus),
    index('idx_search_docs_type_vis').on(t.entityType, t.visibility),
  ]
);

export type SearchDocument = typeof searchDocuments.$inferSelect;
export type NewSearchDocument = typeof searchDocuments.$inferInsert;
