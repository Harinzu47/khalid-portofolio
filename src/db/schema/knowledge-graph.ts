import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  unique,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * 10.34 relationship_types — Canonical controlled vocabulary for semantic knowledge edges
 * per HZCODE Relationship Model v1
 */
export const relationshipTypes = pgTable('relationship_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 60 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  inverseLabel: varchar('inverse_label', { length: 100 }).notNull(),
  description: text('description'),
  directionality: varchar('directionality', { length: 30 }).default('DIRECTED').notNull(),
  isPublicEligible: boolean('is_public_eligible').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.35 relationship_type_compatibility — Matrix of valid (source_type, relationship_type, target_type) combinations
 */
export const relationshipTypeCompatibility = pgTable(
  'relationship_type_compatibility',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    relationshipTypeId: uuid('relationship_type_id')
      .notNull()
      .references(() => relationshipTypes.id, { onDelete: 'cascade' }),
    sourceType: varchar('source_type', { length: 60 }).notNull(),
    targetType: varchar('target_type', { length: 60 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    unique('uq_rel_type_compat').on(t.relationshipTypeId, t.sourceType, t.targetType),
    index('idx_rel_type_compat_src').on(t.sourceType, t.targetType),
  ]
);

/**
 * 10.36 knowledge_relationships — Semantic knowledge graph edge store
 * Canonical Entity: KnowledgeRelationship
 */
export const knowledgeRelationships = pgTable(
  'knowledge_relationships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    relationshipTypeId: uuid('relationship_type_id')
      .notNull()
      .references(() => relationshipTypes.id, { onDelete: 'restrict' }),
    sourceType: varchar('source_type', { length: 60 }).notNull(),
    sourceId: uuid('source_id').notNull(),
    targetType: varchar('target_type', { length: 60 }).notNull(),
    targetId: uuid('target_id').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').default(0).notNull(),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    status: varchar('status', { length: 30 }).default('active').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    check(
      'chk_no_self_edge',
      sql`${t.sourceId} <> ${t.targetId} OR ${t.sourceType} <> ${t.targetType}`
    ),
    check('chk_rel_visibility', sql`${t.visibility} IN ('private', 'unlisted', 'public')`),
    check('chk_rel_status', sql`${t.status} IN ('active', 'archived')`),
    unique('uq_knowledge_edge').on(
      t.relationshipTypeId,
      t.sourceType,
      t.sourceId,
      t.targetType,
      t.targetId
    ),
    index('idx_knowledge_rel_src').on(t.sourceType, t.sourceId),
    index('idx_knowledge_rel_tgt').on(t.targetType, t.targetId),
    index('idx_knowledge_rel_type_src').on(t.relationshipTypeId, t.sourceType, t.sourceId),
    index('idx_knowledge_rel_type_tgt').on(t.relationshipTypeId, t.targetType, t.targetId),
    index('idx_knowledge_rel_feed').on(t.visibility, t.status),
  ]
);

export type RelationshipType = typeof relationshipTypes.$inferSelect;
export type NewRelationshipType = typeof relationshipTypes.$inferInsert;
export type RelationshipTypeCompatibility = typeof relationshipTypeCompatibility.$inferSelect;
export type NewRelationshipTypeCompatibility = typeof relationshipTypeCompatibility.$inferInsert;
export type KnowledgeRelationship = typeof knowledgeRelationships.$inferSelect;
export type NewKnowledgeRelationship = typeof knowledgeRelationships.$inferInsert;
